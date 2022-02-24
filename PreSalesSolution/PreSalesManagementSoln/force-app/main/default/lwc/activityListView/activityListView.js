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

        if (query === '') {
            this.filters = this.filters.filter(item => item.filterField !== filterField)
        }
        
        
        else this.filters += [{field: filterField, query: query}]

        console.log(this.filters)

        for(let filter in this.filters) {
            this.filteredData = this.filteredData
                .filter(item => (
                    item[filter.field].toString().toLowerCase()
                        .includes(query.toLowerCase())
                ))
        }
    }

    calculateRowWidth = (component, evt, helper) => {
        const childObj = evt.target
        let parObj = childObj.parentNode;
        let count = 1;
        while(parObj.tagName != 'TH') {
            parObj = parObj.parentNode;
            count++;
        }
        console.log('final tag Name'+parObj.tagName);
        const mouseStart = evt.clientX;
        component.set("v.mouseStart",mouseStart);
        component.set("v.oldWidth",parObj.offsetWidth);    
    }

    setNewWidth = (component, evt, helper) => {
        const childObj = evt.target
        let parObj = childObj.parentNode;
        let count = 1;
        while(parObj.tagName != 'TH') {
            parObj = parObj.parentNode;
            count++;
        }
        const mouseStart = component.get("v.mouseStart");
        const oldWidth = component.get("v.oldWidth");
        const newWidth = evt.clientX- parseFloat(mouseStart)+parseFloat(oldWidth);
        parObj.style.width = newWidth+'px';    }
}
