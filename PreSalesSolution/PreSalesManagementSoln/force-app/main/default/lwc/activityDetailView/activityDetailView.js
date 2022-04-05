import { LightningElement, api } from 'lwc';

export default class ActivityDetailView extends LightningElement {
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'
    isShowing = false

    toggleModalClasses = () => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.isShowing = !this.isShowing
    }

    @api showModal = async (row) => {
        this.toggleModalClasses()

        if (row !== this.activity) {
            this.activity = row
            this.getNotes()
            this.setViewState()
            this.getAllMembers()
        }
    }

    closeModal = () => {
        this.toggleModalClasses()

        let reloadParentTable = new CustomEvent('reloadtablerows')
        
        this.dispatchEvent(reloadParentTable)
    }

    getAllMembers = async () => {
        let memberIds = this.notes.map(note => note.member)

        console.log(memberIds)
    }

    notes = []
    url = 'http://localhost:8080/api/activity/'

    getNotes = () => {
        fetch(this.url + this.activity.detailed.activity_ID + '/notes/')
            .then(response => response.json())
            .then(data => {this.notes = data})
            .catch(err => console.error(err))
    }

    dateIsPast = false
    teamIsAssigned = true

    setViewState = () => {
        this.dateIsPast = new Date(this.activity.detailed.selectedDateTime) < Date.now()
        this.teamIsAssigned = this.activity.detailed.members.length
    }

    get dateIsOptional () {
        const boolReturn = this.activity.detailed.selectedDateTime === null

        if (boolReturn) this.setDateArray()

        return boolReturn
    }



    setDateArray = () => {
        const activity = this.activity.detailed

        this.dates = [activity.oneDateTime, activity.twoDateTime, activity.threeDateTime]

        const dateDisplayOptions = {
            weekday:'short', 
            month:"numeric", 
            day:'numeric', 
            year:'2-digit', 
            hour:'numeric', 
            minute:'2-digit', 
            hourCycle:'h12'
        }

        this.dates = this.dates.map((date, i) => ({
            id : i,
            date: new Date(date),
            localeString: new Date(date).toLocaleString('en-US', dateDisplayOptions),
            selected: false
        }))

        this.dates = this.dates.filter(date => date.date > Date.now())

        if(this.dates.length === 1) {
            this.dates[0].selected = true
        }
    }

    selectDateHandler = (evt) => {
        this.dates.forEach(date => {
            date.selected = false
        });
        
        let dateId = parseInt(evt.target.dataset.item, 10);

        let i = this.dates.findIndex(date => date.id === dateId)

        this.dates[i].selected = true

        this.selectedDate = this.dates[i]
    }
    //Accepts request
    acceptRequestHandler = () => {
        let patchBody = {};

        let newStatus = 'Accept'

        if(this.dateIsOptional && this.selectedDate !== undefined) {
            newStatus = 'Scheduled'
            patchBody.selectedDateTime = this.selectedDate.date.toISOString()
        }

        patchBody.status = newStatus

        fetch(this.url + this.activity.detailed.activity_ID + '/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patchBody)

        }).catch(err => console.error(err))

        this.closeModal()
    }

    openTeamModal = () => {
        this.template.querySelector('c-assign-team-modal').toggleShow(this.activity)

    }
}