import { prettyData } from "./data.js"

const data = prettyData()

const fixCamelCase = (s) => {
    return s.replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => { 
            return s.toUpperCase(); 
        })
}

export const getTableColumns = (userProfileNum) => {
    let columns = Object.keys(data.dislpay[0]).map((column, i) => ({
            id: "column_" + i,
            label: fixCamelCase(column),
            fieldName: column
        })
    )

    columns.shift()

    let actions
    
    switch (userProfileNum) {
        case 1:
            actions = [
                {id: 'action_' + 0, label: 'Assign Request', name: 'assign_request'},
                {id: 'action_' + 1, label: 'Decline Request', name: 'decline_request'}
            ]

            columns.filter(obj => obj.fieldName === 'status')[0].editable = true 

        break

        case 2: 
            actions = [
                {id: 'action_' + 0, label: 'Select Date', name: 'select_date'},
                {id: 'action_' + 1, label: 'Request Date Change', name: 'date_change'}
            ]

            columns.filter(obj => obj.fieldName === 'status')[0].editable = true

        break

        case 3: 
            actions = [
                {id: 'action_' + 0, label: 'Request Date Change', name: 'date_change'},
                {id: 'action_' + 1, label: 'Cancel Activity', name: 'cancel'}
            ]

        break
    }

    return {columns: columns, actions: actions, data: data}
}