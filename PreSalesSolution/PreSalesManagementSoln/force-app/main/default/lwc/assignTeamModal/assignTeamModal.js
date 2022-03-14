import { LightningElement, track, api, wire } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";
import fetchAllMemebers from './fetchHelper';

export default class AssignTeamModal extends LightningElement {
    
    activityID;

    @api toggleShow = (rowID) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.activityID = rowID;
        //execute the function only once
        if(!this.executed) this.handleAllWireFunction();
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'

    djangoUsers = [];
    djangoActivityUsersId = [];
    djangoUserID = [];
    @track commonUsersInfo = [];
    @track selectedUsersInfo = [];
    @track unAssignedUsersInfo = [];
    selectedUsersId = [];

    //fetch all members and selected members from djangodb
    executed2 = false;
    async handleAllFetch() {
        
        const data = await fetchAllMemebers();
        this.djangoUsers = data;

        //save the id of all the members in the db
        for(let i=0; i < this.djangoUsers.length; i++){
            if(this.djangoUsers[i].user_role.name == "Pre Sales Member"){
                this.djangoUserID.push(this.djangoUsers[i].external_presales_member_ID);
            }
        }

        console.log(this.activityID);
        //fetch data of selected users and save their id to arrays
        await fetch('http://localhost:8080/api/get_activity/')
            .then(response => response.json())
            .then(data => {
                for(let j=0; j<data.length; j++){
                    if(data[j].activity_ID == this.activityID){
                        for(let i=0; i < data[j].members.length; i++){
                            this.djangoActivityUsersId.push(data[j].members[i].external_presales_member_ID);
                            this.selectedUsersId.push(data[j].members[i].external_presales_member_ID);
                        } 
                    }
                }
                    
            }); 

            this.executed2 = true;
    }


    error;
    data;
    //wire and get the users from the salesforce
    @wire(getPreSalesTeamMembers) teamMembers({error, data}){
        if(data){
            this.data = data;
            this.error = undefined;
        } else if(error){
            this.error = error;
            console.log(error);
        }
    }

    //main method: filter data for use in the template
    executed = false;
    async handleAllWireFunction(){

        //wait for fetching of data from djangodb
        if(!this.executed2) await this.handleAllFetch();

        //get the users from salesforce, compare the ids to all members and if match save to any array
        outerLoop:
        for(let i=0; i < this.djangoUserID.length; i++){
            innerLoop:
                for(let j=0; j < this.data.length; j++){
                    if(this.djangoUserID[i] == this.data[j].Id){
                        this.commonUsersInfo.push(this.data[j]);
                        break innerLoop;
                    }
                }
        }

         //get the users from salesforce, compare the ids to selected members and if match save to any array
        outerLoop:
        for(let i=0; i < this.djangoActivityUsersId.length; i++){
            innerLoop:
                for(let j=0; j < this.data.length; j++){
                    if(this.djangoActivityUsersId[i] == this.data[j].Id){
                        this.selectedUsersInfo.push(this.data[j]);
                        break innerLoop;
                    }
                }
        } 

        //get all the unassigned users by filtering selcted and all
        this.unAssignedUsersInfo = this.commonUsersInfo.filter(val => !this.selectedUsersInfo.includes(val));

        //add proficiency field object to assigned users
        outerLoop:
        for(let i=0; i < this.selectedUsersInfo.length; i++){
        innerLoop:
            for(let j=0; j < this.djangoUsers.length; j++){
                if(this.selectedUsersInfo[i].Id == this.djangoUsers[j].external_presales_member_ID){
                    this.selectedUsersInfo[i] = Object.assign({proficiency: this.djangoUsers[j].proficiency}, this.selectedUsersInfo[i]);
                    break innerLoop;
                }
            }
        }  

        //add proficiency field object to unassigned users
        outerLoop:
        for(let i=0; i < this.unAssignedUsersInfo.length; i++){
        innerLoop:
            for(let j=0; j < this.djangoUsers.length; j++){
                if(this.unAssignedUsersInfo[i].Id == this.djangoUsers[j].external_presales_member_ID){
                    this.unAssignedUsersInfo[i] = Object.assign({proficiency: this.djangoUsers[j].proficiency}, this.unAssignedUsersInfo[i]);
                    break innerLoop;
                }
            }
        }  

        this.filteredUnAssignedUsersInfo = this.unAssignedUsersInfo;

        this.executed = true;
    }

    @track filteredSelectedUsersInfo = this.selectedUsersInfo;
    @track filteredUnAssignedUsersInfo;

    //search input function
    searchUsers = (evt) => {
            const value = evt.target.value.toLowerCase();
            this.filteredSelectedUsersInfo = this.selectedUsersInfo.filter(item => item.Name.toLowerCase().includes(value));
            this.filteredUnAssignedUsersInfo = this.unAssignedUsersInfo.filter(item => item.Name.toLowerCase().includes(value));
    }

    //onclick change the button label and save the data to selected array
    handleClick(evt) {

        console.log(this.filteredUnAssignedUsersInfo)

        if(evt.target.label == "Assign"){
            evt.target.label = "UnAssign";
            this.selectedUsersId.push(evt.target.dataset.item);
        } else {
            evt.target.label = "Assign"

           //remove the unassigned user
           const index = this.selectedUsersId.indexOf(evt.target.dataset.item);
           if(index > -1){
               this.selectedUsersId.splice(index, 1);
           }

           console.log(this.selectedUsersId);
        }
    }

    //push the data to backend
    pushData(){
        //create a json to push
        let pushingData = {
            'activity_ID': parseInt(this.activityID),
            'members': this.selectedUsersId,
        };

        console.log(pushingData)
        fetch('http://localhost:8080/api/add_members_date/', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushingData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    //save button action
    pushDataAndToggle(){
        this.pushData();
        this.toggleAndReload();
    }

    //closing the modal
    toggleAndReload(){
        this.toggleShow();
        document.location.reload();
    }
}