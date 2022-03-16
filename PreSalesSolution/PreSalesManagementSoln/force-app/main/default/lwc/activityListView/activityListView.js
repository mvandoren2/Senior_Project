import { LightningElement } from 'lwc';
import { TableFormatter } from './tableFormatter';

export default class ActivityListView extends LightningElement {
    constructor() {
        super()

        this.updateData()
    }

    
    profileNum = 1
    formatNum = 1
    
    userProfile = {
        PSMan: this.profileNum === 1, 
        PSTeam: this.profileNum === 2,
        Sales: this.profileNum === 3
    }

    format = {
        large: this.formatNum === 1,
        medium: this.formatNum === 2,
        small: this.formatNum === 3
    }

    tableFormatter = new TableFormatter()

    tableData = this.tableFormatter.getEmptyTableFormat()
    columns = this.tableData.columns
    actions = this.tableData.actions
    data = this.tableData.data.dislpay

    updateData = () => {
        this.tableFormatter.getTableFormat()
            .then(data => this.fillTable(data))
    }

    fillTable = (data) => {
        this.tableData = data

        this.columns = this.tableData.columns
        this.actions = this.tableData.actions
        this.data = this.tableData.data.dislpay

        this.filteredData = [...this.data]
    }

    calculateRowWidth = (component, evt) => {
        console.log(component, evt)  
    }

    setNewWidth = (evt) => {
        console.log(evt)
    }

    flipShowAssign = () => {
        this.template.querySelector('c-assign-team-modal').toggleShow(this.rowID)
    }

    flipShowDecline = () => {
        this.template.querySelector('c-status-change-modal').toggleShow(this.rowID)
    }

    filters = []
    filteredData = [...this.data]

    sortAsc = true
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

    handleSort = (evt) => {
        let sortedBy = evt.target.dataset.item

        if(sortedBy == 'description') return

        if(this.sortedBy == sortedBy)
            this.sortAsc = !this.sortAsc

        else this.sortAsc = true

        let cloneData = [...this.filteredData]
        cloneData.sort(this.sortBy(sortedBy, this.sortAsc ? 1 : -1))
        this.filteredData = cloneData

        this.sortedBy = sortedBy
    }

    handleFilter = (evt) => {
        const filterField = evt.target.dataset.item

        const query = evt.target.value

        this.filters = this.filters.filter(item => item.field != filterField)
        
        if(query !== '')
            this.filters = this.filters.concat({field: filterField, query: query})

        this.filteredData = [...this.data]
        
        this.filters.forEach(filter => {
            this.filteredData = this.filteredData
                .filter(row => (
                    row[filter.field].toLowerCase().includes(filter.query.toLowerCase())
                ))
        })
    }

    rowID

    handleMenuAction = (evt) => {
        const parentElement = evt.target.closest('tr')

        this.rowID = parentElement.dataset.item

        if (evt.target.dataset.item == 'assign_request')
            this.flipShowAssign()

        if(evt.target.dataset.item == 'decline_request')
            this.flipShowDecline()   
    }
}
