import salesRequestForm from './templates/salesRequestForm.html'
import activityCreation_manager from './templates/activityCreation_manager.html'
import activityCreation_team from './templates/activityCreation_team.html'

import { LightningElement,api, track} from 'lwc';
import Id from '@salesforce/user/Id';
import OpportunityData from '@salesforce/apex/OpportunityData.OpportunityData';
import { ProductSelector } from './productSelector';
import { url } from 'c/dataUtils';
import { buildDetailedActivitiesList } from '../dataUtils/dataUtils';

export default class SalesRequestForm extends LightningElement {
    connectedCallback() {
        this.getActivityTypes()

        this.initActivity()
    }

    render() {
        this.userProfile = this.getAttribute('data-userprofile')

        switch(this.userProfile) {
            case 'Presales Manager':
                this.activity.status = 'Accept'
                return activityCreation_manager

            case 'Presales Member':
                this.activity.status = 'Scheduled'
                return activityCreation_team
            
            default:
                return salesRequestForm
        }
    }

    boxClasses = 'slds-modal'
    backdropClasses = 'slds-backdrop'

    @api toggleModalClasses() {
        this.boxClasses = this.boxClasses === 'slds-modal' ? 
            'slds-modal slds-fade-in-open' : 'slds-modal'

        this.backdropClasses = this.backdropClasses === 'slds-backdrop' ? 
            'slds-backdrop slds-backdrop_open' : 'slds-backdrop'
    }

    initActivity() {
        this.activity = {}

        this.activity.opportunity_ID = this.getAttribute('data-opportunity')
        this.getAccountId()
        this.activity.location = this.locationOptions[0].value
        this.activity.createdByMember = Id ? Id : '0055f0000041g1mAAA'        
        this.activity.members = []
        this.activity.flag = false
        this.activity.oneDateTime = null
        this.activity.twoDateTime = null
        this.activity.threeDateTime = null

        if(this.userProfile === 'Presales Team')
            this.activity.members = [this.activity.createdByMember]

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
            (this.activity.oneDateTime && this.activity.twoDateTime === undefined && this.activity.threeDateTime === undefined) ||
            (this.activity.oneDateTime === undefined && this.activity.twoDateTime && this.activity.threeDateTime === undefined) ||
            (this.activity.oneDateTime === undefined && this.activity.twoDateTime === undefined && this.activity.threeDateTime)

        this.dateWarningShowing =   singleDateSelected && 
                                    this.submitAttempted && 
                                    !this.dateWarningShowing && 
                                    this.userProfile === 'Sales Team'
    }

    submitAttempted = false

    handleSubmit() {
        this.submitAttempted = true

        this.setDateWarningShowing()

        if(!this.dateWarningShowing) {
            this.handleUploadAction()     
            this.toggleModalClasses()
            this.reset()
        }   
    }

    //POST JSON ----------
    async handleUploadAction() {    
    
        let submittedActivity = await fetch(url + 'activity/', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(this.activity)
        
        }).then(res => res.json()
        
        ).catch((error) => {
            console.error('Error:', error);
        
        });      

        submittedActivity = await buildDetailedActivitiesList([submittedActivity])
        submittedActivity = submittedActivity[0]

        this.template.querySelector('c-accept-activity-modal').showModal(submittedActivity)
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
    }
}
