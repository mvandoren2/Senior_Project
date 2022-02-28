<<<<<<< HEAD
fetch('http://localhost:8080/api/get_activity/')
=======
import { wire } from "lwc"

fetch('http://localhost:8080/api/get_activity')
>>>>>>> 171e5088347130b40cfbfe99f937fcf4eafb6164
    .then(res => res.json())
    .then(data => appData.requests = data)


let appData = {
    clients: [
        {
            accountId: 456,
            name: 'James Pumphrey LLC'
        },

        {
            accountId: 137,
            name: 'Rick James BTC'
        }
    ],

    opportunities: [
        {
            id: "234232",
            client: 456,
            title: 'Pumphrey-Product1-Product2',
            salesTeam: ['Eddy', "Ol' Remus"]
        },

        {
            id: "sdas",
            client: 137,
            title: 'James-opportunity'
        }
    ],

    teamMembers: [
        {
            id: '231212',
            name: 'Emily'
        },

        {
            id: '43534',
            name: 'Paul'
        },

        {
            id: '2132131',
            name: 'Hal'
        },

        {
            id: '123123',
            name: 'Frankie'
        },

        {
            id: '54644342',
            name: 'Mickey'
        }
    ],

    requests: []
}

const dateString = (date) => {
    const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const pm = date.getHours() > 11

    return days[date.getDay()] + ' ' + 
        months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' +
        ' @ ' + date.getHours() % 12 + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + (pm ? 'PM' : 'AM')
}

const getMemberByID = (member_ID) => {
    let member = appData.teamMembers.filter(member => member.id == member_ID)

    return member == [] ? console.error('Team member ID not found') : member[0]
}

const getTeamMembers = (request) => {
    return request.members
        .map(member => getMemberByID(member.external_presales_member_ID))
        .filter(member => member)
}

const getOpportunity = (opportunity_ID) => {
    let opportunity = appData.opportunities.filter(opportunity => opportunity.id == opportunity_ID)

    return opportunity == [] ? console.error('Opportunity not found') : opportunity[0]
}

const getClient = (opportunity_ID) => {
    const opportunity = getOpportunity(opportunity_ID)
    
    const client_ID = opportunity.client

    let client = appData.clients
        .filter(client => client.accountId == client_ID)

    return client == [] ? console.error('Client not found') : client[0]
}


Array.prototype.toDisplayString = function() {
    return this.map((str, i) => (i > 0 ? ' ' : '') + str.name).toString()
}

const emptyActivity = {
    id: '',
    account: '',
    opportunity: '',
    product: '',
    activity: '',
    time: '',
    location: '',
    submittedBy: '',
    description: '',
    flagstatus: '',
    status: ''
}

const generateDisplayRow = (request) => {
    let newRow = Object.assign({}, emptyActivity)
    
    newRow.id = request.activity_ID
    newRow.account = getClient(request.opportunity_ID).name
    newRow.opportunity = getOpportunity(request.opportunity_ID).title
    newRow.product = request.products.toDisplayString()
    newRow.time = request.selectedDateTime
    newRow.submittedBy = getTeamMembers(request).toDisplayString()
    newRow.description = request.description

    return newRow
}

export const getTableData = () => {    
    let dislpayData 
    
    if (!appData.requests.length)
        dislpayData = [emptyActivity]
    
    else {
        dislpayData = appData.requests.map(request => generateDisplayRow(request))}

    return {dislpay: dislpayData, detailed: appData.requests}
}
