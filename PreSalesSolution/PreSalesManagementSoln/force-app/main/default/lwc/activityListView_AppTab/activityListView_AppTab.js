import { LightningElement, api, track } from 'lwc';
import Id from "@salesforce/user/Id"
import { url } from 'c/dataUtils';
import GetNinjaUsers from '@salesforce/apex/GetNinjaUsers.GetNinjaUsers';

export default class ActivityListView_AppTab extends LightningElement {
    @api opportunityId 

    connectedCallback() {
        this.fetchMemberOptions()
    }

    @track newActivityLabel = ''

    async fetchMemberOptions() {

        let ninjaMembers = await fetch(url)
            .then(res => res.json())

        let salesforceMembers = await GetNinjaUsers({user_Ids: ninjaMembers.map(member => member.external_member_ID)})

        ninjaMembers.forEach(member => {
            member.salesforceData = salesforceMembers.find(sfMember => sfMember.Id === member.external_member_ID)
        })

        let ninjaMembers_sales = ninjaMembers.filter(member => member.user_role.name === 'Sales Representative')
        let ninjaMembers_presalesTeam = ninjaMembers.filter(member => member.user_role.name === 'Presales Member')
        let ninjaMembers_managers = ninjaMembers.filter(member => member.user_role.name === 'Presales Manager')

        this.currentUser = ninjaMembers.find(member => member.external_member_ID === Id)
        this.members_all = ninjaMembers_presalesTeam.concat(ninjaMembers_sales)
        this.managers = ninjaMembers_managers

    }

    recordType = ''
    recordId = ''

    getRecordOptions() {

    }

    status = 'current'

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

    selectStatus(evt) {
        this.status = evt.target.value

        let listView = this.template.querySelector('c-activity-list-view')

        listView.setAttribute('data-status', this.status)

        listView.loadTableRows()
    }

    memberId = ''

    getMemberOptions() {

    }

    get opportunityIdTesting () {
        return this.opportunityId ? this.opportunityId : '0065f000008xnXzAAI'
    }

    openRequestForm() {
        this.template.querySelector('c-sales-request-form').toggleModalClasses()
    }
}