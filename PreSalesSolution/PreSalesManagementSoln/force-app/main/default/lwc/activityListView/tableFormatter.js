import { TableDataHandler } from "./tableDataHandler.js"

export class TableFormatter {
    tableDataHandler = new TableDataHandler()

    fixCamelCase = (s) => {
        return s.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => { 
                return str.toUpperCase(); 
            })
    }

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
    generateTableHeader = () => {
        let columnLabels = this.columnLabels
        
        if(this.params) {
            if(this.params.opportunity)
                columnLabels = columnLabels.filter(column => (column !== 'Account') && (column !== 'Opportunity'))

            if(this.params.account)
                columnLabels = columnLabels.filter(column => column !== 'Account')

                this.smallFormat = this.params.format === 'small' ? true : false
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

    getDisplayRows = () => {
        return this.data.activities.map(activity => this.generateDisplayRow(activity))
    }

    generateDisplayRow = (activity) => {
        let newRow = Object.assign({}, this.emptyDisplayRow)

        let rowData = []

        let selectedDate = this.setSelectedDate(activity.selectedDate, activity.status)
                    
        newRow.id = activity.activity_ID

        if(!this.params.account && !this.params.opportunity && !this.smallFormat)
            rowData.push({id: 'Account', data: activity.opportunity.AccountName})

        if(!this.params.opportunity && !this.smallFormat)
            rowData.push({id: 'Opportunity', data: activity.opportunity.Name})
        
        rowData.push({id: 'Product', data: activity.products.map(product => product.name).join(', ')})
        rowData.push({id: 'Activity'  , data: activity.activity_Type.name})
        rowData.push({id: 'Date', data: selectedDate})
        rowData.push({id: 'Location', data: activity.location})
        rowData.push({id: 'Submitted By', data: activity.submittedBy.Name})
        rowData.push({id: 'Presales Team', data: activity.team.map(member => member.Name).join(', ')})
        rowData.push({id: 'Status' , data: activity.status})

        newRow.data = rowData

        newRow.actions = this.getRowActions(this.data.user.user_role.name)
    
        return newRow
    }

    setSelectedDate = (date, activityStatus) => {
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
    getRowActions = (userProfile) => {
        const actions = {
            'Presales Manager': [
                {id: 'action_' + 0, label: 'Assign Request', name: 'assign_request'},
                {id: 'action_' + 1, label: 'Decline Request', name: 'decline_request'},
                {id: 'action_' + 2, label: 'Show Details', name: 'show_details'}
            ],

            'Presales Member': [
                {id: 'action_' + 0, label: 'Select Date', name: 'select_date'},
                {id: 'action_' + 1, label: 'Request Date Change', name: 'date_change'},
                {id: 'action_' + 2, label: 'Show Details', name: 'show_details'}
            ],

            'Sales Representative': [
                {id: 'action_' + 0, label: 'Select Date', name: 'select_date'},
                {id: 'action_' + 1, label: 'Request Date Change', name: 'date_change'},
                {id: 'action_' + 2, label: 'Show Details', name: 'show_details'}
            ],

            '' : [
                {id: 'action_0', label: ' ', name: 'loading_actions'}
            ]
        }

        return actions[userProfile]
    }

    //Returns an empty table to render before the async method returns
    getEmptyTableFormat = () => {
        let data = {display: [this.emptyActivity], activities: []}

        let columns = this.generateTableHeader(data)
    
        return {display: {columns: columns, data: []}, activities: [] }
    }

    getTableFormat = async (params) => {
        this.params = params
        this.data = await this.tableDataHandler.getTableData(params)

        let tableFormat = this.getEmptyTableFormat()

        let columns = this.generateTableHeader()

        if(this.data) {
            tableFormat.display = {
                columns: columns,
                data: this.getDisplayRows()
            }

            tableFormat.activities = this.data.activities
        }
    
        return tableFormat
    }
}
