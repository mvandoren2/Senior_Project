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
        let columns = Object.keys(tableData.dislpay[0]).map((column, i) => ({
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

    //Returns an empty table to render before the async method returns
    getEmptyTableFormat = () => {
        let row = this.tableDataHandler.getEmptyTableData()

        let columns = this.generateTableHeader(row)

        let actions = this.getRowActions('')
    
        return {columns: columns, actions: actions, rows: row}
    }

    getTableFormat = async () => {
        let rows = await this.tableDataHandler.getTableData()

        let user = rows.user

        let columns = this.generateTableHeader(rows)

        let actions = this.getRowActions(user.user_role.name)
    
        return {columns: columns, actions: actions, rows: rows}
    }
}
