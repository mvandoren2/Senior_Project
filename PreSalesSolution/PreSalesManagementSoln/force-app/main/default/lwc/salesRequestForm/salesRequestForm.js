import salesRequestForm from './templates/salesRequestForm.html'
import activityCreation_manager from './templates/activityCreation_manager.html'
import activityCreation_team from './templates/activityCreation_team.html'

import { LightningElement,api, track} from 'lwc';
import Id from '@salesforce/user/Id';
import OpportunityData from '@salesforce/apex/OpportunityData.OpportunityData';
import { ProductSelector } from './productSelector';
import { url, buildDetailedActivitiesList } from 'c/dataUtils';

export default class SalesRequestForm extends LightningElement {
    connectedCallback() {
        this.getActivityTypes()        
    }

    @api userProfile
    @api opportunity

    render() {
        switch(this.userProfile) {
            case 'Presales Manager':
                return activityCreation_manager

            case 'Presales Member':
                return activityCreation_team
            
            default:
                return salesRequestForm
        }
    }

    @api openModal() {
        this.initActivity()
        this.toggleModalClasses()
    }

    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    toggleModalClasses() {
        this.boxClasses = this.boxClasses === 'slds-modal' ? 
            'slds-modal slds-fade-in-open' : 'slds-modal'

        this.backdropClasses = this.backdropClasses === 'slds-backdrop' ? 
            'slds-backdrop slds-backdrop_open' : 'slds-backdrop'
    }

    initActivity() {
        this.activity = {}

        this.activity.opportunity_ID = this.opportunity
        this.getAccountId()
        this.activity.location = this.locationOptions[0].value
        this.activity.createdByMember = Id ? Id : '0055f0000041g1mAAA'        
        this.activity.members = []
        this.activity.flag = false
        this.activity.oneDateTime = null
        this.activity.twoDateTime = null
        this.activity.threeDateTime = null

        switch(this.userProfile) {
            case 'Presales Team' :
                this.activity.members = [this.activity.createdByMember]
                this.activity.status = 'Scheduled'
                break

            case 'Presales Manager' :
                this.activity.activeManager = this.activity.createdByMember
                this.activity.status = 'Accept'
                break

            default:
                this.activity.status = 'Request'
        }

        if(this.userProfile === 'Presales Team')
            

        this.teamManageLabel = 'Assign Team'
    }

    async getAccountId() {
        let opportunity_Id = this.activity.opportunity_ID !== undefined ? this.activity.opportunity_ID : '0065f000008xnXzAAI'
        
        const account = await OpportunityData({opportunity_Ids: [opportunity_Id]})

        this.activity.account_ID = account[0].Id    
    }
    
    //pull activity types and put into combobox
    
    activityTypes = [];

    getActivityTypes() {
        const endPoint = url + "activity/types/";
        fetch(endPoint, {
            method: "GET"
        })
        .then((response) => response.json())
        .then((data) => {
            this.activityTypes = data.map(item => ({label: item.name, value: item.type_ID.toString()}))
        })
    }

    @track productOptions = [];
    @track selectedProducts = [];
    
    productSelector = new ProductSelector(this)
   
    selectActivityType = (event) => {        
        this.activity.activity_Type = event.detail.value;

        this.setDisableButton()
    }

    activityLevelOptions = [
        {label: "Level 1", value: "Level 1"},
        {label: "Level 2", value: "Level 2"},
        {label: "Level 3", value: "Level 3"},
        {label: "Level 4", value: "Level 4"}
    ]

    setActivityLevel = (evt) => {
        this.activity.activity_Level = evt.target.value
    }
    
    locationOptions = [
        {label: 'On Site', value: 'Onsite'},
        {label: 'Remote', value: 'Remote'}
    ]

    setLocation = (evt) => {
        this.activity.location = evt.target.value
    }

    dateInputHandler = (evt) => {
        let dateNum = evt.target.dataset.item

        this.activity[dateNum] = evt.target.value

        this.setDisableButton()
        this.setDateWarningShowing()
    }

    updateNotes = (evt) => {
        this.activity.notes = evt.target.value;
    }

    setFlag() {
        this.activity.flag = !this.activity.flag
    }

    isSubmitDisabled = true

    setDisableButton() {
        this.isSubmitDisabled = !(
            this.selectedProducts.length &&
            this.activity.activity_Type &&
            this.activity.oneDateTime
        )
    }

    //Show Date Alert
    
    dateWarningShowing = false    
    
    setDateWarningShowing() {
        const singleDateSelected = 
            (this.activity.oneDateTime && !this.activity.twoDateTime && !this.activity.threeDateTime) ||
            (!this.activity.oneDateTime && this.activity.twoDateTime && !this.activity.threeDateTime) ||
            (!this.activity.oneDateTime && !this.activity.twoDateTime && this.activity.threeDateTime)

        this.dateWarningShowing =   singleDateSelected && 
                                    this.submitAttempted && 
                                    !this.dateWarningShowing && 
                                    this.userProfile === 'Sales Representative'
    }

    submitAttempted = false

    async handleSubmit() {
        this.submitAttempted = true

        this.setDateWarningShowing()

        if(!this.dateWarningShowing) {
            let submitResult = await this.handleUploadAction()

            if(!submitResult)
                this.showDupeWarning = true

            else if(this.userProfile === 'Presales Manager') {
                this.activity_ID = submitResult.activity_ID

                submitResult = await buildDetailedActivitiesList([submitResult])

                this.toggleModalClasses()

                this.template.querySelector('c-accept-activity-modal').showModal(submitResult[0])
            }

            else {
                this.signalAndReset()
                this.toggleModalClasses()
            }
        }   
    }

    //POST JSON ----------
    async handleUploadAction() {    
        let submittedActivity = await fetch(url + 'activity/', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(this.activity)
        
        }).then((res) => {
            let ret = false
            
            if(res.status === 201){
                ret = res.json()
            }

            return ret

        }).catch((error) => {
            console.error('Error: ', error);        
        });

        return submittedActivity
    }
    
    deleteCancelledActivity = () => {
        fetch(url + 'activity/' + this.activity_ID + '/', {
            method: 'DELETE'
        })

        this.toggleModalClasses()
    }

    signalAndReset = () => {
        this.dispatchEvent(new CustomEvent('submit'))
        this.reset()
    }

    cancelHandler = () => {
        this.reset()
        this.toggleModalClasses()
    }

    reset() {
        this.initActivity()

        this.template.querySelectorAll('.reset-handle').forEach(input => {
            input.value = null
        })

        this.template.querySelector('.location-select').value = 'Onsite'

        this.productSelector.reset()

        this.submitAttempted = false
    }
}
