import { LightningElement,track ,api } from 'lwc';

import Id from '@salesforce/user/Id';

export default class ModalPopupLWC extends LightningElement {

    
    @track isShowing = false;

    @api showModal = async (activity) => {        
        this.patchActivity = this.getAttribute('data-patchactivity') === 'true' ?
            true : false
        
        if(this.activity !== activity){
            this.activity = activity; 
            
        }       

        this.isShowing = true
        
    }

    closeModal = (evt) => {
        
        this.isShowing = false
        
    }
    

    dateInputHandler = (evt) => {
        let name = evt.target.dataset.item

        this[name] = evt.target.value

        this.setDisableButton()
    }


    isSubmitDisabled = true
    setDisableButton() {
        this.isSubmitDisabled = !(
            this.date1
        )
    }

    //PATCH date and time 

    url = 'http://localhost:8080/api/activity/'

    handleUploadAction(){
    let memberId = Id ? Id : '0055f0000041g1mAAA'

    let pushingData = {

        "createdByMember": memberId,
        "status" : "Reschedule",
        "oneDateTime" : this.date1,
        "twoDateTime": this.date2 ? this.date2 : null,
        "threeDateTime": this.date3 ? this.date3 : null
    }

    fetch(this.url + this.activity.activity_ID + '/', {
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