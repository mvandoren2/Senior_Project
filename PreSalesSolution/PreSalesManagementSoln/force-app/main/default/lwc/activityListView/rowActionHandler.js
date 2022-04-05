import ActivityListView from "./activityListView"

export class RowActionHandler {
    constructor(parentObj) {
        this.parent = parentObj

        if (!(this.parent instanceof ActivityListView))
            throw new Error('RowActionHandler was invoked by an invalid parent')
    }

    flipShowAssign = () => {
        this.parent.template.querySelector('c-assign-team-modal').toggleShow(this.row)
    }

    flipShowDecline = () => {
        this.parent.template.querySelector('c-status-change-modal').toggleShow(this.row)
    }

    flipShowDetail = () => {
        this.parent.template.querySelector('c-activity-detail-view').showModal(this.row)
    }

    handleMenuAction = (evt) => {
        const parentElement = evt.target.closest('tr')

        const rowId = parseInt(parentElement.dataset.item, 10)

        this.row = this.parent.getRowById(rowId)

        if (evt.target.dataset.item === 'assign_request')
            this.flipShowAssign()

        if(evt.target.dataset.item === 'decline_request')
            this.flipShowDecline()   
            
        if(evt.target.dataset.item === 'show_details')
            this.flipShowDetail()   
    }
}