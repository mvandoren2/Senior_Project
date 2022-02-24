import { LightningElement,api } from 'lwc';
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


}