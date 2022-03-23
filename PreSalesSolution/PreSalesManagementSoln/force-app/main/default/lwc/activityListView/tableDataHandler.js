import getPreSalesTeamMembers from "@salesforce/apex/GetUsers.getPreSalesTeamMembers"
import OpportunityData from "@salesforce/apex/OpportunityData.OpportunityData"
import Id from "@salesforce/user/Id"

Array.prototype.toDisplayString = function() {
    return this.map((str) =>(str.name ? str.name : str.Name)).join(', ')
}

export const url = 'http://localhost:8080/api/'

export class TableDataHandler {
    emptyActivity = {
        id: '',
        account: '',
        opportunity: '',
        product: '',
        activity: '',
        time: '',
        location: '',
        submittedBy: '',
        description: '',
        status: ''
    }

    fetchRequests = () => {
        return fetch(url + 'get_activity/')
            .then(res => res.json())
    }

    fetchCurrentUser = () => {
        const userID = Id ? Id : '0055f0000041g1mAAA'
        const urlString = url + 'get_member/' + userID + '/null/'

        return fetch(urlString)
            .then(res => res.json())
    }

    fetchOpportunities = async (requests) => {
        const opportunity_IDs = requests.map(request => request.opportunity_ID)

        let apexAccountData = await OpportunityData({opportunity_IDs: opportunity_IDs})

        return apexAccountData.map(account => ({
            Id : account.Opportunities[0].Id,
            Name : account.Opportunities[0].Name,
            AccountId : account.Id,
            AccountName: account.Name
        }))
    }

    //
    //Data processing utilities
    //

    //builds a formatted string from a JS Date object
    dateStringUtil = (date) => {
        const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        const pm = date.getHours() > 11
    
        return days[date.getDay()] + ' ' + 
            months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' +
            ' @ ' + date.getHours() % 12 + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + (pm ? 'PM' : 'AM')
    }
    
    getMemberByID = (member_ID) => {
        let member = this.salesforceMembers.filter(user => user.Id === member_ID)
    
        return member === [] ? console.error('Team member ID not found') : member[0]
    }
    
    getTeamMembers = (request) => {
        return request.members
            .map(member => this.getMemberByID(member.external_presales_member_ID))
            .filter(member => member)
    }
    
    getOpportunity = (opportunity_ID) => {
        let myOpportunity = this.opportunities.filter(opportunity => opportunity.Id === opportunity_ID)
    
        return myOpportunity === [] ? console.error('Opportunity not found') : myOpportunity[0]
    }


    generateDisplayRow = (request) => {
        let newRow = Object.assign({}, this.emptyActivity)

        const opportunity = this.getOpportunity(request.opportunity_ID)
        let selectedDate = new Date(request.selectedDateTime)
        
        newRow.id = request.activity_ID
        newRow.account = opportunity.AccountName
        newRow.opportunity = opportunity.Name
        newRow.product = request.products.toDisplayString()
        newRow.activity = request.activtyType
        newRow.location = request.location
        newRow.time =  selectedDate > new Date() ? this.dateStringUtil(selectedDate) : ''
        newRow.submittedBy = this.getTeamMembers(request).toDisplayString()
        newRow.description = request.description
        newRow.status = request.status
    
        return newRow
    }

    //
    //Serve Processed Table Data, getEmptyTableData() is to render the table before the async method completes
    //

    getEmptyTableData = () => {
        return {
            dislpay: [this.emptyActivity],
            detailed: []
        }
    }

    getTableData = async () => {
        let [currentUser, salesforceMembers, rawData] = await Promise.all([this.fetchCurrentUser(), getPreSalesTeamMembers(), this.fetchRequests()])

        if (!rawData.length) return this.getEmptyTableData()

        this.salesforceMembers = salesforceMembers
        this.opportunities = await this.fetchOpportunities(rawData);

        let dislpayData = rawData.map(request => this.generateDisplayRow(request))
    
        return {
            dislpay: dislpayData, 
            detailed: rawData,
            user: currentUser[0]
        }
    }
}
