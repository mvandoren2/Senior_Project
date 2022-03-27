import { LightningElement, track, api, wire } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";
import fetchAllMemebers from './fetchHelper';

export default class AssignTeamModal extends LightningElement {
    
    activity;
    @track modalTab = ""

    @api toggleShow = (row) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.isShowing = !this.isShowing

        //execute the function only once
        if(row !== undefined && row !== this.activity) {
            this.activity = row;
            this.handleAllWireFunction();
        }
        else if(row === undefined) {
            let reloadParentTable = new CustomEvent('reloadtablerows')
            this.dispatchEvent(reloadParentTable)
        }
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'

    djangoUsers = [];
    djangoActivityUsersId = [];
    djangoUserID = [];
    @track commonUsersInfo = [];
    @track selectedUsersInfo = [];
    @track unAssignedUsersInfo = [];
    @track filteredSelectedUsersInfo;
    @track filteredUnAssignedUsersInfo;
    selectedUsersId = [];
    @track leadMemberId;

    //fetch all members and selected members from djangodb
    membersFetched = false;
    async handleAllFetch() {
        const members = await fetchAllMemebers();
        this.djangoUsers = members;

        //save the id of all the members in the db
        this.djangoUserID = this.djangoUsers.map(user => user.external_member_ID)
                    
        this.membersFetched = true;
    }

    error;
    salesforceUsers;

    //wire and get the users from the salesforce
    @wire(getPreSalesTeamMembers) teamMembers({error, data}){
        if(data){
            this.salesforceUsers = data;
            this.error = undefined;
        } else if(error){
            this.error = error;
            console.error(error);
        }
    }

    //main method: filter data for use in the template
    async handleAllWireFunction(){
        //wait for fetching of data from djangodb
        if(!this.membersFetched) await this.handleAllFetch();

        //fetch data of selected users and save their id to arrays
        this.selectedUsersId = this.activity.members.map(member => member.external_member_ID)
        this.djangoActivityUsersId = [...this.selectedUsersId]

        //get the users from salesforce, compare the ids to all members and if match save to any array
        this.commonUsersInfo = []

        let commonUsersInfo = [...this.salesforceUsers].filter(user => this.djangoUserID.includes(user.Id))

        //add proficiency field to all users

        commonUsersInfo.forEach((user, i) => {
            let djangoUser = this.djangoUsers.filter(dUser => dUser.external_member_ID === user.Id)[0]

            let commonUser = Object.create(user)
                
            commonUser.proficiency = djangoUser.proficiency
            commonUser.role = djangoUser.user_role
            commonUser.leadState = false

            this.commonUsersInfo[i] = commonUser
        })

        //get the users from salesforce, compare the ids to selected members and if match save to any array
        this.selectedUsersInfo = this.commonUsersInfo.filter(user => this.djangoActivityUsersId.includes(user.Id))


        this.selectedUsersInfo.forEach((user, i) => {
            if(this.activity.leadMember){
                if(this.selectedUsersInfo[i].Id === this.activity.leadMember.external_member_ID){
                    this.leadMemberId = this.selectedUsersInfo[i].Id;
                    this.selectedUsersInfo[i].leadState = true;
                }
            }
        })

        //get all the unassigned users by filtering selcted and all
        this.unAssignedUsersInfo = this.commonUsersInfo.filter(val => !this.selectedUsersInfo.includes(val));

        this.filteredUnAssignedUsersInfo = this.unAssignedUsersInfo;

        this.filteredSelectedUsersInfo = this.selectedUsersInfo;
    }

    //search input function
    searchUsers = (evt) => {
            const value = evt.target.value.toLowerCase();
            this.filteredSelectedUsersInfo = this.selectedUsersInfo.filter(item => item.Name.toLowerCase().includes(value));
            this.filteredUnAssignedUsersInfo = this.unAssignedUsersInfo.filter(item => item.Name.toLowerCase().includes(value));
    }

    //onclick change the button label and save the data to selected array
    handleAssign(evt) {
        if(evt.target.label === "Assign"){
            this.selectedUsersId.push(evt.target.dataset.item);
            let index;

            for(let i=0; i < this.filteredUnAssignedUsersInfo.length; i++){
                if(this.filteredUnAssignedUsersInfo[i].Id == evt.target.dataset.item){
                    this.selectedUsersInfo.push(this.filteredUnAssignedUsersInfo[i]);
                    index = i;
                }
            }

            if(index > -1){
                this.filteredUnAssignedUsersInfo.splice(index, 1);
            }
            
        }
    }

    handleRemove(evt){
        let index;
        for(let i=0; i < this.selectedUsersInfo.length; i++){
            if(this.selectedUsersInfo[i].Id == evt.target.dataset.item){
                this.filteredUnAssignedUsersInfo.push(this.selectedUsersInfo[i]);
                index = i;
            }
        }

        if(index > -1){
            this.selectedUsersInfo.splice(index, 1);
        }

        //remove the unassigned user
        const anotherIndex = this.selectedUsersId.indexOf(evt.target.dataset.item);

        if(index > -1){
            this.selectedUsersId.splice(anotherIndex, 1);
        }
    }

    handleLead(evt){

        if(!this.leadMemberId){
            evt.target.selected = !(evt.target.selected);
            this.leadMemberId = evt.target.dataset.item;
        } else if(this.leadMemberId && this.leadMemberId == evt.target.dataset.item){
            evt.target.selected = !(evt.target.selected);
            this.leadMemberId = null;
        } else {
            alert("Lead already selected");
        }
    }

    //push the data to backend
    pushData(){

            let activity_ID = this.activity.activity_ID;
    
            //create a json to push
            let pushingData = {
                'members': this.selectedUsersId,
                'leadMember': this.leadMemberId
            };

            fetch('http://localhost:8080/api/activity/' + activity_ID + '/', {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pushingData),
            })
            .catch((error) => {
                console.error('Error:', error);
            });

            let lead = {
                'leadMember': this.leadMemberId
            }
    }

    //save button action
    pushDataAndToggle(){
        this.pushData();
        this.toggleShow();
    }

    closeModal(){
        this.toggleShow();
    }
}
