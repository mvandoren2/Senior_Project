import { LightningElement, track, api, wire } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";

export default class AssignTeamModal extends LightningElement {
    _selected = [];
    anArray = [];
    get options() {
        const item = [];
        const newArray = [];

        for(let i=0; i < this.filteredMembers.length; i++){
            newArray[i] = {label: (this.filteredMembers[i].Name), value: this.filteredMembers[i].Id};
        }

        item.push(...newArray);
        return item;
    }

    get values(){
        const item = [];
        const newArray = [];
        for(let i=0; i < this.filteredSelectedMembers.length; i++){
            this._selected[i] = this.filteredSelectedMembers[i].Id;
        }
        item.push(...this._selected);
        return item;
    }

    get selected() {
        return this._selected.length ? this._selected : 'none';
    }

    handleChange(e) {
        this.anArray = e.detail.value;
        console.log(this.anArray);
    }

    salesforceUsers = [];
    dbMemberUserId = [];
    dbselectedMemberUserId = [];

    //functions to show and hide modal    
    connectedCallback() {
        fetch('http://localhost:8080/api/get_members/')
            .then(response => response.json())
            .then(data => {
                for(let i=0; i < data.length; i++){
                    if(data[i].user_role.name == 'Pre Sales Member'){
                        this.dbMemberUserId.push(data[i].external_presales_member_ID);
                    }
                }
            });
        
        fetch('http://localhost:8080/api/get_activity/')
            .then(response => response.json())
            .then(data => {
                for(let i=0; i < data[0].members.length; i++){
                    this.dbselectedMemberUserId.push(data[0].members[i].external_presales_member_ID);
                }
            });  
    }

    //get the users from salesforce
    error;
    filteredMembers = [];
    filteredSelectedMembers = [];
    @wire(getPreSalesTeamMembers) teamMember({error,data}){
        if(data){
            outerLoop:
                for(let i=0; i < this.dbMemberUserId.length; i++){
                    innerLoop:
                        for(let j=0; j < data.length; j++){
                            if(this.dbMemberUserId[i] == data[j].Id){
                                this.filteredMembers.push(data[j]);
                                break innerLoop;
                            }
                        }
                }

            outerLoop1:
                for(let i=0; i < this.dbselectedMemberUserId.length; i++){
                    innerLoop1:
                        for(let j=0; j < data.length; j++){
                            if(this.dbselectedMemberUserId[i] == data[j].Id){
                                this.filteredSelectedMembers.push(data[j]);
                                break innerLoop1;
                            }
                        }
                }
            this.error = undefined;
            
        } else if(error){
            this.error = error;
            console.log("error");
        }
    }

    someArray = []
    pushingData = {
        'activity_ID': 4,
        'members': this.someArray
    };

    pushData(){
        for(let i=0; i<this.anArray.length; i++){
            this.someArray[i] = this.anArray[i];
        }
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

    pushDataAndHideModal(){
        this.pushData();
        this.toggleShow();
    }

    activityID

    @api toggleShow = (rowID) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.activityID = rowID
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'
}