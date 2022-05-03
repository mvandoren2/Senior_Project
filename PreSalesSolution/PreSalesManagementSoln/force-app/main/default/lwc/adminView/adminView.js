import { LightningElement,track } from 'lwc';
import { url } from 'c/dataUtils';

export default class AdminView extends LightningElement {

    @track notificationStatus = false;
    @track saveStatus = true;

    connectedCallback() {
        this.populateTheBoxes();
    }

    @track productListdb = [];
    @track activityTypeListdb = [];

    //fetch products from backend
    async fetchProducts(){
        await fetch(url + 'products/')
            .then(response => response.json())
            .then(data => {
                console.log('Success: ', data);
                this.productListdb = data;
            })
    }

    async fetchActivityTypes() {
        await fetch(url + '/activity/types/')
            .then(response => response.json())
            .then(data => {
                console.log('Success: ', data);
                this.activityTypeListdb = data.map(d => d.name);
            })
    }

    @track products = [];
    @track productValues = [];
    @track deactiveProducts = [];

    async populateTheBoxes() {

        //products
        await this.fetchProducts();

        const items = [];
        for(let i=0; i < this.productListdb.length; i++){

            items.push({
                label: this.productListdb[i].name,
                value: this.productListdb[i].name
            });

            if(this.productListdb[i].active === false){
                this.deactiveProducts.push(this.productListdb[i].name);
            }
        }

        this.products.push(...items);
        this.productValues.push(...this.deactiveProducts);

        this.fetchActivityTypes();
    }

    //input fields
    selectProducts = (evt) => {
        if(evt.keyCode === 13){

            const labels = this.products.map(product => product.label);
        
            if(!labels.includes(evt.target.value)){
    
                const productList = [];

                productList.push({
                    label: evt.target.value, 
                    value: evt.target.value
                });
            
                this.products.push(...productList);

                //create a product info to push
                const productInfo = {"products": [{"name": evt.target.value}]};

                this.pushProduct(productInfo);
            } else {

                this.notificationStatus = true;

                const animate = () => {
                    this.notificationStatus = false;
                }

                let interval = setInterval(function(){  
                    animate();
                    clearInterval(interval);
                  }, 5000);
            }

            evt.target.value = undefined;

        }
    }

    selectActivityTypes = (evt) => {
        if(evt.keyCode === 13){
            if(!this.activityTypeListdb.includes(evt.target.value)){

                //create a activity type info to push
                const activityType = {"activity_types": [{"name": evt.target.value}]};

                this.pushActivityType(activityType);

                this.activityTypeListdb.push(evt.target.value);
            } else {

                this.notificationStatus = true;

                const animate = () => {
                    this.notificationStatus = false;
                }

                let interval = setInterval(function(){  
                    animate();
                    clearInterval(interval);
                  }, 5000);
            }

            evt.target.value = undefined;
        }
    }

    
    @track isModalOpen = false;
    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    activities = [];
    label;

    handelActivityRemove = async (evt) => {
        this.label = evt.target.label
        await fetch(url + 'activities/')
            .then(response => response.json())
            .then(data => {
                this.activities = data;
            })

        const activityTypeInActivity = this.activities.map(activity => activity.activity_Type.name);
        
        if(activityTypeInActivity.includes(this.label)){
            //show a modal
            this.openModal();
        } else {
            this.removeActivityType();
        }   
    }

    deleteConfirm() {
        this.removeActivityType();
        this.closeModal();
    }

    removeActivityType() {
        for(let i=0; i < this.activityTypeListdb.length; i++){
            if(this.activityTypeListdb[i] === this.label){

                const deletedActivity = {"name":this.label}

                //delete it from the database
                fetch(url + 'activity/types/',{
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(deletedActivity),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success: ', data);
                })
                .catch((error) => {
                    console.error('Error', error)
                })

                this.activityTypeListdb.splice(i,1);

                break;
            }
        }
    }

    disabled = [];

    //handle changes to dual-list box
    handleProductChange = (evt) => {
        this.disabled = evt.detail.value;
        this.saveStatus = false;
    }

    pushProduct(productInfo) {
        //push the product
        fetch(url + 'products/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInfo),
            })
            .then(response => response.json())
                .then(data => {
                    console.log('Success: ', data);
                })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    patchProduct() {
        let productArray = [];

        const disabledProduct = this.productListdb.filter(product => this.disabled.includes(product.name));
        const disabledProductId = disabledProduct.map(product => product.product_ID);
        
        for(let i=0; i < disabledProductId.length; i++){
            productArray.push({"product_ID": disabledProductId[i], "active": 0});
        }

        const activeProduct = this.products.filter(product => !this.disabled.includes(product.label))
        const productLabel = activeProduct.map(product => product.label);
        const activeProductInfo = this.productListdb.filter(product => productLabel.includes(product.name));
        const activeProductId = activeProductInfo.map(product => product.product_ID);

        for(let i=0; i < activeProductId.length; i++){
            productArray.push({"product_ID": activeProductId[i], "active": 1});
        }

        let productInfo = {"products":productArray}

        //patch product
        fetch(url + 'products/', {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInfo),
            })
            .then(response => response.json())
                .then(data => {
                    console.log('Success: ', data);
                })
            .then(data => {
               this.saveStatus = true;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    pushActivityType(activityType) {
        //push activityType
        fetch(url + 'activity/types/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityType),
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