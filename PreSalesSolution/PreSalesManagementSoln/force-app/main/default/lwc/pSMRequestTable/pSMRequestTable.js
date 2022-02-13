import { LightningElement } from 'lwc';
import {prettyData} from './data';
 
export default class PSMRequestTable extends LightningElement {
    actions = [
        {label: 'Assign Request', name: 'assign_request'},
        {label: 'Decline Invalid Request', name: 'decline_request'}
    ]
    
    columns = [
        {label: 'Account', fieldName: 'account', sortable: true},
        {label: 'Opportunity', fieldName: 'opportunity', sortable: true},
        {label: 'Products', fieldName: 'product', sortable: true},
        {label: 'Time', fieldName: 'time', sortable: true },
        {label: 'Submitted By', fieldName: 'submittedBy', sortable: true},
        {label: 'Notes', fieldName: 'notes', editable: true},
        {type: 'action', typeAttributes: {rowActions: this.actions}}
    ]

    data = prettyData()
    filteredData = [...this.data]

    sortDirection = 'asc'
    sortedBy

    sortBy = (field, reverse, primer) => {
        const key = (x) => {
            const val = Array.isArray(x[field]) ? x[field][0] : x[field]
            
            return primer ? primer(val) : val
        };
    
        return function (a, b) {
            a = key(a)
            b = key(b)
            return reverse * ((a > b) - (b > a))
        };
    }
    
    listSortHandler = (evt) => {
        let { fieldName: sortedBy, sortDirection } = evt.detail;

        if (sortedBy === 'time') sortedBy = 'date'

        let cloneData = [...this.filteredData]
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1))
        this.filteredData = cloneData

        if (sortedBy === 'date') sortedBy = 'time'
        
        this.sortDirection = sortDirection
        this.sortedBy = sortedBy
    }

    assigningRequest

    rowActionHandler = (evt) => {        
        if (evt.detail.action.name === 'assign_request') this.assigningReuest = evt.detail.row
        else declineRequest(evt.detail.row.id)
    }

    searchHandler = (evt) => {
        const query = evt.target.value

        this.filteredData = this.data.filter(item => this.filterData(item, query)
              
        )
    }

    filterData = (item, query) => {
        for (let prop in item) {
            if (item[prop].toString().toLowerCase().includes(query.toLowerCase()))
                return true
        }

        return false
    }
}