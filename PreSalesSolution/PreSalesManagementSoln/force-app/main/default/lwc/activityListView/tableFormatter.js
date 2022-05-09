import { TableDataHandler } from "./tableDataHandler.js"

export class TableFormatter {
    tableDataHandler = new TableDataHandler()

    columnLabels = [
        'Account',
        'Opportunity',
        'Product',
        'Activity',
        'Date',
        'Location',
        'Submitted By',
        'Presales Team',
        'Status'
    ]

    //Builds an array of column heading names from the key names of a request object 
    generateTableHeader() {
        let columnLabels = this.columnLabels
        
        if(this.params) {
            this.smallFormat = this.params.format === 'small'

            if(this.params.opportunity && this.smallFormat)
                columnLabels = columnLabels.filter(column => (column !== 'Account') && (column !== 'Opportunity'))

            if(this.params.account && this.smallFormat)
                columnLabels = columnLabels.filter(column => column !== 'Account')
        }
        
        let columns = columnLabels.map((column, i) => ({
            id: "column_" + i,
            label: column
        }))

        return columns
    }

    emptyDisplayRow = {
        id: '',
        data : [],
        actions: []
    }

    getDisplayRows() {
        return this.data.activities.map(activity => this.generateDisplayRow(activity))
    }

    generateDisplayRow(activity) {
        let newRow = Object.assign({}, this.emptyDisplayRow)

        let rowData = []

        let selectedDate = this.setSelectedDate(activity.selectedDate, activity.status)
                    
        newRow.id = activity.activity_ID

        if(!((this.params.account || this.params.opportunity) && this.smallFormat))
            rowData.push({id: 'Account', data: activity.opportunity.AccountName})

        if(!(this.params.opportunity && this.smallFormat))
            rowData.push({id: 'Opportunity', data: activity.opportunity.Name})
        
        rowData.push({id: 'Product', data: activity.products.map(product => product.name).join(', ')})
        rowData.push({id: 'Activity'  , data: activity.activity_Type.name})
        rowData.push({id: 'Date', data: selectedDate})
        rowData.push({id: 'Location', data: activity.location})
        rowData.push({id: 'Submitted By', data: activity.submittedBy.Name})
        rowData.push({id: 'Presales Team', data: activity.team.map(member => member.Name).join(', ')})
        rowData.push({id: 'Status' , data: activity.status})

        newRow.data = rowData

        newRow.actions = this.getRowActions(activity)
    
        return newRow
    }

    setSelectedDate(date, activityStatus) {
        let dateString = 'Optional'

        if(date && activityStatus !== 'Reschedule') {
            if(date.date < Date.now())
                dateString = 'Selected date has passed.'

            else
                dateString = date.localeString
        }

        return dateString
    }

    //Builds an array of action names based on the user's role
    getRowActions(activity) {
        const userProfile = this.user ? this.user.user_role.name : 'Sales'

        const status = activity.status
        
        const actions =  [
            {id: 'action_' + 0, label: 'Show Details', name: 'show_details'},
            {id: 'action_' + 1, label: 'Accept Request', name: 'accept_request'},
            {id: 'action_' + 2, label: 'Decline Request', name: 'decline'},
            {id: 'action_' + 3, label: 'Cancel Activity', name: 'cancel'},
            {id: 'action_' + 4, label: 'Request Reschedule', name: 'date_change'},
            {id: 'action_' + 5, label: 'Schedule Activity', name: 'show_details'},
            {id: 'action_' + 6, label: 'Manage Team', name: 'manage_team'},
            {id: 'action_' + 7, label: 'Complete Activity', name: 'complete'},
            {id: 'action_' + 8, label: 'Add Notes', name: 'notes'}
        ]

        const userRoles = [
            {
                role: 'Presales Manager', actions: [
                    {status: 'Request', actions: [0, 1, 2]},
                    {status: 'Reschedule', actions: [0, 1, 2]},
                    {status: 'Expire', actions: [0, 6, 4, 8, 3]},
                    {status: 'Accept', actions: [0, 6, 8, 3]},
                    {status: 'Scheduled', actions: [0, 6, 8, 7, 3]},
                    {status: 'Decline', actions: [0]},
                    {status: 'Cancel', actions: [0]}
                ]
            },

            {
                role: 'Presales Member', actions: [
                    {status: 'Request', actions: [0]},
                    {status: 'Reschedule', actions: [0, 8]},
                    {status: 'Expire', actions: [0, 8]},
                    {status: 'Accept', actions: [0, 8]},
                    {status: 'Scheduled', actions: [0, 7, 8]},
                    {status: 'Decline', actions: [0]},
                    {status: 'Cancel', actions: [0]}
                ]
            },

            {
                role: 'Sales Representative', actions: [
                    {status: 'Request', actions: [0, 8]},
                    {status: 'Reschedule', actions: [0, 8]},
                    {status: 'Expire', actions: [0, 8]},
                    {status: 'Accept', actions: [0, 8, 3]},
                    {status: 'Scheduled', actions: [0, 8, 3]},
                    {status: 'Decline', actions: [0]},
                    {status: 'Cancel', actions: [0]}
                ]
            }
        ]

        let userActions = userRoles.find(user => user.role === userProfile)
            .actions.find(actionList => actionList.status === status).actions

        if(userProfile === 'Presales Member' && activity.leadMember && this.user.external_member_ID === activity.leadMember.external_member_ID)
            userActions = userActions.filter(val => val !== 7)
    
        return userActions.map(action => actions[action])
    }

    //Returns an empty table to render before the async method returns
    getEmptyTableFormat() {
        let columns = this.generateTableHeader()
    
        return {display: {columns: columns, data: []}, activities: [] }
    }

    async getTableFormat(params) {
        this.params = params
        this.data = await this.tableDataHandler.getTableData(params)

        let tableFormat = this.getEmptyTableFormat()

        let columns = this.generateTableHeader()

        if(this.data) {
            this.user = this.data.user

            tableFormat.display = {
                columns: columns,
                data: this.getDisplayRows()
            }

            tableFormat.activities = this.data.activities
        }
    
        return tableFormat
    }
}
