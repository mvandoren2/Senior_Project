fetch('http://localhost:8080/api/get_activity/')
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

    requests: [
        {
            "activity_ID": 4,
            "members": [
                {
                    "presales_member_ID": 1,
                    "user_role": {
                        "roles_ID": 3,
                        "name": "Sales Representative"
                    },
                    "external_presales_member_ID": "231212"
                },
                {
                    "presales_member_ID": 2,
                    "user_role": {
                        "roles_ID": 2,
                        "name": "Pre Sales Manager"
                    },
                    "external_presales_member_ID": "43534"
                },
                {
                    "presales_member_ID": 12,
                    "user_role": null,
                    "external_presales_member_ID": "2132131"
                },
                {
                    "presales_member_ID": 13,
                    "user_role": null,
                    "external_presales_member_ID": "123123"
                }
            ],
            "products": [
                {
                    "product_ID": 1,
                    "external_product_ID": "1",
                    "name": "Coffee"
                },
                {
                    "product_ID": 3,
                    "external_product_ID": "2",
                    "name": "Icecream"
                }
            ],
            "opportunity_ID": "234232",
            "oneDateTime": "2022-02-22T00:49:51Z",
            "twoDateTime": null,
            "threeDateTime": null,
            "selectedDateTime": "2022-02-22T00:49:53Z",
            "description": "sdaSDASDasd",
            "flag": false
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
            id: request.activity_ID,
            account: appData.clients
                .filter(client => client.accountId === appData.opportunities.filter(opportunity => opportunity.id == request.opportunity_ID)[0].client)[0]
                .name,
            opportunity: appData.opportunities
                .filter(opportunity => opportunity.id === request.opportunity_ID)[0]
                .title,
            product: request.products
                .map((product, i) =>  (i > 0 ? ' ' : '') + product.name)
                .toString(),
            activity: request.activity + '-' + request.activityLevel,
            time: request.selectedDateTime,
            location: request.location,
            submittedBy: request.members
                .map((member, i) => (i > 0 ? ' ' : '') + appData.teamMembers.filter(item => item.id == member.external_presales_member_ID)[0].name).toString(),
            description: request.description,
            status: 'complete'
        }
    ))

    return {dislpay: dislpayData, detailed: appData.requests}
}
