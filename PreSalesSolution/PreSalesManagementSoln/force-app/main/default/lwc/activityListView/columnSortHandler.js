import ActivityListView from "./activityListView"

export class ColumnSortHandler {
    constructor(parentObj) {
        this.parent = parentObj

        if(!(this.parent instanceof ActivityListView)) 
            throw (new Error('ColumnSortHandler invoked by invalid parent'))
    }

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

        if(sortedBy === 'description') return

        if(this.sortedBy === sortedBy)
            this.sortAsc = !this.sortAsc

        else this.sortAsc = true

        let cloneData = [...this.parent.displayedRows]
        cloneData.sort(this.sortBy(sortedBy, this.sortAsc ? 1 : -1))
        this.parent.displayedRows = cloneData

        this.sortedBy = sortedBy
    }
}