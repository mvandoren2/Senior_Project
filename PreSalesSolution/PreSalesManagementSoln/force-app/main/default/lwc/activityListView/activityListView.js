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

    getParams() {
        const attributes = {
            recordType : this.getAttribute('data-record-type'),
            recordId : this.getAttribute('data-record-id'),
            member : this.getAttribute('data-member'),
            product : this.getAttribute('data-product'),
            status : this.getAttribute('data-status'),
            activityType : this.getAttribute('data-activity-type'),
            date : this.getAttribute('data-activity-date'),
            flag : this.getAttribute('data-flagged'),
            format : this.getAttribute('data-format')
        }

        let params = {}

        if(attributes.recordType)
            params[attributes.recordType] = attributes.recordId

        if(attributes.member)
            params.member = attributes.member

        if(attributes.product)
            params.product = attributes.product

        if(attributes.status)
            params.status = attributes.status

        if(attributes.activityType)
            params.activityType = attributes.activityType
        
        if(attributes.date)
            params.date = new Date(attributes.date)

        if(attributes.flag)
            params.flag = 'true'

        if(attributes.format)
            params.format = attributes.format

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
