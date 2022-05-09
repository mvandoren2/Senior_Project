import { LightningElement,track,wire } from 'lwc';
import getPreSalesTeamMembers from "@salesforce/apex/getUsers.getPreSalesTeamMembers";
import { url } from 'c/dataUtils';

//actions on the dropdown
const profLevel = [
    { label: '1', name: '1'},
    { label: '2', name: '2'},
    { label: '3', name: '3'},
    { label: '4', name: '4'},
];

//datatable
const columns = [
    {label: 'Products', fieldName: 'products', editable: false},
    {label: 'Proficiency Level (1-4)', fieldName: 'proficiency', editable: false},
    {
        type: 'action',
        typeAttributes: { rowActions: profLevel },
    },
];

export default class AdminMemberManagement extends LightningElement {

    @track assignedUsersInfoFromDB = []
    @track assignedUsersInfo = []
    @track assignedUsersId = []
    @track salesforceUsers = []
    @track unassignedUsersInfo = []

    @track allMembersInfo = [];
    @track filteredAllMembersInfo = [];

    @track changeStatus = true;

    connectedCallback() {
        this.fetchAllDbMembers();
        this.fetchAllProducts();
    }

    fetchAllDbMembers() {
        fetch(url + 'members/')
            .then(response => response.json())
            .then(data => {
                this.assignedUsersInfoFromDB = data;
            })
    }

     //wire and get the users from the salesforce
     @wire(getPreSalesTeamMembers) teamMembers({error, data}) {
        if(data){
            this.salesforceUsers = data;

            this.assignedUsersId = this.assignedUsersInfoFromDB.map(members => members.external_member_ID)
            
            this.unassignedUsersInfo = this.salesforceUsers.filter(member => !this.assignedUsersId.includes(member.Id));

            for(let i=0; i < this.unassignedUsersInfo.length; i++){
                this.unassignedUsersInfo[i] = Object.assign({assigned: false}, this.unassignedUsersInfo[i]);
            }

            this.assignedUsersInfo = this.salesforceUsers.filter(member => this.assignedUsersId.includes(member.Id));

            for(let i=0; i < this.assignedUsersInfo.length; i++){
                this.assignedUsersInfo[i] = Object.assign({assigned: true}, this.assignedUsersInfo[i]);
            }

            this.allMembersInfo = this.assignedUsersInfo.concat(this.unassignedUsersInfo);

            this.filteredAllMembersInfo = this.allMembersInfo;

            this.error = undefined;
        } else if(error){
            this.error = error;
            console.error(error);
        }
    }

    //filter
    searchUsersSecondTab = (evt) => {
        const value = evt.target.value.toLowerCase();
        this.filteredAllMembersInfo = this.allMembersInfo.filter(item => item.Name.toLowerCase().includes(value));
    }

    ///MODAL
    @track data = [];    //holds the data of the datatable
    @track isModalOpen = false;
    @track membersInfo = []; 
    @track memberId;
    @track memberName;
    @track imgSrc;
    
    openModal = async (evt) => {

        this.memberId = evt.target.dataset.id;

        const assignStatus = evt.target.dataset.status;

        this.imgSrc = evt.target.dataset.photo;
        this.memberName = evt.target.dataset.name;

        if(assignStatus === "true"){
            this.saveStatus = true;

            //auto fill the table from backend
            //get a specific member
            await fetch(url + 'member/' + this.memberId + '/')
                .then(response => response.json())
                .then(data => {
                    this.membersInfo = data;
                    this.memberRole = this.membersInfo.user_role.name;
                    this.changeStatus = false;
                    this.populateTheTable(assignStatus);
                })
                
            if(this.memberRole === 'Presales Member'){
                this.memberRoleIsPreSalesMember = true;
            } else {
                this.memberRoleIsPreSalesMember = false;
            }

        } else {

            this.memberRole = "Sales Representative";
            this.saveStatus = false;
            this.populateTheTable(assignStatus);
        }

        this.isModalOpen = true;
    }

    closeModal() {
        this.dataValue = [];
        this.data = this.dataValue;
        this.preSelectedRows = [];
        this.memberRoleIsPreSalesMember = false;
        this.isModalOpen = false;
    }

    //get it from database
    @track productsDB = [];
    @track dataValue = [];

    async fetchAllProducts() {
       await fetch(url + 'products/')
            .then(response => response.json())
            .then(data => {
                this.productsDB = data;
            })
    }

