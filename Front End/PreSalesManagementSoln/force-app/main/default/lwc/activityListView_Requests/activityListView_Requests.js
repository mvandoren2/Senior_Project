import { LightningElement, track } from 'lwc';
import Id from "@salesforce/user/Id"
import { url, fetchOpportunities } from 'c/dataUtils';

export default class ActivityListView_Requests extends LightningElement {
    connectedCallback() {
        this.fetchCurrentUser()
        this.getRecordOptions()
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

    reloadTable = () => {
        this.template.querySelector('c-activity-list-view').loadTableRows()
    }

    get opportunityIdTesting () {
        return this.recordId ? this.recordId : '0065f000008xnXzAAI'
    }

    openRequestForm() {
        this.template.querySelector('c-sales-request-form').openModal()
    }
}