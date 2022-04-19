import { LightningElement, api } from 'lwc';
import Id from "@salesforce/user/Id"

export default class AcceptActivityModal extends LightningElement {
    isShowing = false
    
    @api showModal = (activity) => {
        this.toggleModalClasses()

        this.isShowing = true

        if (activity !== this.activity) {
            this.activity = activity
            this.teamIsNotAssigned = this.activity.team.length === 0

            this.setDateOptions()
        }
    }

    closeModal = (evt) => {
        this.dispatchEvent(evt)
        
        this.toggleModalClasses()

        this.isShowing = false
    }    
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses = () => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }

    dateOptions = []

    setDateOptions = () => {
        this.dateOptions.push({label: 'Allow Team Lead to select date', value: "0"})

        this.dateOptions = this.dateOptions.concat(
            this.activity.dates.map(date => ({
                label: date.localeString,
                value: date.id.toString()
            }))
        )
    }

    selectDate = (evt) => {
        const selectedDateId = parseInt(evt.target.value, 10)

        if(selectedDateId !== 0)
            this.activity.selectedDateTime = 
                this.activity.dates.find(date => date.id === selectedDateId)
    }

    openTeamModal = () => {
        this.toggleModalClasses()

        this.template.querySelector('c-assign-team-modal').showModal(this.activity)
    }

    teamIsNotAssigned = true 

    selectTeam = (evt) => {
        this.activity.team = evt.detail.team
        this.activity.leadMember = evt.detail.leadMember

        this.teamIsNotAssigned = false

        this.toggleModalClasses()
    }

    addNewNote = (evt) => {
        this.activity.notes = evt.detail.note
    }

    cancel = () => {
        let cancelSignal = new CustomEvent('cancel')

        console.log(this.activity.status)

        this.closeModal(cancelSignal)
    }

    acceptActivity = () => {
        let acceptSignal = new CustomEvent('accept')

        this.patchActivity()
        this.postNote()   

        this.closeModal(acceptSignal)     
    }

    url = 'http://localhost:8080/api/activity/'

    patchActivity = () => {
        let activityPatchBody = {}

        activityPatchBody.status = 'Accept'
        activityPatchBody.activity_ID = this.activity.activity_ID
        activityPatchBody.members = this.activity.team.map(member => member.Id)

        if(this.activity.selectedDateTime){
            activityPatchBody.selectedDateTime = this.activity.selectedDateTime.date.toISOString()
            activityPatchBody.status = 'Scheduled'
        }

        fetch(this.url + this.activity.activity_ID + '/', {
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

    postNote = () => {
        if(this.activity.notes !== undefined) {
            let notePostBody = {
                member: Id ? Id : '0055f0000041g1mAAA',
                note_text: this.activity.notes
            }

            fetch(this.url + this.activity.activity_ID + '/notes/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notePostBody)
            })
        }
    }
}