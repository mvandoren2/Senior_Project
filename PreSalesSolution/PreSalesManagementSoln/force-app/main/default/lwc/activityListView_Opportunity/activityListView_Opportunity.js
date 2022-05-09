import { api, LightningElement, track } from 'lwc';
import Id from "@salesforce/user/Id"
import { url } from 'c/dataUtils';

export default class ActivityListView_Opportunity extends LightningElement {
    @api recordId 

    connectedCallback() {
        this.fetchCurrentUser()
    }

    @track newActivityLabel = ''

    fetchCurrentUser() {
        const userID = Id ? Id : '0055f0000041g1mAAA'
        const urlString = url + 'member/' + userID + '/'

        fetch(urlString)
            .then(res => res.json())
            .then(user => {
                this.userProfile = user.user_role.name

                this.template.querySelector('c-sales-request-form').userProfile = this.userProfile

                const userIsPresales = this.userProfile !== 'Sales Representative'
                this.newActivityLabel = userIsPresales ? 'Create a New Activity' : 'Request a New Activity'
            })
    }

    statusOptions = [
        {label: '--- All Activities/Requests ---', value: ''},
        {label: '--- All Current Activities/Requests ---', value: 'current'},
        {label: '--- All Accepted Activities ---', value: 'accepted'},
        {label: 'Unscheduled Activities', value: 'Accept'},
        {label: 'Scheduled Activities', value: 'Scheduled'},
        {label: '--- All Requests ---', value: 'requests'},
        {label: 'New Activity Requests', value: 'Request'},
        {label: 'Reschedule Requests', value: 'Reschedule'},
        {label: '--- All Past Activities ---', value: 'past'},
        {label: 'Completed Activities', value: 'Complete'},
        {label: 'Cancelled Activities', value: 'Cancel'},
        {label: 'Expired Activities', value: 'Expire'}
    ]

    reloadTable = () => {
        this.template.querySelector('c-activity-list-view').loadTableRows()
    }

    selectStatus = (evt) => {
        this.template.querySelector('c-activity-list-view').status = evt.target.value

        this.reloadTable()
    }

    get opportunityIdTesting () {
        return this.recordId ? this.recordId : '0065f000008xnXzAAI'
    }

    openRequestForm() {
        this.template.querySelector('c-sales-request-form').openModal()
    }
}