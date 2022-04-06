import { LightningElement,api } from 'lwc';
import Id from '@salesforce/user/Id';
import OpportunityData from '@salesforce/apex/OpportunityData.OpportunityData';
import { ProductSelector } from './productsList';

export default class SalesRequestForm extends LightningElement {
    connectedCallback () {
        this.getAccountId()
        this.getActivityType()
    }

    @api opportunityId;

    url = "http://localhost:8080/api/"

    getAccountId = async () => {
        let opportunity_Id = this.opportunityId !== undefined ? this.opportunityId : '0065f000008xnXpAAI'

        this.account = await OpportunityData({opportunity_IDs: [opportunity_Id]})

        this.accountId = this.account[0].Id    
    }


    //pull activity types and put into combobox
    
    activityType = ''
    activityTypes = [];

    getActivityType(){
        const endPoint = this.url+ "activity_types/";
        fetch(endPoint, {
            method: "GET"
        })
        .then((response) => response.json())
        .then((jsonResponse) => {
            let arr = [];
            for(let i = 0; i < jsonResponse.length; i++){
                arr.push({ label : jsonResponse[i].name, value : jsonResponse[i].type_ID.toString() })
            }
            
            this.activityTypes = arr;
        })
    }
    
   
    selectActivityType(event) {        
        this.activityType = event.detail.value;

        this.setDisableButton()
    }

    activityLevel = '';

    activityLevels = [
            { label: 'Level 1', value: 'Level 1' },
            { label: 'Level 2', value: 'Level 2' },
            { label: 'Level 3', value: 'Level 3' },
            { label: 'Level 4', value: 'Level 4' },
    ];
   
    selectActivityLevel(event) {        
        this.activityLevel = event.detail.value;

        this.setDisableButton()
    }

    selectedProducts = [];
    filteredProducts = [];
    searchBarEmpty = true
    
    productSelector = new ProductSelector(this)

    locationOptions = [
        {label: 'On Site', value: 'Onsite'},
        {label: 'Remote', value: 'Remote'}
    ]

    location = this.locationOptions[0].value

    setLocation = (evt) => {
        this.location = evt.target.value
    }

    dateInputHandler = (evt) => {
        let name = evt.target.dataset.item

        this[name] = evt.target.value

        this.setDisableButton()
    }

    alternateDates = false 

    showAlternateDates = () => {
        this.alternateDates = !this.alternateDates
    }

    notes = '';

    updateNotes = (evt) => {
        this.notes = evt.target.value;
    }

    unexpectedFlag = false

    setFlag = () => {
        this.unexpectedFlag = !this.unexpectedFlag
    }


    isSubmitDisabled = true

    setDisableButton() {
        this.isSubmitDisabled = !(
            this.selectedProducts.length &&
            this.activityType !== '' &&
            this.activityLevel !== '' &&
            this.date1
        )
    }

    //POST JSON ----------
    handleUploadAction(){
        let memberId = Id ? Id : '0055f0000041g1mAAA'
        let opportunity_Id = this.opportunityId !== undefined ? this.opportunityId : '0065f000008xnXpAAI'

        let jsonData = {
            "createdByMember": memberId,
            "opportunity_ID": opportunity_Id,
            "account_ID": this.accountId,
            "products": this.selectedProducts,
            "activity_Type": parseInt(this.activityType, 10),
            "activity_Level": this.activityLevel,
            "location": this.location,
            "oneDateTime": this.date1,
            "twoDateTime": this.date2 ? this.date2 : null,
            "threeDateTime": this.date3 ? this.date3 : null,
            "status": "Request",
            "notes": this.notes,
            "flag": this.unexpectedFlag
        }
        
        fetch(this.url + 'activity/', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(jsonData)

            }).catch((error) => {
                console.error('Error:', error);
            });
    }
}
