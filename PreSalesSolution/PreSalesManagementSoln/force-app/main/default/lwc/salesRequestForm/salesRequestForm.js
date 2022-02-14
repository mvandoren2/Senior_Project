import { LightningElement } from 'lwc';
import products from './productsList';

export default class SalesRequestForm extends LightningElement {
    products = products;
    filteredProducts = [];
    cart = [];
    clickedButtonLabel;
    
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

    value = ' ';

    get options() {
        return [
            { label: 'Opportunity #1', value: '1234445' },
            { label: 'Opportunity #2', value: '3455567' },
            { label: 'Opportunity #3', value: '8133456' },
            { label: 'Opportunity #4', value: '8139080' },
            { label: 'Opportunity #5', value: '8567890' },
            { label: 'Opportunity #6', value: '9178889' },
            { label: 'Opportunity #7', value: '9808891' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
    }

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }


}