    //function to populate the data 
    @track preSelectedRows = [];
    populateTheTable(assignStatus){
        if(assignStatus === "true") {
           
            //get the product names of the member
            const memberProducts = this.membersInfo.proficiency.map(products => products.product.name);

            const commonProducts = this.productsDB.filter(productdb => memberProducts.includes(productdb.name))

            for(let i=0; i < commonProducts.length; i++){
                if(commonProducts[i].active === true){
                    for(let j=0; j < this.membersInfo.proficiency.length; j++){
                        if(commonProducts[i].name === this.membersInfo.proficiency[j].product.name){
                            this.dataValue.push({products: commonProducts[i].name, proficiency: this.membersInfo.proficiency[j].level, product_ID: commonProducts[i].product_ID});
                            this.preSelectedRows.push(commonProducts[i].product_ID);
                        }
                    }
                }
            }

            const unCommonProducts = this.productsDB.filter(productdb => !memberProducts.includes(productdb.name))

            for(let i=0; i < unCommonProducts.length; i++){
                if(unCommonProducts[i].active === true){
                    this.dataValue.push({products: unCommonProducts[i].name, proficiency: '', product_ID: unCommonProducts[i].product_ID});
                }
            }

        } else {

            //just put all the products and empty proficiency
            for(let i =0; i < this.productsDB.length; i++){
                if(this.productsDB[i].active === true){
                    this.dataValue.push({products: this.productsDB[i].name, proficiency: '', product_ID: this.productsDB[i].product_ID});
                }
                    
            }
        }

        this.data = this.dataValue;
       
    }

    //combobox for the roles
    @track memberRole = '';
    @track memberRoleIsPreSalesMember = false;
    get ComboboxOptions() {
        return [
            { label: 'Admin', value: 'Admin' },
            { label: 'Presales Manager', value: 'Presales Manager' },
            { label: 'Presales Member', value: 'Presales Member' },
            { label: 'UnAssigned', value: 'Sales Representative' },
        ];
    }

    handleChange(event) {
        this.changeStatus = false;
        this.memberRole = event.detail.value;

        if(this.memberRole === 'Presales Member'){
            this.memberRoleIsPreSalesMember = true;
        } else {
            this.memberRoleIsPreSalesMember = false;
        }
    }


    //dataTable
    columns = columns;
    rowOffset = 0;

    @track selectedRow = [];

    rowSelectionAction(evt) {

        this.selectedRow  = evt.detail.selectedRows;

        for(let i=0; i < this.selectedRow.length; i++){
            if(this.selectedRow[i].proficiency === ''){
                this.changeStatus = true;
            }
        }

    }

    @track saveStatus = false

    handleSave(evt) {
    
        const profArray = [];
       
        for(let i=0; i<this.selectedRow.length; i++){
            profArray.push({"product_ID": this.selectedRow[i].product_ID, "level": this.selectedRow[i].proficiency});
        }

        let pushData = {
            "user_role": this.memberRole,
            "proficiency": profArray
        }

        let method = "";
        if(evt.target.title === "Add Member"){
            method = "POST"
        } else {
            method = "PATCH"
        }
        
        //push member and their product/proficiencyLevel
        fetch(url + 'member/' + this.memberId + '/', {
                method: method, 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pushData),
            })
            .then(response => response.json())
            .catch((error) => {
                console.error('Error:', error);
            });

        for(let i=0; i < this.filteredAllMembersInfo.length; i++){
            if(this.filteredAllMembersInfo[i].Id === this.memberId){
                this.filteredAllMembersInfo[i].assigned = true;
                if(this.memberRole === "Admin"){
                    this.adminArray = (this.filteredAllMembersInfo[i])
                }
            }
        }

        this.closeModal();
    }

    //confirmation box
    @track isDialogVisible = false;

    handleClick(event) {
        if(event.target.label === 'Delete Member'){

            this.isDialogVisible = true;

        } else if(event.target.name === 'confirmModal'){

                if(event.detail.status === 'confirm') {
                    this.deleteMember();
                }else if(event.detail.status === 'cancel'){
                    this.isDialogVisible = false
                }
            

            //hides the component
            this.isDialogVisible = false;
        }
    }

    //delete a member
    deleteMember() {

         //push member and their product/proficiencyLevel
         fetch(url + 'member/' + this.memberId + '/', {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });

        for(let i=0; i < this.filteredAllMembersInfo.length; i++){
            if(this.filteredAllMembersInfo[i].Id === this.memberId){
                this.filteredAllMembersInfo[i].assigned = false;
            }
        }

        this.closeModal();
    }


    //action to edit proficiency level
    handleRowAction(evt) {

        const actionNumber = evt.detail.action.name;
        const row = evt.detail.row;

        const { product_ID } = row;

        const index = this.findRowIndexById(product_ID);
    
        if(index !== -1){
            this.data = this.data.slice(0, index).concat(this.data.slice(index + 1));
            this.data.splice(index, 0, {products: row.products, proficiency: actionNumber, product_ID: row.product_ID})

            for(let i=0; i < this.selectedRow.length; i++){
                if(this.selectedRow[i].product_ID === row.product_ID){
                    this.selectedRow[i].proficiency = actionNumber;
                    break;
                }
            }

            for(let i=0; i < this.selectedRow.length; i++){
                if(this.selectedRow[i].proficiency !== ''){
                    this.changeStatus = false;
                }
            }
        }
    }

    findRowIndexById(product_ID) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.product_ID === product_ID) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }


    //radio button
    value = 'option1';

    get options() {
        return [
            { label: 'All', value: 'option1' },
            { label: 'Admin', value: 'option2' },
            { label: 'PreSales Manager', value: 'option3' },
            { label: 'PreSales Members', value: 'option4' },
        ];
    }
}