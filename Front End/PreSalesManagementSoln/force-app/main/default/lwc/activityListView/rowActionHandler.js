import ActivityListView from "./activityListView"

export class RowActionHandler {
    constructor(parentObj) {
        this.parent = parentObj

        if (!(this.parent instanceof ActivityListView))
            throw new Error('RowActionHandler was invoked by an invalid parent')
    }

    showDetail() {        
        this.parent.template.querySelector('c-activity-detail-view').showModal(this.row)
    }

    showAccept() {
        this.parent.template.querySelector('c-accept-activity-modal').showModal(this.row)
    }
    
    showManageTeam() {
        this.parent.template.querySelector('c-assign-team-modal').showModal(this.row)
    }

    showReschedule() {
        this.parent.template.querySelector('c-reschedule-form').showModal(this.row)
    }

    showNotes() {
        this.parent.template.querySelector('c-note-modal').showModal(this.row)
    }

    showStatusChange(status) {
        let statusChangeModal = this.parent.template.querySelector('c-status-change-modal')

        statusChangeModal.setAttribute('data-status', status)

        statusChangeModal.showModal(this.row)
    }

    handleMenuAction = (evt) => {
        const parentElement = evt.target.closest('tr')

        const rowId = parseInt(parentElement.dataset.item, 10)

        const actionType = evt.target.dataset.item

        this.row = this.parent.getRowById(rowId)

        switch(actionType) {
            case 'show_details': {
                this.showDetail()
                break
            }

            case 'accept_request': {
                this.showAccept()
                break
            }

            case 'decline':
            case 'cancel':
            case 'complete': {
                this.showStatusChange(actionType)
                break
            }

            case 'date_change': {
                this.showReschedule()
                break
            }

            case 'manage_team': {
                this.showManageTeam()
                break
            }

            case 'notes': {
                this.showNotes()
                break
            }            

            default: break
        }
    }
}