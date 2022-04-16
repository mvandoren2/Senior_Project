import { LightningElement,track } from 'lwc';
export default class ModalPopupLWC extends LightningElement {

    
    @track isModalOpen = false;
    openModal() {
        
        this.isModalOpen = true;
    }
    closeModal() {
       
        this.isModalOpen = false;
    }


    dateInputHandler = (evt) => {
        let name = evt.target.dataset.item

        this[name] = evt.target.value

        this.setDisableButton()
    }

    alternateDates = false 
    showAlternateDates = () => {
        this.alternateDates = !this.alternateDates
    }

    isSubmitDisabled = true
    setDisableButton() {
        this.isSubmitDisabled = !(
            this.date1
        )
    }

    //PATCH date and time 
    handleUploadAction(){

    let pushingData = {
        "oneDateTime" : this.date1,
        "twoDateTime": this.date2 ? this.date2 : null,
        "threeDateTime": this.date3 ? this.date3 : null
    }

    fetch('http://localhost:8080/api/activity/<activity_ID>/', {
            method: 'PATCH', 

            body: JSON.stringify(pushingData),
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    }



}