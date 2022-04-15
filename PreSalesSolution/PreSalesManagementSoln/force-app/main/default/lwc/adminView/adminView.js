import { LightningElement,track,wire } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";

export default class AdminView extends LightningElement {

    @track notificationStatus = false;

    connectedCallback(){
        this.populateTheBoxes();
    }

    @track productListdb = [];
    @track activityTypeListdb = [];

    //fetch products from backend
    async fetchProducts(){
        await fetch('http://localhost:8080/api/products')
            .then(response => response.json())
            .then(data => {
                this.productListdb = data;
            })
    }

    async fetchActivityTypes(){
        await fetch('http://localhost:8080/api/activity/types')
            .then(response => response.json())
            .then(data => {
                this.activityTypeListdb = data.map(d => d.name);
            })
    }

    @track products = [];
    @track productValues = [];
    @track deactiveProducts = [];

    async populateTheBoxes(){

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
    selectProducts(evt){
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
                const productInfo = {"name": evt.target.value};

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

    selectActivityTypes(evt){
        if(evt.keyCode === 13){
            if(!this.activityTypeListdb.includes(evt.target.value)){

                //create a activity type info to push
                const activityType = {"name": evt.target.value};

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
    async handelActivityRemove(evt){
        this.label = evt.target.label
        await fetch('http://localhost:8080/api/activities/')
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

    deleteConfirm(){
        this.removeActivityType();
        this.closeModal();
    }

    removeActivityType(){
        for(let i=0; i < this.activityTypeListdb.length; i++){
            if(this.activityTypeListdb[i] === this.label){

                const deletedActivity = {"name":this.label}

                //delete it from the database
                fetch('http://localhost:8080/api/activity/types/',{
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(deletedActivity),
                })
                .catch((error) => {
                    console.error('Error', error)
                })

                this.activityTypeListdb.splice(i,1);

                break;
            }
        }
    }

    //handle changes to dual-list box
    handleProductChange(evt){

        const productArray = evt.target.value;

        for(let i=0; i < productArray.length; i++){
            const productInfo = {"name": productArray[i], "active":0}
            this.patchProduct(productInfo);
        }

        const activeProduct = this.products.filter(product => !productArray.includes(product.label))

        for(let i=0; i < activeProduct.length; i++){
            const productInfo = {"name": activeProduct[i].label, "active":1}
            this.patchProduct(productInfo);
        }
    }

    pushProduct(productInfo){
        //push the product
        fetch('http://localhost:8080/api/products/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInfo),
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    patchProduct(productInfo){
        //patch product
        fetch('http://localhost:8080/api/products/', {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInfo),
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    pushActivityType(activityType){
        //push activityType
        fetch('http://localhost:8080/api/activity/types/', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityType),
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}