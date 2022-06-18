import { LightningElement,api } from 'lwc';
import Id from '@salesforce/user/Id';
import { url } from 'c/dataUtils';

export default class StatusChangeModal extends LightningElement {
    setStatus() {
        this.status = this.getAttribute('data-status')

        switch(this.status) {
            case 'decline': {
                this.modalTitle = 'Decline Activity Request'
                this.noteRequired = true
                this.noteLabel = 'Reason for Declining'
                this.submitLabel = 'Decline Request'
                this.submitVariant = 'destructive'
                this.showCompleteInputs = false

                this.status = 'Decline'

                break
            }

            case 'cancel': {
                this.modalTitle = 'Cancel Activity'
                this.noteLabel = 'Reason for Canceling'
                this.submitLabel = 'Cancel Activity'
                this.submitVariant = 'destructive'
                this.showCompleteInputs = false

                this.status = 'Cancel'

                break
            }

            case 'complete': {
                this.modalTitle = 'Complete Activity'
                this.noteLabel = 'Notes'
                this.submitLabel = 'Submit'
                this.submitVariant = 'brand'
                this.showCompleteInputs = true

                this.status = 'Complete'

                break
            }

            case 'delete': {
                this.modalTitle = 'Delete Request'
                this.submitLabel = 'Delete'
                this.submitVariant = 'destructive'
                this.showCompleteInputs = false
                this.deletingRequest = true
                break
            }

            default:
                break
        }
    }

    @api showModal(activity) {
        this.setStatus()
        
        this.toggleModalClasses()

        this.activityID = activity.activity_ID
    }

    closeModal(evt) {
        this.dispatchEvent(evt)

        this.reset()

        this.toggleModalClasses()
    }
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses() {
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

    get submitIsDisabled() {
        return this.noteRequired && this.note === '';
    }

    activityLevelOptions = [
        {label: 'Level 1', value: 'Level 1'},
        {label: 'Level 2', value: 'Level 2'},
        {label: 'Level 3', value: 'Level 3'},
        {label: 'Label 4', value: 'Level 4'}
    ]

    selectActivityLevel = (evt) => {
        this.activityLevel = evt.target.value
    }

    setActivityFlag = (evt) => {
        this.flag = evt.target.value
    }

    cancelHandler() { 
        this.closeModal(new CustomEvent('cancel'))
    }

    //push the data to backend
    submitStatusChange = () =>{
        
        if(!this.deletingRequest) {
            this.patchActivity()
            this.postNote()
        }

        else this.deleteRequest()

        this.closeModal(new CustomEvent('submit'));
    }

    deleteRequest() {
        fetch(url + 'activity/' + this.activityID + '/', {method: 'DELETE'})

        this.deletingRequest = false
    }

    patchActivity() {
        let activityPatchBody = {}

        activityPatchBody.status = this.status

        if(this.activityLevel)
            activityPatchBody.activity_Level = this.activityLevel

        if(this.flag !== undefined)
            activityPatchBody.flag = this.flag

        fetch(url + 'activity/' + this.activityID + '/', {
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

    postNote() {
        if(this.note !== '') {
            let notePostBody = {
                member: Id ? Id : '0055f0000041g1mAAA',
                note_text: this.note
            }

            fetch(url + 'activity/' + this.activityID + '/notes/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notePostBody)
            })
        }
    }

    reset() {
        let textBox = this.template.querySelector('lightning-textarea')
        
        if(textBox)
            textBox.value = null
    }
}