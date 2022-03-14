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
}