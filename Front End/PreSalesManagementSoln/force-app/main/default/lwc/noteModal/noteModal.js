import { LightningElement, api } from 'lwc';

export default class NoteModal extends LightningElement {   
    @api showModal(activity) {
        this.notesView = this.template.querySelector('c-notes-view')

        this.activityID = activity.activity_ID
        
        this.notesView.setAttribute('data-activity-id', this.activityID)
        
        this.toggleModalClasses()

        this.notesView.init()
    }

    closeModal = () => {
        this.toggleModalClasses()

        this.notesView.reset()
    }
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses() {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 
            'slds-modal' : 'slds-modal slds-fade-in-open'
            
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 
            'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }
}