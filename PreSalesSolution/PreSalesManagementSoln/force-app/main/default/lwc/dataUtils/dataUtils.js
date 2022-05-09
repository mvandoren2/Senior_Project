import id from "@salesforce/user/Id"
import OpportunityData from "@salesforce/apex/OpportunityData.OpportunityData"
import GetNinjaUsers from "@salesforce/apex/GetNinjaUsers.GetNinjaUsers"

export const url = "http://localhost:8080/api/"

export async function fetchCurrentUser() {
    const userID = id ? id : '0055f000007NzdoAAC'

    let userData = await fetch(url + 'member/' + userID + '/')
        .then(res => res.json())

    return userData
}

//builds a formatted string from a JS Date object
function dateStringUtil(date) {        
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

function buildDateObject(date) {
    date = new Date(date)

    return {
        date: date,
        localeString: dateStringUtil(date),
        selected: false
    }
}

function dateArrayBuilder(activity) {
    let dates = []

    if(activity.oneDateTime)
        dates.push(activity.oneDateTime)

    if(activity.twoDateTime)
        dates.push(activity.twoDateTime)

    if(activity.threeDateTime)
        dates.push(activity.threeDateTime)

    return dates.map((date, i) => {
        let dateObj = buildDateObject(date)

        dateObj.id = i + 1

        return dateObj
    })
}

export async function fetchOpportunities(opportunity_Ids) {
    let apexAccountData = await OpportunityData({opportunity_Ids: opportunity_Ids})
        .catch(err => console.error('Error:', err))

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

export async function fetchSalesforceUsers() {
    let members = await fetch(url + 'members/')
        .then(response => response.json())

    let memberIds = members.map(member => member.external_member_ID)
    
    let salesforceUsers = await GetNinjaUsers({user_Ids: memberIds})

    salesforceUsers = salesforceUsers.map(user => Object.assign({}, user))

    salesforceUsers.forEach(user => {
        let djangoData = members.find(member => member.external_member_ID === user.Id)

        user.member_ID = djangoData.member_ID
        user.proficiency  = djangoData.proficiency
        user.user_role = djangoData.user_role
    })

    return salesforceUsers
}

export async function fetchProducts() {
    let products = await fetch(url + 'products/')
        .then(res => res.json())
    
    return products
}

export async function fetchActivityTypes() {
    let activityTypes = await fetch(url + 'activity/types/')
        .then(res => res.json())

    return activityTypes
}

function buildDetailedActivityObj(activity, opportunities, salesforceMembers) {
    let activityOpportunity = opportunities.find(opportunity => opportunity.Id === activity.opportunity_ID)
    
    let dates = dateArrayBuilder(activity)

    let selectedDate = activity.selectedDateTime ? 
        buildDateObject(activity.selectedDateTime) : null

    let team = activity.members
        .map( member => salesforceMembers
            .find( salesforceMember => salesforceMember.Id === member.external_member_ID )
        )

    let submittedBy = activity.createdByMember ? 
        salesforceMembers.find(member => member.Id === activity.createdByMember.external_member_ID) : null
            
    let manager = activity.activeManager ? 
        salesforceMembers.find(member => member.Id === activity.activeManager.external_member_ID) : null

    let leadMember = activity.leadMember ? 
        salesforceMembers.find(member => member.Id === activity.leadMember.external_member_ID) : null        

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

export async function buildDetailedActivitiesList(activities) {
    const opportunityIds = activities.map(activity => activity.opportunity_ID)

    let opportunities, salesforceMembers

    [opportunities, salesforceMembers] = await Promise.all([fetchOpportunities(opportunityIds), fetchSalesforceUsers()])

    return activities.map(activity => buildDetailedActivityObj(activity, opportunities, salesforceMembers))
}

export function detailedActivityToDjangoFormat(activity) {
    let djangoActivity = {
        activity_ID : activity.activity_ID,
        members : activity.team.map(member => member.Id),
        products : activity.products.map(member => member.product_ID),
        createdByMember : activity.submittedBy.Id,
        leadMember : activity.leadMember ? activity.leadMember.Id : null,
        activeManager : activity.manager ? activity.manager.Id : null,
        activity_Type : activity.activity_Type.type_ID,
        opportunity_ID : activity.opportunity.Id,
        account_ID : activity.opportunity.AccountId,
        location : activity.location,
        activity_Level : activity.activity_Level ? activity.activity_Level : null,
        oneDateTime : activity.dates[0] ? activity.dates[0].date.toISOString() : null,
        twoDateTime : activity.dates[1] ? activity.dates[1].date.toISOString() : null,
        threeDateTime : activity.dates[2] ? activity.dates[2].date.toISOString() : null,
        selectedDateTime : activity.selectedDate.date.toISOString(),
        status : activity.status,
        flag : activity.flag
    }

    return djangoActivity
}
