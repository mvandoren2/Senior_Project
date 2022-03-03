import { TableDataHandler, getTableData } from "./tableDataHandler.js"

export class TableFormatter {
    constructor(userProfileNum){
        this.userProfileNum = userProfileNum
    }

    dataHandler = new TableDataHandler()

    fixCamelCase = (s) => {
        return s.replace(/([A-Z])/g, ' $1')
            .replace(/^./, s => { 
                return s.toUpperCase(); 
            })
    }

    generateTableHeader = (tableData) => {
        let columns = Object.keys(tableData.dislpay[0]).map((column, i) => ({
            id: "column_" + i,
            label: this.fixCamelCase(column),
            fieldName: column
        }))

        columns.shift()

        return columns
    }

    getRowActions = () => {
        let actions
        
        switch (this.userProfileNum) {
            case 1:
                actions = [
                    {id: 'action_' + 0, label: 'Assign Request', name: 'assign_request'},
                    {id: 'action_' + 1, label: 'Decline Request', name: 'decline_request'}
                ]
        
            break
    
            case 2: 
                actions = [
                    {id: 'action_' + 0, label: 'Select Date', name: 'select_date'},
                    {id: 'action_' + 1, label: 'Request Date Change', name: 'date_change'}
                ]
        
            break
    
            case 3: 
                actions = [
                    {id: 'action_' + 0, label: 'Request Date Change', name: 'date_change'},
                    {id: 'action_' + 1, label: 'Cancel Activity', name: 'cancel'}
                ]
    
            break
        }

        return actions
    }

    getEmptyTableFormat = () => {
        let data = this.dataHandler.getEmptyTableData()

        let columns = this.generateTableHeader(data)

        let actions = this.getRowActions()
    
        return {columns: columns, actions: actions, data: data}
    }

    getTableFormat = async () => {    
        
        let data = await this.dataHandler.getTableData()

        let columns = this.generateTableHeader(data)

        let actions = this.getRowActions()
    
        return {columns: columns, actions: actions, data: data}
    }
}