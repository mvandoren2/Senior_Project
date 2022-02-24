import { LightningElement } from 'lwc';
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

    calculateRowWidth = (component, evt) => {
        console.log(component, evt)  
    }

    setNewWidth = (evt) => {
        console.log(evt)
    }

    flipShowAssign = () => {
        this.showAssign = !this.showAssign
    }

    showAssign = false
    rowID

    handleMenuAction = (evt) => {
        const parentElement = evt.target.closest('tr')

        this.rowID = parentElement.dataset.item

        if (evt.target.dataset.item == 'assign_request')
            this.flipShowAssign() 
    }
}