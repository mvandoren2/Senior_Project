import SalesRequestForm from "./salesRequestForm";

export const products = [
    {
        'external_product_ID': 1,
        "name": "Watch"
    },
    {
        'external_product_ID': 2,
        "name": "Laptop"
    },
    {
        'external_product_ID': 3,
        "name": "Phone"
    },  
    {
        'external_product_ID': 4,
        "name": "Tablet"
    },  
    {
        'external_product_ID': 5,
        "name": "TV"
    },
    {
        'external_product_ID': 6,
        "name": "Xbox Series X"
    },
    {
        'external_product_ID': 7,
        "name": "Xbox Series S"
    },
    {
        'external_product_ID': 8,
        "name": "Playstation 5"
    }
]

export class ProductSelector {
    constructor (parentObj) {
        this.parent = parentObj

        if(!(this.parent instanceof SalesRequestForm))
            throw new Error('ProductSelector was invoked by an invalid parent')
    }

    products = products

    

    //search for products in the text bar
    searchEvt = (evt) => {
        const value = evt.target.value;
        if (value === '') {
            this.parent.filteredProducts = [];
            this.parent.searchBarEmpty = true

        } else {
            const lValue = value.toLowerCase();
            this.parent.filteredProducts = this.products.filter(item => item.name.toLowerCase().includes(lValue));
            this.parent.searchBarEmpty = false || !this.parent.filteredProducts.length
        }
    }

    //event button to add to cart
    addProd = (evt) => {
        const prod = evt.target.value;
        if (this.parent.selectedProducts.includes(prod))
            return;
        
        this.parent.selectedProducts.push(prod);
        this.products = this.products.filter(item => item.external_product_ID !== prod.external_product_ID);
        
        this.parent.template.querySelector(".search").value = '';
        this.searchEvt({target:{value: ''}})

        this.parent.setDisableButton()
    }

    //event button to remove from cart
    removeProd = (evt) => {
        const product_ID = parseInt(evt.target.dataset.item, 10);
        const product = this.parent.selectedProducts.filter(item => item.external_product_ID === product_ID)[0]

        this.products.push(product);
        this.parent.selectedProducts = this.parent.selectedProducts.filter(item => item.external_product_ID !== product_ID);

        this.parent.template.querySelector(".search").value = '';
        this.searchEvt({target:{value: ''}})

        this.parent.setDisableButton()
    }
}