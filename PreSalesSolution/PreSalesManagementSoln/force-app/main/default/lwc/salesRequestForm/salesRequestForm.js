import { LightningElement,api,track } from 'lwc';
import products from './productsList';

export default class SalesRequestForm extends LightningElement {
    products = products;
    filteredProducts = [];
    cart = [];
    clickedButtonLabel;
    

    //check
    @api recordId;


    //search for products in the text bar
    searchEvt = (evt) => {
        const value = evt.target.value;
        if (value === '') {
            this.filteredProducts = [];
        } else {
            const lValue = value.toLowerCase();
            this.filteredProducts = this.products.filter(item => item.name.toLowerCase().includes(lValue));
        }
    }

    //event button to add to cart
    addProd = (evt) => {
        const prod = evt.target.value;
        if (this.cart.includes(prod)) {
            return;
        }
        this.cart.push(prod);
        this.products = this.products.filter(item => item.id !== prod.id);
        this.searchEvt({ target: { value: '' } });
        document.getElementById('search').value = ''
    }

    //event button to remove from cart
    removeProd = (evt) => {
        const prod = evt.target.value;
        this.products.push(prod);
        this.cart = this.cart.filter(item => item.id !== prod.id);
        this.searchEvt({ target: { value: '' } });
    }

    //Dropdown menu for Pre-sales activities

    value = ' ';
    get options() 
    {
        return [
            { label: 'Demonstration', value: 'Demo' },
            { label: 'Guided lab', value: 'Lab' },
            { label: 'Sandbox', value: 'SandBox' },
            { label: 'Consult', value: 'Consult' },
            { label: 'Host Sale Support', value: 'Support' },
            { label: 'Shadow', value: 'Shadow' },
            { label: 'Proposal Request', value: 'Proposal' },
        ];
     
    }
   
    handleChange(event) {
        
        this.value = event.detail.value;
    
    }

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
    //for the new submit button
    handleSubmit(event) 
    {
        console.log('onsubmit event recordEditForm'+ event.detail.fields);
    }
    handleSuccess(event) 
    {
        console.log('onsuccess event recordEditForm', event.detail.id);
    }
    @track description;
    textDescription(event){
        console.log(this.description)
        this.description = event.target.value;
    }
    get disableButton(){
       return !(this.description 
                && this.cart.push()
                && this.value !== ' '
                && this.myDate_1 
                && this.select_Time_1)
    }
      
    //----------Sending JSON to backend--------------------

    @track myDate_1 = 0;
    dateInput_1(event){
        this.myDate_1 = event.target.value;
    }
    @track select_Time_1 = 0;
    timeInput_1(event){
        this.select_Time_1 = event.target.value;
    }
    @track myDate_2 = 0;
    dateInput_2(event){
        this.myDate_2 = event.target.value;
    }
    @track select_Time_2 = 0;
    timeInput_2(event){
        this.select_Time_2 = event.target.value;
    }
    @track myDate_3 = 0;
    dateInput_3(event){
        this.myDate_3 = event.target.value;
    }
    @track select_Time_3 = 0;
    timeInput_3(event){
        this.select_Time_3 = event.target.value;
    }


    jsonData = {
            "members": [21312312],
            "products": [
                {
                    "external_product_ID": 1,
                    "name": "Coffee"
                },
                {
                    "external_product_ID": 2,
                    "name": "Icecream"
                }
            ],
            "opportunity_ID": this.recordId,
            "oneDateTime": [this.myDate_1, this.select_Time_1],
            "twoDateTime": [this.myDate_2, this.select_Time_2],
            "threeDateTime": [this.myDate_3, this.select_Time_3],
            "selectedDateTime": null,
            "description": this.template.querySelector("lightning-textarea"),
            "flag": false
    }

    //-----POST-----

    pushJsonData(){
        console.log(this.jsonData);

        fetch('http://localhost:8050/api/add_activity/', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: this.jsonData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}