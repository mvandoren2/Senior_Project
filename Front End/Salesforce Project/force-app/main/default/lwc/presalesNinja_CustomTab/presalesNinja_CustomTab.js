import { LightningElement, track } from 'lwc';
import { url } from 'c/dataUtils';

export default class PresalesNinja_CustomTab extends LightningElement {
    connectedCallback() {
        this.getRequestCount()
    }

    @track requestCount = 0

    getRequestCount() {
        fetch(url + 'activities/requests/')
            .then(res => res.json())
            .then(data => {this.requestCount = data.length})
    }

    @track showRequests = true
    @track showActivities = false
    @track showAdmin = false

    selectView = (evt) => {
        const view = evt.detail.name

        switch(view) {
            case 'requests': {
                this.showRequests = true
                this.showActivities = false
                this.showAdmin = false
                break
            }

            case 'activities': {
                this.showRequests = false
                this.showActivities = true
                this.showAdmin = false
                break
            }

            case 'admin': {
                this.showRequests = false
                this.showActivities = false
                this.showAdmin = true
                break
            }
            
            default:
                this.showRequests = true
                this.showActivities = false
                this.showAdmin = false
                break
        }
    }
}               