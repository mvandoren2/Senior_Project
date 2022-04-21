
import SalesRequestForm from "./salesRequestForm";


export class ProductSelector {
    constructor (parentObj) {
        this.parent = parentObj

        this.getProducts()

        if(!(this.parent instanceof SalesRequestForm))
            throw new Error('ProductSelector was invoked by an invalid parent')
    }

    products = []
 
    getProducts = () => {
        fetch(this.parent.url + 'products/')
            .then(res => res.json())
            .then((data) => {
                this.products = data.map(item => ({
                    label: item.name, 
                    value: item.product_ID.toString()
                }))
            })
            
    }
    //event button to add to cart
    addProd = (evt) => {
        const prod = this.products.find(product => product.value === evt.target.value);

        this.parent.selectedProducts.push(prod);
        this.products = this.products.filter(item => item !== prod);
        this.parent.template.querySelector("lightning-combobox").value ='';

        this.parent.setDisableButton()
    } 

    //event button to remove from cart
    removeProd = (evt) => {
        const product = this.parent.selectedProducts.find(item => item.value === evt.target.dataset.item)

        this.products.push(product);
        this.parent.selectedProducts = this.parent.selectedProducts.filter(item => item !== product);

        this.parent.setDisableButton()
    }
}