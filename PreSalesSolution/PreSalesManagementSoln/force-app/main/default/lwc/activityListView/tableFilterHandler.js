import ActivityListView from "./activityListView"

export class TableFilterHandler {
    constructor(parentObj) {
        this.parent = parentObj

        if(!(this.parent instanceof ActivityListView))
            throw new Error('TableFilterHandler was invoked by an invalid parent')        
    }

    filters = []

    handleFilter = (evt) => {
        const filterField = evt.target.dataset.item

        const query = evt.target.value

        this.filters = this.filters.filter(item => item.field !== filterField)
        
        if(query !== '')
            this.filters = this.filters.concat({field: filterField, query: query})

        let rows = [...this.parent.rows]
        
        this.filters.forEach(filter => {
            rows = rows.filter(row => (row.data.find(cell => cell.id === filter.field).data.toLowerCase()
                .includes(filter.query.toLowerCase())
            ))
        })

        this.parent.displayedRows = rows
    }

}