import getPreSalesTeamMembers from "@salesforce/apex/GetUsers.getPreSalesTeamMembers"
import { wire } from "lwc"

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

Array.prototype.toDisplayString = function() {
    return this.map((str, i) => (i > 0 ? ' ' : '') + str.name).toString()
}

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

    fetchRequests = async () => {
        return fetch('http://localhost:8080/api/get_activity/')
            .then(res => res.json())
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
        let member = appData.teamMembers.filter(member => member.id == member_ID)
    
        return member == [] ? console.error('Team member ID not found') : member[0]
    }
    
    getTeamMembers = (request) => {
        return request.members
            .map(member => this.getMemberByID(member.external_presales_member_ID))
            .filter(member => member)
    }
    
    getOpportunity = (opportunity_ID) => {
        let opportunity = appData.opportunities.filter(opportunity => opportunity.id == opportunity_ID)
    
        return opportunity == [] ? console.error('Opportunity not found') : opportunity[0]
    }
    
    getClient = (opportunity_ID) => {
        const opportunity = this.getOpportunity(opportunity_ID)
        
        const client_ID = opportunity.client
    
        let client = appData.clients
            .filter(client => client.accountId == client_ID)
    
        return client == [] ? console.error('Client not found') : client[0]
    }


    generateDisplayRow = (request) => {
        let newRow = Object.assign({}, this.emptyActivity)
        
        newRow.id = request.activity_ID
        newRow.account = this.getClient(request.opportunity_ID).name
        newRow.opportunity = this.getOpportunity(request.opportunity_ID).title
        newRow.product = request.products.toDisplayString()
        newRow.time = request.selectedDateTime
        newRow.submittedBy = this.getTeamMembers(request).toDisplayString()
        newRow.description = request.description
    
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
        let rawData = await this.fetchRequests()
        
        let dislpayData 
        
        if (!rawData.length)
            dislpayData = [this.emptyActivity]
        
        else {
            dislpayData = rawData.map(request => this.generateDisplayRow(request))}
    
        return {
            dislpay: dislpayData, 
            detailed: this.rawData
        }
    }
}
