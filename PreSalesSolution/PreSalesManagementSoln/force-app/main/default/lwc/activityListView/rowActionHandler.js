import ActivityListView from "./activityListView"

export class RowActionHandler {
    constructor(parentObj) {
        this.parent = parentObj

        if (!(this.parent instanceof ActivityListView))
            throw new Error('RowActionHandler was invoked by an invalid parent')
    }

    flipShowAssign = () => {
        this.parent.template.querySelector('c-assign-team-modal').toggleShow(this.rowID)
    }

    flipShowDecline = () => {
        this.parent.template.querySelector('c-status-change-modal').toggleShow(this.rowID)
    }

    handleMenuAction = (evt) => {
        const parentElement = evt.target.closest('tr')

        this.rowID = parentElement.dataset.item

        if (evt.target.dataset.item === 'assign_request')
            this.flipShowAssign()

        if(evt.target.dataset.item === 'decline_request')
            this.flipShowDecline()   
    }
}