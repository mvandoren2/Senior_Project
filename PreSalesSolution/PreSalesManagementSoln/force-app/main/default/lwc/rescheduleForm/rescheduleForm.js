import { LightningElement, api } from 'lwc';
import { url } from 'c/dataUtils';

import Id from '@salesforce/user/Id';

export default class ModalPopupLWC extends LightningElement {
    connectedCallback() {
        this.editVariant = this.getAttribute('data-variant') === 'edit'
    }

    isShowing = false;

    @api showModal(activity) {
        if (activity !== this.activity) {
            this.activity = activity
        }

        this.isShowing = true
        
        this.setViewState()

        this.toggleModalClasses()
    }

    closeModal(evt) {
        this.dispatchEvent(evt)
        
        this.toggleModalClasses()

        this.isShowing = false
    }    
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses() {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }

    setViewState() {
        if(this.editVariant) {
            this.modalTitle = 'Edit Requested Dates'
            this.showRescheduleText = false
            this.inputLabel = 'New Date Options'
            this.submitLabel = 'Update'
        }

        else {
            this.modalTitle = 'Reschedule Activity'
            this.showRescheduleText = true
            this.inputLabel = 'Reschedule Options'
            this.submitLabel = 'Request Reschedule'
        }
    }
    
    dates = []

    dateInputHandler = (evt) => {
        let name = evt.target.dataset.item

        this[name] = evt.target.value

        this.dates.push(
            this.buildDateObject(this[name])
        )
    }

    buildDateObject(date) {
        date = new Date(date)

        return {
            date: date,
            localeString: this.dateStringUtil(date),
            selected: false
        }
    }

    //builds a formatted string from a JS Date object
    dateStringUtil(date) {        
        const dateDisplayOptions = {
            weekday:'short', 
            month:"numeric", 
            day:'numeric', 
            year:'2-digit', 
            hour:'numeric', 
            minute:'2-digit', 
            hourCycle:'h12'
        }

        const dateString = date.toLocaleString('en-US', dateDisplayOptions)
            
        return dateString
    }

    date1 = ''

    get isSubmitDisabled() {
        return this.date1 === ''
    }

    submitHandler = () => {
        this.patchDates()
        
        const newDateSignal = new CustomEvent('submit', {
            detail: {
                dates: this.dates
            }
        })

        this.closeModal(newDateSignal)
    }

    //PATCH date and time
    patchDates() {
        let memberId = Id ? Id : '0055f0000041g1mAAA'
        let activity_ID = this.activity.activity_ID;
        let pushingData = {

            "createdByMember": memberId,
            "oneDateTime" : this.date1 ? this.date1 : null,
            "twoDateTime": this.date2 ? this.date2 : null,
            "threeDateTime": this.date3 ? this.date3 : null
        }

        if(!this.editVariant)
            pushingData.status = 'Reschedule'

        fetch(url + 'activity/' + activity_ID  + '/', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushingData),
        })
        .catch((error) => {
            console.error('Error:', error);
        })
    }

    cancelHandler = () => { 
        this.closeModal(new CustomEvent('cancel'))
    }
}