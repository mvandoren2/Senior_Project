import { LightningElement,api,track } from 'lwc';

export default class StatusChangeModal extends LightningElement {

    activityID;

    @api toggleShow = (rowID) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.activityID = rowID
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'

    //push the data to backend
    declineActivity(){
        
        let activity_ID = this.activityID.activity_ID;

        //create a json to push
        let pushingData = {
            'status': "Decline"
        };

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
}