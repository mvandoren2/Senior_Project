import { LightningElement,api,track } from 'lwc';
import uId from '@salesforce/user/Id';

export default class StatusChangeModal extends LightningElement {

    activityID;
    userId = uId;
    declineMessage;
    @track submitStatus = true;

    @api toggleShow = (rowID) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.activityID = rowID
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'

    setDisableButton(){
        this.declineMessage = this.template.querySelector("lightning-textarea").value;
        this.submitStatus = !(this.declineMessage !== '');
    }

    //push the data to backend
    declineActivity(){

        let activity_ID = this.activityID.activity_ID;

        //create a json to push
        let pushingData = {
            'status': "Decline"
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

        let notesData = {
            'member': this.userId,
            'note_text': this.declineMessage
        }

        fetch('http://localhost:8080/api/activity/' + activity_ID + '/notes/', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notesData),
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        this.template.querySelector("lightning-textarea").value = "";
        this.toggleShow();
    }
}