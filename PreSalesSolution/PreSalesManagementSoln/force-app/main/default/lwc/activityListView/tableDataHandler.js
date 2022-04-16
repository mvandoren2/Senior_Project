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
        let members = await fetch(url + 'members/')
            .then(response => response.json())

        let memberIds = members.map(member => member.external_member_ID)
        
        let ret = await GetNinjaUsers({user_Ids: memberIds})

        return ret
    }

    fetchActivities = async () => {
        let activities = await fetch(url + 'activities/')
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
        let activityOpportunity = this.opportunities.filter(opportunity => opportunity.Id === activity.opportunity_ID)[0]
        
        let dates = this.dateArrayBuilder(activity)

        let team = activity.members
            .map(member => ( this.salesforceMembers
                .filter(salesforceMember => ( salesforceMember.Id === member.external_member_ID)[0]))
            )

        let submittedBy = activity.createdByMember

        if(submittedBy)
                submittedBy = this.salesforceMembers.filter(member => member.Id === submittedBy.external_member_ID)[0]
                
        let manager = activity.activeManager

        if(manager)
                manager = this.salesforceMembers.filter(member => member.Id === manager.external_member_ID)[0]

        let leadMember = activity.leadMember

        if(leadMember)
                leadMember = this.salesforceMembers.filter(member => member.Id === leadMember.external_member_ID)[0]

        

        return {
            activity_ID: activity.activity_ID,
            opportunity: activityOpportunity,
            products: activity.products,
            activity_Type: activity.activity_Type,
            activity_Level: activity.activity_Level,
            location: activity.location,
            dates: dates,
            selectedDate: activity.selectedDateTime,
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
            date = new Date(date)

            return {
                id : i + 1,
                date: date,
                localeString: this.dateStringUtil(date),
                selected: false
            }
        })
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
    getTableData = async () => {
        let detailedData
        let currentUser

        this.salesforceMembers = await this.fetchSalesforceUsers();

        [currentUser, detailedData] = await Promise.all([this.fetchCurrentUser(), this.fetchActivities()])

        if (!detailedData.length) return this.getEmptyTableData()
    
        return {
            activities: detailedData,
            user: currentUser
        }
    }
}
