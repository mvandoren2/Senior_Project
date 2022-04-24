import GetNinjaUsers from "@salesforce/apex/GetNinjaUsers.GetNinjaUsers"
import OpportunityData from "@salesforce/apex/OpportunityData.OpportunityData"
import Id from "@salesforce/user/Id"

export const url = 'http://localhost:8080/api/'

export class TableDataHandler {

    fetchCurrentUser = () => {
        const userID = Id ? Id : '0055f0000041g1mAAA'
        const urlString = url + 'member/' + userID + '/'

        return fetch(urlString)
            .then(res => res.json())
    }

    fetchSalesforceUsers = async () => {
        let members = await fetch(url + 'members/', {
            method: 'GET',
            mode: 'cors'
        })
            .then(response => response.json())

        let memberIds = members.map(member => member.external_member_ID)
        
        let salesforceUsers = await GetNinjaUsers({user_Ids: memberIds})

        return salesforceUsers
    }


    getActivityQueryString = () => {
        let endpoint = 'activities/'
        let query = ''

        if(this.params.status)
            if(this.params.status) {
                switch(this.params.status) {
                    case 'accepted' :
                    case 'requests' :
                    case 'past' :
                    case 'current' :
                        endpoint += this.params.status + '/'
                        break
    
                    default :                
                        query += '?status=' + this.params.status
                }
            }

        let queryAdded = query !== ''
    
        if(this.params.opportunity) {
            query += (queryAdded ? "&" : '?') + 'opportunity=' + this.params.opportunity 
            queryAdded = true
        }

        if(this.params.account) {
            query += (queryAdded ? "&" : '?') + 'account=' + this.params.account
            queryAdded = true
        }

        if(this.params.product) {
            query += (queryAdded ? "&" : '?') + 'product=' + this.params.product
            queryAdded = true
        }

        if(this.params.member){
            query += (queryAdded ? "&" : '?') + 'member=' + this.params.member
            queryAdded = true
        }

        return url + endpoint + query
    }

    fetchActivities = async () => {
        let activities = await fetch(this.getActivityQueryString())
            .then(res => res.json())

        this.opportunities = await this.fetchOpportunities(activities)

        return activities.map(request => this.buildDetailedActivityObj(request))
    }

    fetchOpportunities = async (activities) => {
        const opportunity_Ids = activities.map(request => request.opportunity_ID)

        let apexAccountData = await OpportunityData({opportunity_Ids: opportunity_Ids})

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

    buildDetailedActivityObj = (activity) => {
        let activityOpportunity = this.opportunities.find(opportunity => opportunity.Id === activity.opportunity_ID)
        
        let dates = this.dateArrayBuilder(activity)

        let selectedDate = activity.selectedDateTime ? 
            this.buildDateObject(activity.selectedDateTime) : null

        let team = activity.members
            .map( member => this.salesforceMembers
                .find( salesforceMember => salesforceMember.Id === member.external_member_ID )
            )

        let submittedBy = activity.createdByMember ? 
            this.salesforceMembers.find(member => member.Id === activity.createdByMember.external_member_ID) : null
                
        let manager = activity.activeManager ? 
            this.salesforceMembers.find(member => member.Id === activity.activeManager.external_member_ID) : null

        let leadMember = activity.leadMember ? 
            this.salesforceMembers.find(member => member.Id === activity.leadMember.external_member_ID) : null        

        return {
            activity_ID: activity.activity_ID,
            opportunity: activityOpportunity,
            products: activity.products,
            activity_Type: activity.activity_Type,
            activity_Level: activity.activity_Level,
            location: activity.location,
            dates: dates,
            selectedDate: selectedDate,
            submittedBy: submittedBy,
            manager: manager,
            leadMember: leadMember,
            team: team,
            status: activity.status,
            flag: activity.flag
        }
    }

    dateArrayBuilder = (activity) => {
        let dates = []

        if(activity.oneDateTime)
            dates.push(activity.oneDateTime)

        if(activity.twoDateTime)
            dates.push(activity.twoDateTime)

        if(activity.threeDateTime)
            dates.push(activity.threeDateTime)

        return dates.map((date, i) => {
            let dateObj = this.buildDateObject(date)

            dateObj.id = i + 1

            return dateObj
        })
    }

    buildDateObject = (date) => {
        date = new Date(date)

        return {
            date: date,
            localeString: this.dateStringUtil(date),
            selected: false
        }
    }

    //builds a formatted string from a JS Date object
    dateStringUtil = (date) => {        
        const dateDisplayOptions = {
            weekday:'short', 
            month:"numeric", 
            day:'numeric', 
            year:'2-digit', 
            hour:'numeric', 
            minute:'2-digit', 
            hourCycle:'h12'
        }

        const dateString = date.toLocaleString('en-US', dateDisplayOptions)
            
        return dateString
    }

    //
    //Serve Processed Table Data
    //
    getTableData = async (params) => {
        this.params = params

        let detailedData
        let currentUser

        this.salesforceMembers = await this.fetchSalesforceUsers();

        [currentUser, detailedData] = await Promise.all([this.fetchCurrentUser(), this.fetchActivities()])

        return  detailedData.length ?
            {activities: detailedData, user: currentUser} : null
    }
}
