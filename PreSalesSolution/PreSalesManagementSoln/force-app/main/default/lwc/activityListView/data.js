import DisplayUrl from "@salesforce/schema/Product2.DisplayUrl"

const appData = {
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
            id: 123,
            client: 456,
            title: 'Pumphrey-Product1-Product2',
            salesTeam: ['Eddy', "Ol' Remus"]
        },

        {
            id: 762,
            client: 137,
            title: 'James-Product2',
            salesTeam: ['Lance', 'Jim', 'Frankie']
        }
    ],

    requests: [
        {
            id: 0,
            opportunity: 123,
            account: 456,
            product: ['product1', 'product2'],
            activity: 'Demonstration',
            activityLevel: 1,
            date: [new Date(2022, 4, 23, 15, 30), new Date(1989, 6, 12, 12, 4, 20)],
            location: '123 Alpha Way, Sacramento, CA, 95959',
            submittedBy:'Eddy',
            description: "Here's some notes",
            status: "rescheduled"
        },

        {   
            id: 1,
            opportunity: 762,
            account: 137,
            product: ['product2'],
            activity: 'Guided Lab',
            activityLevel: 2,
            date: [new Date(2022, 3, 13, 8, 30)],
            location: 'www.zoom.link/123',
            submittedBy: 'Lance',
            description: "More notes? Here you go!",
            status: "complete"
        },

        {
            id: 2,
            opportunity: 762,
            account: 137,
            product: ['product1'],
            activity: 'Sandbox',
            activityLevel: 3,
            date: [new Date()],
            location: 'www.zoom.link/456',
            submittedBy: 'Jim',
            description: "Take another note!",
            status: "cancelled"
        }
    ]
}

const dateString = (date) => {
    const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const pm = date.getHours() > 11

    return days[date.getDay()] + ' ' + 
        months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' +
        ' @ ' + date.getHours() % 12 + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + (pm ? 'PM' : 'AM')
}

export const prettyData = () => {
    
    let dislpayData = appData.requests.map(request => (
        {
            id: request.id,
            account: appData.clients
                .filter(client => client.accountId === request.account)[0]
                .name,
            opportunity: appData.opportunities
                .filter(opportunity => opportunity.id === request.opportunity)[0]
                .title,
            product: request.product
                .map((product, i) =>  (i > 0 ? ' ' : '') + product)
                .toString(),
            activity: request.activity + '-' + request.activityLevel,
            time: request.date
                .map((date, i) => (i > 0 ? ' ' : '') + dateString(date))
                .toString(),
            location: request.location,
            submittedBy: request.submittedBy,
            description: request.description,
            status: request.status                
        }
    ))

    return {dislpay: dislpayData, detailed: appData.requests}
}
