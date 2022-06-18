import { LightningElement, api } from 'lwc';
import Id from "@salesforce/user/Id"
import { url } from 'c/dataUtils';
import SendNinjaNotification from '@salesforce/apex/NinjaNotifications.SendNinjaNotification';

export default class AcceptActivityModal extends LightningElement {
    isShowing = false
    
    @api showModal(activity) {        
        this.toggleModalClasses()

        this.isShowing = true

        if (activity !== this.activity) {
            this.activity = activity
            this.teamIsNotAssigned = this.activity.team.length === 0

            this.setDateOptions()
        }
    }

    closeModal(evt) {
        this.dispatchEvent(evt)
        
        this.toggleModalClasses()

        this.isShowing = false
    }    
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses() {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }

    dateOptions = []

    setDateOptions() {
        this.dateOptions = []

        this.dateOptions.push({label: 'Allow Team Lead to select date', value: "0"})

        this.dateOptions = this.dateOptions.concat(
            this.activity.dates.map(date => ({
                label: date.localeString,
                value: date.id.toString()
            }))
        )
    }

    selectDate(evt) {
        const selectedDateId = parseInt(evt.target.value, 10)

        if(selectedDateId !== 0)
            this.activity.selectedDateTime = 
                this.activity.dates.find(date => date.id === selectedDateId)
    }

    openTeamModal() {
        this.toggleModalClasses()

        this.template.querySelector('c-assign-team-modal').showModal(this.activity)
    }

    teamIsNotAssigned = true 

    selectTeam(evt) {
        this.activity.team = evt.detail.team
        this.activity.leadMember = evt.detail.leadMember

        this.teamIsNotAssigned = false

        this.toggleModalClasses()
    }

    addNewNote(evt) {
        this.activity.notes = evt.detail.note
    }

    cancel() {
        let cancelSignal = new CustomEvent('cancel')

        this.closeModal(cancelSignal)
    }

    acceptActivity() {
        let acceptSignal = new CustomEvent('accept')

        this.patchActivity()
        this.postNote()
        this.sendNotifications()

        this.closeModal(acceptSignal)     
    }

    status = 'Accept'

    patchActivity() {
        let activityPatchBody = {}

        activityPatchBody.activeManager = Id ? Id : '0055f0000041g1mAAA'
        activityPatchBody.activity_ID = this.activity.activity_ID
        activityPatchBody.members = this.activity.team.map(member => member.Id)
        activityPatchBody.leadMember = this.activity.leadMember

        if(this.activity.selectedDateTime){
            activityPatchBody.selectedDateTime = this.activity.selectedDateTime.date.toISOString()
            this.status = 'Scheduled'
            activityPatchBody.status = this.status
        }

        fetch(url + 'activity/' + this.activity.activity_ID + '/', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityPatchBody)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    postNote() {
        if(this.activity.notes !== undefined) {
            let notePostBody = {
                member: Id ? Id : '0055f0000041g1mAAA',
                note_text: this.activity.notes
            }

            fetch(url + 'activity/' + this.activity.activity_ID + '/notes/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notePostBody)
            })
        }
    }

    async sendNotifications() {
        const notificationWrapper = {
            activityStatus: this.activity.status === 'Accept' ? 'Assigned' : this.status,
            opportunityId: this.activity.opportunity.Id,
            activityType: this.activity.activity_Type.name,
            dateLocaleString: this.activity.selectedDate ? this.activity.selectedDate.localeString : null,
            team: this.activity.team.map(member => member.Id),
            submittedBy: [this.activity.submittedBy.Id]
        }

        console.log(this.activity)

        SendNinjaNotification({activityInfo: notificationWrapper});
    }
}
