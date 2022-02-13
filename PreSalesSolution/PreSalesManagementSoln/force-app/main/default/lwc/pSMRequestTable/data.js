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
            date: [new Date(2022, 4, 23, 15, 30)],
            submittedBy:'Eddy',
            notes: "Here's some notes"
        },

        {   
            id: 1,
            opportunity: 762,
            account: 137,
            product: ['product2'],
            date: [new Date(2022, 3, 13, 8, 30)],
            submittedBy: 'Lance',
            notes: "More notes? Here you go!"
        },

        {
            id: 2,
            opportunity: 762,
            account: 137,
            product: ['product1'],
            date: [new Date()],
            submittedBy: 'Jim',
            notes: "Take another note!"
        }
    ]
}

const dateString = (date) => {
    const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const pm = date.getHours() > 11

    return ' ' + days[date.getDay()] + ' ' + 
        months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' +
        ' @ ' + date.getHours() % 12 + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + (pm ? 'PM' : 'AM')
}

export const prettyData = () => {        
    return appData.requests.map(request => (
        {
            id: request.id,
            account: appData.clients
                .filter(client => client.accountId === request.account)[0]
                .name,
            opportunity: appData.opportunities
                .filter(opportunity => opportunity.id === request.opportunity)[0]
                .title,
            product: request.product.map(product => ' ' + product),
            time: request.date
                .map(date => dateString(date)),
            date: request.date,
            submittedBy: request.submittedBy,
            notes: request.notes                
        }
    ))
}