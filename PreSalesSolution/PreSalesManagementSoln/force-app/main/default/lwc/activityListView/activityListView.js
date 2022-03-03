import { LightningElement, track } from 'lwc';
import { getTableColumns, TableFormatter } from './tableFormatter';

export default class ActivityListView extends LightningElement {
    constructor() {
        super()

        this.tableDataObject.getTableFormat()
            .then(data => this.fillTable(data))           
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

    tableDataObject = new TableFormatter(this.profileNum)

    tableData = this.tableDataObject.getEmptyTableFormat()
    columns = this.tableData.columns
    actions = this.tableData.actions
    data = this.tableData.data.dislpay

    get columns() {
        return this.tableData.columns
    }

    get actions() {
        return this.tableData.actions
    }

    get data() {
        this.filteredData = [... this.tableData.data]
        return this.filteredData
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

    filters = []
    filteredData = [...this.data]

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
    }

    
}
