//Template imports
import viewDetail                   from './templates/activityDetailView.html'
import manageRequest                from './templates/activityDetailView_manager-request.html'
import manageActivity               from './templates/activityDetailView_manager-active.html'
import memberActivity               from './templates/activityDetailView_member-active.html' 
import leadMemberActivity           from './templates/activityDetailView_lead-active.html' 
import salesRequest                 from './templates/activityDetailView_sales-request.html'
import salesActivity                from './templates/activityDetailView_sales-active.html'

import { LightningElement, api, track } from 'lwc';
import Id from "@salesforce/user/Id"
import { url } from 'c/dataUtils'

export default class ActivityDetailView extends LightningElement {
    //
    //Rendering Methods
    //
    
    connectedCallback() {
        this.fetchCurrentUser()
    }

    fetchCurrentUser() {
        this.userID = Id ? Id : '0055f0000041g1mAAA'
        const urlString = url + 'member/' + this.userID + '/'

        fetch(urlString)
            .then(res => res.json())
            .then(data => {
                this.user = data
                this.userRole = data.user_role.name
            })
    }
    
    render() {
        if(this.isOpen){

            switch(this.userRole) {
                
                case 'Presales Manager': 
                    return this.getManagerTemplate()

                case 'Presales Member':
                    return this.getMemberTemplate()

                default: return this.getSalesTemplate()
            }
        }

        return viewDetail
    }

    getManagerTemplate() {

        switch(this.activity.status) {
            case 'Request':
                return manageRequest

            case 'Reschedule': 
                return manageRequest

            case 'Accept':
            case 'Scheduled':
            case 'Expire':
                return manageActivity

            default: 
                return viewDetail
        }
    }

    getMemberTemplate() {
        switch(this.activity.status) {
            case 'Accept':
            case 'Scheduled':
            case 'Expire': {
                let template = memberActivity
                
                if(this.activity.leadMember && this.userID === this.activity.leadMember.Id){
                    
                    template = leadMemberActivity
                }
                
                return template
            }

            default: 
                return viewDetail
        }
    }

    getSalesTemplate() {
        switch(this.activity.status) {
            case 'Request':
            case 'Reschedule': 
                return salesRequest

            case 'Accept':
            case 'Scheduled':
            case 'Expire':
                return salesActivity

            default: 
                return viewDetail
        }
    }

    //Show and hide modal

    isOpen = false

    @api showModal(activity) {
        if (activity !== this.activity) {
            this.activity = Object.assign({}, activity)
            this.activity_unmodified = Object.assign({}, activity)
            
            this.setViewState()
        }

        this.isOpen = true
        this.isHidden = false

        this.toggleModalClasses()
    }

    isHidden = true

    hideModal() {
        this.isHidden = true
        this.toggleModalClasses()
    }

    unhideModal() {
        this.isHidden = false
        this.toggleModalClasses()
    }

    closeModal = (evt) => {

        this.isOpen = false
        this.isHidden = true

        this.toggleModalClasses()

        if(evt.type === 'accept' || evt.type === 'submit')
            this.dispatchEvent(new CustomEvent('reloadtablerows'))
    }
    
    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses() {
        this.boxClasses = !this.isHidden ? 
            'slds-modal slds-fade-in-open' : 'slds-modal'

        this.backdropClasses = !this.isHidden ? 
            'slds-backdrop slds-backdrop_open' : 'slds-backdrop'
    }

    //
    //Populate view fields
    //

    @track userRequestedActivity = false

    setViewState() {
        this.setProducts()
        this.setDateIsOptional()
        this.requestIsReschedule = this.activity.status === 'Reschedule'
        this.teamIsAssigned = this.activity.team.length        
        this.userRequestedActivity = this.activity.submittedBy.Id === this.userID
    }

    products = []

    setProducts() {
        this.products = this.activity.products.map((product, i) => ({name: product.name, id: i}))
    }

    dateIsOptional = true

    setDateIsOptional() {
        let dateIsNotSelected = !this.activity.selectedDate

        if(dateIsNotSelected) {
            dateIsNotSelected = this.validateDates()
            this.setDateOptions()
        }

        this.dateIsOptional = dateIsNotSelected
    }

    validateDates() {
        this.activity.dates = this.activity.dates.filter(date => date.date > Date.now())

        const oneDateRemains = this.activity.dates.length === 1

        if(oneDateRemains) {
            this.activity.dates[0].selected = true
            this.activity.selectedDate = this.activity.dates[0]
        }

        return !oneDateRemains
    }

    dateOptions = []

    setDateOptions() {
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
            this.activity.selectedDate = this.activity.dates.find(date => date.id === selectedDateId)

        this.activityModified = true
    }

    editDateOptions = (evt) => {
        this.activity.dates = evt.detail.dates
        this.activity_unmodified = this.activity

        this.setDateIsOptional()
    }

    selectTeam = (evt) => {
        this.activity.team = evt.detail.team
        this.activity.leadMember = evt.detail.leadMember

        this.activityModified = true

        this.unhideModal()
    }

    setRescheduleFlag = () => {
        this.activity.selectedDate.localeString = 'Reschedule request sent'

        this.unhideModal()
    }

    //Patch Activity
    activityModified = false

    saveChanges = () => {
        this.patchActivity()

        this.activity_unmodified = this.activity

        this.dateOptions = []
        this.setDateIsOptional()

        this.activityModified = false
    }

    patchActivity() {
        let activityPatchBody = {}

        activityPatchBody.activity_ID = this.activity.activity_ID
        activityPatchBody.members = this.activity.team.map(member => member.Id)

        if(this.activity.selectedDate){
            activityPatchBody.selectedDateTime = this.activity.selectedDate.date.toISOString()
            activityPatchBody.status = 'Scheduled'
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

    cancelChanges = () => {
        this.activity = this.activity_unmodified

        this.activityModified = false
    }


    openTeamModal = () => {
        this.hideModal()

        this.template.querySelector('c-assign-team-modal').showModal(this.activity)

    }

    openAcceptActivityModal = () => {
        this.hideModal()

        this.template.querySelector('c-accept-activity-modal').showModal(this.activity)
    }

    openStatusChangeModal = () => {
        this.hideModal()

        this.template.querySelector('c-status-change-modal').showModal(this.activity)
    }

    openRescheduleModal = () => {
        this.hideModal()

        this.template.querySelector('c-reschedule-form').showModal(this.activity)
    }
}
