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


//--JSON 
    var xhr = new XMLHttpRequest()
    var url = 'http://localhost:8050/api/add_activity'

    xhr.open("POST", url , true)

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UFT-8')
    xhr.onreadystatechange = function(){
        if (this.readyState === 4 && this.status === 201) {
            let object = JSON.parse(xhr.response)
            console.log(object)
        }
    }

    let body = JSON.stringify = ({
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
            "opportunity_ID": recordId,
            "oneDateTime": [salesReqForm.getElementById(DATE), salesReqForm.getElementById(appt)], 
            "twoDateTime": [salesReqForm.getElementById(DAtE), salesReqForm.getElementById(aPpt)],
            "threeDateTime": [salesReqForm.getElementById(dATE), salesReqForm.getElementById(Appt)],
            "selectedDateTime": null,
            "description": salesReqForm.getElementById(textarea-id),
            "flag": false
        })

    xhr.send(body)
