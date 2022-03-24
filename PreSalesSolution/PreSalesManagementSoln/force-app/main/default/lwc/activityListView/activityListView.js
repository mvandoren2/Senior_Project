import { LightningElement } from 'lwc';
import { ColumnSortHandler } from './columnSortHandler';
import { RowActionHandler } from './rowActionHandler';
import { TableFilterHandler } from './tableFilterHandler';
import { TableFormatter } from './tableFormatter';

export default class ActivityListView extends LightningElement {
    constructor() {
        super()

        this.updateData()
    }

    tableFormatter = new TableFormatter()
    columnSortHandler = new ColumnSortHandler(this)
    tableFilterHandler = new TableFilterHandler(this)
    rowActionHandler = new RowActionHandler(this)

    tableFormat = this.tableFormatter.getEmptyTableFormat()
    columns = this.tableFormat.columns
    actions = this.tableFormat.actions
    rows = this.tableFormat.rows.dislpay
    displayedRows = [...this.rows]
  
    reloadTableRows = () => {
        console.log('parent')
        this.updateData()
    }

    updateData = () => {
        this.tableFormatter.getTableFormat()
            .then(data => this.fillTable(data))
    }

    getRowById = (rowId) => {
        return this.tableFormat.rows.detailed.filter(row => row.activity_ID === rowId)[0]
    }

    fillTable = (data) => {
        this.tableFormat = data

        this.columns = this.tableFormat.columns
        this.actions = this.tableFormat.actions
        this.rows = this.tableFormat.rows.dislpay

        this.displayedRows = [...this.rows]
    }
}
