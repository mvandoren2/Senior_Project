import { LightningElement, track, wire, api } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";
//import Id from '@salesforce/user/Id';

export default class preSalesTeamAssignmentForm extends LightningElement {

    salesforceUsers = [];
    activityID;

    //functions to show and hide modal    
    handleFetch() {
        fetch('http://localhost:8080/api/get_activity/')
            .then(response => response.json())
            .then(data => {
                this.activity = data[0].activity_ID;
                console.log(this.activity);
            });
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'

    @api toggleShow = (rowID) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.activityID = rowID
    }

    //get the users from salesforce
    members;
    error;

    @wire(getPreSalesTeamMembers) teamMember({error,data}){
        if(data){
            for(let i=0; i < data.length; i++){
                this.salesforceUsers[i] = data[i].Id;
            }
            this.members = data;
            this.error = undefined;
            
        } else if(error){
            this.error = error;
            console.log("error");
        }
    }

    pushingData = {
        "activity_ID": 4,
        "members": this.salesforceUsers
    }

    pushData(){
        console.log(this.pushingData);

        fetch('http://localhost:8080/api/add_members/', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.pushingData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

