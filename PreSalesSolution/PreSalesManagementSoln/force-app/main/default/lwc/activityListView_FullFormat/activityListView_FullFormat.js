import { LightningElement, api, track } from 'lwc';
import Id from "@salesforce/user/Id"
import { fetchSalesforceUsers, fetchOpportunities, fetchProducts, fetchActivityTypes } from 'c/dataUtils';

export default class ActivityListView_AppTab extends LightningElement {
    @api opportunityId 

    connectedCallback() {
        this.getMemberOptions()
        this.getRecordOptions()
        this.getProductOptions()
        this.getActivityTypeOptions()
    }

    filtersShowing = false

    get filterBtnLabel() {
        return this.filtersShowing ? 'Hide Filters' : 'Show Filters'
    }

    toggleFilters = () => {
        this.filtersShowing = !this.filtersShowing
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

    selectStatus = (evt) => {
        this.template.querySelector('c-activity-list-view').status = evt.target.value

        this.reloadTable()
    }

    @track accountOptions = []
    @track opportunityOptions = []

    async getRecordOptions() {
        this.opportunities = await fetchOpportunities()

        this.opportunityOptions = this.opportunities.map(opportunity => ({
            label: opportunity.Name,
            value: opportunity.Id
        }))

        const allOption = {label: 'All', value: ''}

        this.opportunityOptions.unshift(allOption)

        this.opportunityOptions_unmodified = [...this.opportunityOptions]

        let accounts = this.opportunities.map(opportunity => ({
            label: opportunity.AccountName,
            value: opportunity.AccountId
        }))

        const accountIdSet = new Set(accounts.map(account => account.value))

        this.accountOptions = [...accountIdSet].map(accountId => accounts.find(account => account.value === accountId))
        this.accountOptions.unshift(allOption)
    }

    @track showNewActivityBtn = false

    selectAccount = (evt) => {
        this.template.querySelector('.select-opportunity').value = ''
        let listView = this.template.querySelector('c-activity-list-view')

        listView.recordType = 'account'
        listView.recordId = evt.target.value
        
        this.opportunityOptions = [...this.opportunityOptions_unmodified]

        if(listView.recordId !== '') {
            const relatedOpportunities = this.opportunities.filter(opportunity => opportunity.AccountId === listView.recordId).map(opportunity => opportunity.Id)

            this.opportunityOptions = this.opportunityOptions.filter(opportunity => relatedOpportunities.includes(opportunity.value) || opportunity.value === '')
        }

        this.showNewActivityBtn = false
        
        this.reloadTable()
    }

    selectOpportunity = (evt) => {
        let listView = this.template.querySelector('c-activity-list-view')

        listView.recordType = 'opportunity'
        listView.recordId = evt.target.value

        this.template.querySelector('c-sales-request-form').opportunity = listView.recordId

        this.showNewActivityBtn = listView.recordId !== ''

        this.reloadTable()
    }

    get newActivityLabel() {
        return this.user.user_role.name !== 'Sales Representative' ? 'Create Activity' : 'Request Activity'
    }

    async getProductOptions() {
        let products = await fetchProducts()

        this.productOptions = products.map(product => ({
            label: product.name,
            value: product.product_ID.toString()
        }))

        this.productOptions.unshift({label: 'All', value: ''})
    }

    selectProduct = (evt) => {
        this.template.querySelector('c-activity-list-view').product = parseInt(evt.target.value, 10)

        this.reloadTable()
    }

    async getActivityTypeOptions() {
        let activityTypes = await fetchActivityTypes()

        this.activityTypeOptions = activityTypes.map(activityType => ({
            label: activityType.name,
            value: activityType.name
        }))

        this.activityTypeOptions.unshift({label: 'All', value: ''})
    }

    selectActivityType = (evt) => {
        this.template.querySelector('c-activity-list-view').activityType = evt.target.value

        this.reloadTable()
    }

    setStartDate = (evt) => {
        this.template.querySelector('c-activity-list-view').dateRangeStart = new Date(evt.target.value)

        this.reloadTable()
    }
    
    setEndDate = (evt) => {
        this.template.querySelector('c-activity-list-view').dateRangeEnd = new Date(evt.target.value)

        this.reloadTable()
    }

    clearDates = () => {
        this.template.querySelectorAll('.date-input').forEach(dateInput => {dateInput.value = null})

        let listView = this.template.querySelector('c-activity-list-view')
        
        listView.dateRangeEnd = null
        listView.dateRangeEnd = null

        this.reloadTable()
    }

    async getMemberOptions() {
        let members = await fetchSalesforceUsers()

        this.user = members.find(member => member.Id === (Id ? Id : '0055f0000041g1mAAA'))
        this.template.querySelector('c-sales-request-form').userProfile = this.user.user_role.name

        let presalesMembers = members.filter(member => member.user_role.name === 'Presales Member')

        this.memberOptions = presalesMembers.map(member => ({
            label: member.Name,
            value: member.Id
        }))        
        
        this.memberOptions.unshift({label: 'All', value: ''})
    }

    selectMember = (evt) => {
        this.template.querySelector('c-activity-list-view').member = evt.target.value

        this.reloadTable()
    }

    reloadTable = () => {
        this.template.querySelector('c-activity-list-view').loadTableRows()
    }

    openRequestForm() {
        this.template.querySelector('c-sales-request-form').openModal()
    }
}
