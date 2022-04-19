import { TableDataHandler } from "./tableDataHandler.js"

export class TableFormatter {
    tableDataHandler = new TableDataHandler()

    fixCamelCase = (s) => {
        return s.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => { 
                return str.toUpperCase(); 
            })
    }


    //Builds an array of column heading names from the key names of a request object 
    generateTableHeader = (tableData) => {
        let columns = Object.keys(tableData.display[0]).map((column, i) => ({
            id: "column_" + i,
            label: this.fixCamelCase(column),
            fieldName: column
        }))

        columns.shift()

        return columns
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
                {id: 'action_' + 1, label: 'Request Date Change', name: 'date_change'}
            ],

            'Sales Representative': [
                {id: 'action_' + 0, label: 'Select Date', name: 'select_date'},
                {id: 'action_' + 1, label: 'Request Date Change', name: 'date_change'}
            ],

            '' : [
                {id: 'action_0', label: ' ', name: 'loading_actions'}
            ]
        }

        return actions[userProfile]
    }

    emptyActivity = {
        id: '',
        account: '',
        opportunity: '',
        product: '',
        activity: '',
        date: '',
        location: '',
        submittedBy: '',
        presalesTeam: '',
        status: ''
    }

    getDisplayRows = (detailedActivities) => {
        return detailedActivities.map(activity => this.generateDisplayRow(activity))
    }

    generateDisplayRow = (activity) => {
        let newRow = Object.assign({}, this.emptyActivity)

        let selectedDate = this.setSelectedDate(activity.selectedDate)
                    
        newRow.id           = activity.activity_ID
        newRow.account      = activity.opportunity.AccountName
        newRow.opportunity  = activity.opportunity.Name
        newRow.product      = activity.products.map(product => product.name).join(', ')
        newRow.activity     = activity.activity_Type.name
        newRow.location     = activity.location
        newRow.date         = selectedDate
        newRow.submittedBy  = activity.submittedBy.Name
        newRow.presalesTeam = activity.team.map(member => member.Name).join(', ')
        newRow.status       = activity.status
    
        return newRow
    }

    setSelectedDate = (date) => {
        let dateString = 'Optional'

        if(date) {
            if(date.date < Date.now())
                dateString = 'Selected date has passed.'

            else
                dateString = date.localeString
        }

        return dateString
    }

    //Returns an empty table to render before the async method returns
    getEmptyTableFormat = () => {
        let data = {display: [this.emptyActivity], detailed: []}

        let columns = this.generateTableHeader(data)

        let actions = this.getRowActions('')
    
        return {columns: columns, actions: actions, data: data}
    }

    getTableFormat = async () => {
        let data = await this.tableDataHandler.getTableData()

        data.display = this.getDisplayRows(data.activities)

        let user = data.user

        let columns = this.generateTableHeader(data)

        let actions = this.getRowActions(user.user_role.name)
    
        return {columns: columns, actions: actions, data: data}
    }
}
