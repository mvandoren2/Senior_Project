import { LightningElement, track, api, wire } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";

export default class AssignTeamModal extends LightningElement {
    
    activity;
    @track modalTab = ""
    @track saveBtnStatus = true;

    @api toggleShow = async (row) => {

        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.isShowing = !this.isShowing

        //execute the function only once
        if(row !== undefined && row !== this.activity) {
            this.activity = row;
            await this.handleAllWireFunction();
        }
        else if(row === undefined) {
            let reloadParentTable = new CustomEvent('reloadtablerows')
            this.dispatchEvent(reloadParentTable)
        }

        //initail check of there is leadMember
        if(this.leadMemberId){
            this.saveBtnStatus = false;
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
    @track filteredUnAssignedUsersInfo;
    selectedUsersId = [];
    @track leadMemberId;

    //fetch all members and selected members from djangodb
    membersFetched = false;
    async handleAllFetch() {
        let members = [];

        await fetch('http://localhost:8080/api/activity/' + this.activity.activity_ID + '/suggested_members/')
            .then(response => response.json())
            .then(data => {
                members = data;
            })
        
        this.djangoUsers = members;
        console.log(this.djangoUsers)
    
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

        let commonUsersInfo = [];

        this.djangoUserID.forEach((user,i) => {
            commonUsersInfo.push((this.salesforceUsers.filter(suser => this.djangoUserID[i] === suser.Id))[0]);
        });

        //add proficiency field to all users
        commonUsersInfo.forEach((user, i) => {
            let djangoUser = this.djangoUsers.filter(dUser => dUser.external_member_ID === user.Id)[0];

            let commonUser = Object.create(user)
            commonUser.proficiency = djangoUser.proficiency
            commonUser.productWeight = djangoUser["Product Weight"];
            commonUser.accountWeight = djangoUser["Account Weight"];
            commonUser.opportunityWeight = djangoUser["Opportunity Weight"];
            commonUser.totalWeight = djangoUser["Total Percentage"];
            commonUser.leadState = false
            commonUser.conflictStatus = djangoUser["Conflict Status"];

            //check if there is a conflict and assign values for the heltext
            if(djangoUser["Conflict Status"] === true){
                let count = 0;
                for(let i=0; i < djangoUser.Conflicts.length; i++){
                    count++;
                }
                commonUser.numOfConflict = "This member has time conflict with " + count + " other active activity!";
            }

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

        //selectedUserInfo save their index
        this.unAssignedUsersInfo.forEach((user, i) => {
            user.index = i;
        })

        this.filteredUnAssignedUsersInfo = this.unAssignedUsersInfo;
    }

    //search input function
    searchUsers = (evt) => {
            const value = evt.target.value.toLowerCase();
            this.filteredUnAssignedUsersInfo = this.unAssignedUsersInfo.filter(item => item.Name.toLowerCase().includes(value));
    }

    //function to change the status of group button
    buttonStatus(evt){
        const btn = this.template.querySelectorAll(".sortBtn");
        btn.forEach((btn,i) => {
            btn.variant = "neutral";
        });
       
        evt.target.variant = "brand";
    }

    //all the sort functions for the button-group
    handleAll(evt){
        this.handleAllWireFunction();
        this.buttonStatus(evt);
    }

    filteredWithProficiency(evt){
        this.filteredUnAssignedUsersInfo.sort((a, b) => b.productWeight - a.productWeight);
        this.buttonStatus(evt);
    }

    filteredWithOpportunity(evt){
        this.filteredUnAssignedUsersInfo.sort((a, b) => b.opportunityWeight - a.opportunityWeight);
        this.buttonStatus(evt);
    }

    filteredWithAccount(evt){
        this.filteredUnAssignedUsersInfo.sort((a, b) => b.accountWeight - a.accountWeight);
        this.buttonStatus(evt);
    }

    //onclick change the button label and save the data to selected array
    handleAssign(evt) {
        if(evt.target.label === "Assign"){
            this.selectedUsersId.push(evt.target.dataset.item);
            let index;

            for(let i=0; i < this.filteredUnAssignedUsersInfo.length; i++){
                if(this.filteredUnAssignedUsersInfo[i].Id === evt.target.dataset.item){
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
            if(this.selectedUsersInfo[i].Id === evt.target.dataset.item){
                this.filteredUnAssignedUsersInfo.splice(this.selectedUsersInfo[i].index, 0 , this.selectedUsersInfo[i]);
                index = i;
            }
        }

        //sort the array according to the total weight 
        this.filteredUnAssignedUsersInfo.sort((a, b) => b.totalWeight - a.totalWeight);

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

        const leadBtn = this.template.querySelectorAll(".leadBtn");

        leadBtn.forEach((btn,i) => {
            btn.selected = false;
        });

        evt.target.selected = true;

        this.leadMemberId = evt.target.dataset.item;

        //make the btn disabled/abled
        if(this.leadMemberId){
            this.saveBtnStatus = false;
        } else {
            this.saveBtnStatus = true;
        }
    }

    //push the data to backend
    pushData(){
            let activity_ID = this.activity.activity_ID;

            let pushingData = {
                'members': this.selectedUsersId,
                'leadMember': this.leadMemberId
            }    

            console.log(pushingData);

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
