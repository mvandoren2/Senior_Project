import { LightningElement } from 'lwc';
import { ColumnSortHandler } from './columnSortHandler';
import { RowActionHandler } from './rowActionHandler';
import { TableFilterHandler } from './tableFilterHandler';
import { TableFormatter } from './tableFormatter';

export default class ActivityListView extends LightningElement {
    constructor() {
        super()

        this.loadTableRows()
    }

    tableFormatter = new TableFormatter()
    columnSortHandler = new ColumnSortHandler(this)
    tableFilterHandler = new TableFilterHandler(this)
    rowActionHandler = new RowActionHandler(this)

    tableFormat = this.tableFormatter.getEmptyTableFormat()
    columns = this.tableFormat.columns
    actions = this.tableFormat.actions
    rows = this.tableFormat.data.display
    displayedRows = [...this.rows]

    fillTable = (data) => {
        this.tableFormat = data

        this.columns = this.tableFormat.columns
        this.actions = this.tableFormat.actions
        this.rows = this.tableFormat.data.display

        this.displayedRows = [...this.rows]
    }
    
    loadTableRows = () => {
        this.tableFormatter.getTableFormat()
            .then(data => this.fillTable(data))
    }

    getRowById = (rowId) => {
        let activityInd = this.tableFormat.data.activities.findIndex(row => row.activity_ID === rowId)

        return this.tableFormat.data.activities[activityInd]
    }
}
