
import SalesRequestForm from "./salesRequestForm";
import { url } from "c/dataUtils";

export class ProductSelector {
    constructor (parentObj) {
        this.parent = parentObj

        this.getProducts()

        if(!(this.parent instanceof SalesRequestForm))
            throw new Error('ProductSelector was invoked by an invalid parent')
    }
 
    getProducts() {
        fetch(url + 'products/')
            .then(res => res.json())
            .then((data) => {
                this.products = data

                this.parent.productOptions = data.map(item => ({
                    label: item.name, 
                    value: item.product_ID.toString()
                }))

                this.renderOptionChange()
            })
            
    }
    //event button to add to cart
    addProd = (evt) => {
        const prod = this.parent.productOptions.find(product => product.value === evt.target.value);

        this.parent.selectedProducts.push(prod);
        this.parent.productOptions = this.parent.productOptions.filter(item => item !== prod);
        this.parent.template.querySelector("lightning-combobox").value ='';

        this.renderOptionChange()

        this.setActivityProducts()

        this.parent.setDisableButton()
    } 

    //event button to remove from cart
    removeProd = (evt) => {
        const product = this.parent.selectedProducts.find(item => item.value === evt.target.dataset.item)

        this.parent.productOptions.push(product);

        this.parent.selectedProducts = this.parent.selectedProducts.filter(item => item !== product);

        this.renderOptionChange()

        this.setActivityProducts()

        this.parent.setDisableButton()
    }

    renderOptionChange = () => {
        this.parent.productOptions.sort((a, b) => a.label - b.label)
        this.parent.productOptions = [...this.parent.productOptions]
    }

    setActivityProducts() {
        this.parent.activity.products = this.parent.selectedProducts.map(product => parseInt(product.value, 10))
    }

    reset() {
        this.parent.productOptions = this.parent.productOptions.concat(this.parent.selectedProducts)
        this.renderOptionChange()

        this.parent.selectedProducts = []
    }
}