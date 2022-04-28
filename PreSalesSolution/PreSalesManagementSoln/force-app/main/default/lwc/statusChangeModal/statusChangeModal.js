import { LightningElement,api } from 'lwc';
import Id from '@salesforce/user/Id';

export default class StatusChangeModal extends LightningElement {
    setStatus = () => {
        this.status = this.getAttribute('data-status')

        switch(this.status) {
            case 'decline': {
                this.modalTitle = 'Decline Activity Request'
                this.noteRequired = true
                this.noteLabel = 'Reason for Declining'
                this.submitLabel = 'Decline Request'
                this.submitVariant = 'destructive'

                this.status = 'Decline'

                break
            }

            case 'cancel': {
                this.modalTitle = 'Cancel Activity'
                this.noteLabel = 'Reason for Canceling'
                this.submitLabel = 'Cancel Activity'
                this.submitVariant = 'destructive'

                this.status = 'Cancel'

                break
            }

            case 'complete': {
                this.modalTitle = 'Complete Activity'
                this.noteLabel = 'Notes'
                this.submitLabel = 'Submit'
                this.submitVariant = 'brand'

                this.status = 'Complete'

                break
            }

            default:
                break
        }
    }

    @api showModal = (activity) => {
        this.setStatus()
        
        this.toggleModalClasses()

        this.activityID = activity.activity_ID
    }

    closeModal = (evt) => {
        this.dispatchEvent(evt)

        this.reset()

        this.toggleModalClasses()
    }
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses = () => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 
            'slds-modal' : 'slds-modal slds-fade-in-open'
            
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 
            'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }

    note = ''
    
    setNoteText = (evt) => {
        this.note = evt.target.value
    }

    noteRequired = false

    get submitIsDisabled(){
        return this.noteRequired && this.note === '';
    }

    cancelHandler = () => { 
        this.closeModal(new CustomEvent('cancel'))
    }

    //push the data to backend
    submitStatusChange(){
        this.patchActivity()
        this.postNote()

        this.closeModal(new CustomEvent('submit'));
    }

    url = 'http://localhost:8080/api/activity/'

    patchActivity = () => {
        let activityPatchBody = {}

        activityPatchBody.status = this.status

        fetch(this.url + this.activityID + '/', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityPatchBody)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    postNote = () => {
        if(this.note !== '') {
            let notePostBody = {
                member: Id ? Id : '0055f0000041g1mAAA',
                note_text: this.note
            }

            fetch(this.url + this.activityID + '/notes/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notePostBody)
            })
        }
    }

    reset = () => {
        this.template.querySelector('lightning-textarea').value = null
    }
}