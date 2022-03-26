import getPreSalesTeamMembers from "@salesforce/apex/GetUsers.getPreSalesTeamMembers"
import OpportunityData from "@salesforce/apex/OpportunityData.OpportunityData"
import Id from "@salesforce/user/Id"

export const url = 'http://localhost:8080/api/'

export class TableDataHandler {
    emptyActivity = {
        id: '',
        account: '',
        opportunity: '',
        product: '',
        activity: '',
        date: '',
        location: '',
        submittedBy: '',
        presalesTeam: '',
        status: ''
    }

    fetchRequests = () => {
        return fetch(url + 'activities/')
            .then(res => res.json())
    }

    fetchCurrentUser = () => {
        const userID = Id ? Id : '0055f000002RLvpAAG'
        const urlString = url + 'member/' + userID + '/'

        return fetch(urlString)
            .then(res => res.json())
    }

    fetchOpportunities = async (requests) => {
        const opportunity_IDs = requests.map(request => request.opportunity_ID)

        let apexAccountData = await OpportunityData({opportunity_IDs: opportunity_IDs})

        let opportunities = []

        apexAccountData.forEach(account => {
            account.Opportunities.forEach(opportunity => {
                opportunities.push({
                    Id : opportunity.Id,
                    Name : opportunity.Name,
                    AccountId : account.Id,
                    AccountName: account.Name
                })
            })
        })

        return opportunities
    }

    //
    //Data processing utilities
    //

    //builds a formatted string from a JS Date object
    dateStringUtil = (date) => {
        let dateString = 'Optional'
        
        const dateDisplayOptions = {
            weekday:'short', 
            month:"numeric", 
            day:'numeric', 
            year:'2-digit', 
            hour:'numeric', 
            minute:'2-digit', 
            hourCycle:'h12'
        }

        if(date !== null) {
            dateString = new Date(date)
            dateString = dateString > new Date() ? dateString.toLocaleString('en-US', dateDisplayOptions) : 'Requested date passed'
        }

        return dateString
    }
    
    getMemberByID = (member_ID) => {
        let member = this.salesforceMembers.filter(user => user.Id === member_ID)
    
        return member === [] ? console.error('Team member ID not found') : member[0]
    }
    
    getTeamMembers = (request) => {
        return request.members
            .map(member => this.getMemberByID(member.external_member_ID))
            .filter(member => member)
    }
    
    getOpportunity = (opportunity_ID) => {
        let myOpportunity = this.opportunities.filter(opportunity => opportunity.Id === opportunity_ID)
    
        return myOpportunity === [] ? console.error('Opportunity not found') : myOpportunity[0]
    }


    generateDisplayRow = (request) => {
        let newRow = Object.assign({}, this.emptyActivity)

        const opportunity = this.getOpportunity(request.opportunity_ID)

        const selectedDate = this.dateStringUtil(request.selectedDateTime)
                    
        newRow.id = request.activity_ID
        newRow.account = opportunity.AccountName
        newRow.opportunity = opportunity.Name
        newRow.product = request.products.map((str) =>(str.name ? str.name : str.Name)).join(', ')
        newRow.activity = request.activity_Type.name + ' ' + request.activity_Level
        newRow.location = request.location
        newRow.date =  selectedDate
        newRow.submittedBy = this.getMemberByID(request.createdByMember.external_member_ID).Name
        newRow.presalesTeam = this.getTeamMembers(request).map((str) =>(str.name ? str.name : str.Name)).join(', ')
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
            user: currentUser
        }
    }
}
