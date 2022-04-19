import { LightningElement,api} from 'lwc';
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
        let opportunity_Id = this.opportunityId !== undefined ? this.opportunityId : '0065f000008xnXzAAI'
        
        this.account = await OpportunityData({opportunity_Ids: [opportunity_Id]})

        this.accountId = this.account[0].Id    
    }

    
    //pull activity types and put into combobox
    
    activityType = ''
    activityTypes = [];

    getActivityType(){
        const endPoint = this.url + "activity/types/";
        fetch(endPoint, {
            method: "GET"
        })
        .then((response) => response.json())
        .then((data) => {
            this.activityTypes = data.map(item => ({label: item.name, value: item.type_ID.toString()}))
        })
    }
    
   
    selectActivityType(event) {        
        this.activityType = event.detail.value;

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
            this.date1
        )
    }
    //Show Date Alert
    showAlert = false;
    setAlert = () => {
        this.showAlert =!this.showAlert
    }

    //POST JSON ----------
    handleUploadAction(){

        if (this.date1 !== undefined && this.date2 === undefined && this.date3 === undefined && this.showAlert === false) {
            this.showAlert = true;
        } 
        else if (this.showAlert === true || this.date1 !== undefined || this.date2 !== undefined || this.date3 !== undefined){
            let memberId = Id ? Id : '0055f0000041g1mAAA'
            let opportunity_Id = this.opportunityId !== undefined ? this.opportunityId : '0065f000008xnXzAAI'
            let selectedProducts = this.selectedProducts.map(product => product.product_ID)
            let jsonData = {
                "createdByMember": memberId,
                "opportunity_ID": opportunity_Id,
                "account_ID": this.accountId,
                "products": selectedProducts,
                "activity_Type": parseInt(this.activityType, 10),
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
    }