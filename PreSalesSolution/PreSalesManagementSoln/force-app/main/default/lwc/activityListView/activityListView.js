import { LightningElement, track } from 'lwc';
import { getTableColumns } from './tableColumns';

export default class ActivityListView extends LightningElement {
    
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

    tableData = getTableColumns(this.profileNum)

    columns = this.tableData.columns
    actions = this.tableData.actions
    data = this.tableData.data.dislpay

    connectedCallback() {
        setTimeout(() => {
            this.tableData = getTableColumns(this.profileNum)

            this.columns = this.tableData.columns
            this.actions = this.tableData.actions
            this.data = this.tableData.data.dislpay

            this.filteredData = [...this.data]
        }, 500)
    }

    calculateRowWidth = (component, evt) => {
        console.log(component, evt)  
    }

    setNewWidth = (evt) => {
        console.log(evt)
    }

    flipShowAssign = () => {
        this.template.querySelector('c-pre-Sales-Team-Assignment-Form').toggleShow(this.rowID)
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
