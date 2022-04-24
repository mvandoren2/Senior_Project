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

    fillTable = (data) => {
        this.tableFormat = data

        this.columns = this.tableFormat.display.columns
        this.rows = this.tableFormat.display.data

        this.displayedRows = [...this.rows]
    }

    getParams = () => {
        const attributes = {
            recordType : this.getAttribute('data-recordtype'),
            recordId : this.getAttribute('data-recordid'),
            member : this.getAttribute('data-member'),
            product : this.getAttribute('data-product'),
            status : this.getAttribute('data-status'),
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

        if(attributes.format)
            params.format = attributes.format

        return params
    }
    
    @api loadTableRows = () => {
        this.tableFormatter.getTableFormat(this.getParams())
            .then(data => this.fillTable(data))
    }

    getRowById = (rowId) => {
        return this.tableFormat.activities.find(row => row.activity_ID === rowId)
    }
}
