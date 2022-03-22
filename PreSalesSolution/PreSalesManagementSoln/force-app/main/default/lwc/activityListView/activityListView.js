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


    tableData = this.tableFormatter.getEmptyTableFormat()
    columns = this.tableData.columns
    actions = this.tableData.actions
    rows = this.tableData.rows.dislpay
    displayedRows = [...this.rows]

    
    updateData = () => {
        this.tableFormatter.getTableFormat()
            .then(data => this.fillTable(data))
    }

    fillTable = (data) => {
        this.tableData = data

        this.columns = this.tableData.columns
        this.actions = this.tableData.actions
        this.rows = this.tableData.rows.dislpay

        this.displayedRows = [...this.rows]
    }
}
