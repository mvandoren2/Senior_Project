import { api, LightningElement } from 'lwc';
import { ColumnSortHandler } from './columnSortHandler';
import { RowActionHandler } from './rowActionHandler';
import { TableFilterHandler } from './tableFilterHandler';
import { TableFormatter } from './tableFormatter';

export default class ActivityListView extends LightningElement {
    connectedCallback() {
        
        this.loadTableRows()
    }

    tableFormatter = new TableFormatter()
    columnSortHandler = new ColumnSortHandler(this)
    tableFilterHandler = new TableFilterHandler(this)
    rowActionHandler = new RowActionHandler(this)

    tableFormat = this.tableFormatter.getEmptyTableFormat()
    columns = this.tableFormat.display.columns
    rows = this.tableFormat.display.data
    displayedRows = [...this.rows]

    fillTable(data) {
        this.tableFormat = data

        this.columns = this.tableFormat.display.columns
        this.rows = this.tableFormat.display.data

        this.displayedRows = [...this.rows]
    }

    @api recordType
    @api recordId
    @api member
    @api product
    @api status
    @api activityType
    @api dateRangeStart
    @api dateRangeEnd
    @api flag
    @api format

    getParams() {
        let params = {}

        if(this.recordType)
            params[this.recordType] = this.recordId

        if(this.member)
            params.member = this.member

        if(this.product)
            params.product = this.product

        if(this.status)
            params.status = this.status

        if(this.activityType)
            params.activityType = this.activityType
        
        if(this.dateRangeStart)
            params.dateRangeStart = this.dateRangeStart

        if(this.dateRangeEnd)
            params.dateRangeEnd = this.dateRangeEnd

        if(this.flag)
            params.flag = 'true'

        if(this.format)
            params.format = this.format

        return params
    }
    
    @api loadTableRows() {
        this.tableFormatter.getTableFormat(this.getParams())
            .then(data => this.fillTable(data))
    }

    getRowById(rowId) {
        const activity = Object.assign({}, this.tableFormat.activities.find(row => row.activity_ID === rowId))

        return activity
    }
}
