import { api, LightningElement, track } from 'lwc';

export default class ActivityListView_Opportunity extends LightningElement {
    @api opportunityId 

    @track status = 'current'

    statusOptions = [
        {label: '--- All Current ---', value: 'current'},
        {label: '--- All Accepted ---', value: 'accepted'},
        {label: 'Accept', value: 'Accept'},
        {label: 'Scheduled', value: 'Scheduled'},
        {label: '--- All Request ---', value: 'requests'},
        {label: 'Request', value: 'Request'},
        {label: 'Reschedule Request', value: 'Reschedule'},
        {label: '--- All Past ---', value: 'past'},
        {label: 'Completed', value: 'Complete'},
        {label: 'Cancelled', value: 'Cancel'},
        {label: 'Expired', value: 'Expire'}
    ]

    selectStatus = (evt) => {
        this.status = evt.target.value

        let listView = this.template.querySelector('c-activity-list-view')

        listView.setAttribute('data-status', this.status)

        listView.loadTableRows()
    }

    get opportunityIdTesting () {
        return this.opportunityId ? this.opportunityId : '0065f000008xnXzAAI'
    }

    openRequestForm = () => {
        this.template.querySelector('c-sales-request-form').toggleModalClasses()
    }
}