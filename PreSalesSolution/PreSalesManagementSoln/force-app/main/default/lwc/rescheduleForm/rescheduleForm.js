import { LightningElement,track ,api } from 'lwc';

import Id from '@salesforce/user/Id';

export default class ModalPopupLWC extends LightningElement {

    @track isShowing = false;

    @api showModal = (activity) => {
        if (activity !== this.activity) {
            this.activity = activity
        }

        this.isShowing = true

        this.toggleModalClasses()
    }

    closeModal = (evt) => {
        this.dispatchEvent(evt)
        
        this.toggleModalClasses()

        this.isShowing = false
    }    
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses = () => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }
    

    dateInputHandler = (evt) => {
        let name = evt.target.dataset.item

        this[name] = evt.target.value
    }

    date1 = ''

    get isSubmitDisabled() {
        return this.date1 === ''
    }

    //PATCH date and time
    url = 'http://localhost:8080/api/activity/'

    handleUploadAction(){
    let memberId = Id ? Id : '0055f0000041g1mAAA'
    let activity_ID = this.activity.activity_ID;
    let pushingData = {

        "createdByMember": memberId,
        "status" : "Reschedule",
        "oneDateTime" : this.date1 ? this.date1 : null,
        "twoDateTime": this.date2 ? this.date2 : null,
        "threeDateTime": this.date3 ? this.date3 : null
    }

    fetch(this.url + activity_ID  + '/', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushingData),
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        this.closeModal(new CustomEvent('submit'))
    }

    cancelHandler = () => { 
        this.closeModal(new CustomEvent('cancel'))
    }
}