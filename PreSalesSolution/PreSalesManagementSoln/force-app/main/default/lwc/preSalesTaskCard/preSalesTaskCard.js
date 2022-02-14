import { LightningElement,track } from 'lwc';

export default class PreSalesTaskCard extends LightningElement {

    //requested task card info
    taskInfo = [
        {
            Id: 1,
            taskName: 'Task 1',
            client: 'Meta',
            product: 'Instagram Account Management Software',
            meetingInfo : 'Zoom link: http// zoom.link',
            salesTeam : 'Team A',
            meetingDescription: 'Sales team member notes which are relevant to the pre-sales team members task. Notes may be added by the pre-sales manager when the request is assigned.',
        },
        {
            Id: 2,
            taskName: 'Task 2',
            client: 'Apple',
            product: 'ARoS 1.0',
            meetingInfo : 'Apple Campus, Cupertino',
            salesTeam : 'Team AR',
            meetingDescription: 'Sales team member notes which are relevant to the pre-sales team members task. Notes may be added by the pre-sales manager when the request is assigned.',
        },
        {
            Id: 3,
            taskName: 'Task 3',
            client: 'Microsoft',
            product: 'Windows 12',
            meetingInfo : 'Zoom link: http// zoom.link.com',
            salesTeam : 'Team Windows',
            meetingDescription: 'Sales team member notes which are relevant to the pre-sales team members task. Notes may be added by the pre-sales manager when the request is assigned.',
        },
    ];

    //filter the requested task card
    filteredTaskInfo = this.taskInfo;

    filterTask = (evt) => {
        const value = evt.target.value.toLowerCase();

        this.filteredTaskInfo = this.taskInfo.filter(item => item.client.toLowerCase().includes(value) || item.taskName.toLowerCase().includes(value) || item.salesTeam.toLowerCase().includes(value) || item.product.toLowerCase().includes(value));
    }

    value = ' ';


    //functions to show and hide modal
    @track isShowModal = false;


    showModalBox() {
        this.isShowModal = true;
    }

    hideModalBox() {
        this.isShowModal = false;
    }


    selected = [];
    options = [];

    //team members info
    teamMembers = [
        {
            label: 'Anuj', 
            value: 'Anuj',
            skill: 'HTML',
            
        },
        {
            label: 'Kendall', 
            value: 'Kendall',
            skills: 'CSS',
        },
        {
            label: 'Alex', 
            value: 'Alex',
            skills: 'Python',
        },
        {
            label: 'Tim', 
            value: 'Tim',
            skills: 'Javascript',
        },

        {
            label: 'Daniel', 
            value: 'Daniel',
            skills: 'Java'
        },
        {
            label: 'Htet', 
            value: 'Htet',
            skills: 'C++',
        },
        {
            label: 'Matt', 
            value: 'Matt',
            skills: 'React',
        },
    ];

    allSelected = []
    connectedCallback() {
        this.filter()
    } 

    filter(event) {
        const optToVal = (option) => option.value
        let filter = ''
        if(event) {
            filter = event.target.value
        }
        filter = new RegExp(filter, 'ig');
        this.options = this.teamMembers.filter(option => filter.test(option.value))
        const shownOptions = new Set(this.options.map(optToVal))
        this.selected = this.allSelected.filter(selected => shownOptions.has(selected))
    }

    handleChange(event) {
        const optToVal = (option) => option.value
        const shownOptions = new Set(this.options.map(optToVal))
        const hiddenOptions = new Set(
        this.teamMembers.map(optToVal).filter(value => !shownOptions.has(value)))
        const hiddenSelected = this.allSelected.filter(value => hiddenOptions.has(value))
        const shownSelected = event.target.value
        this.allSelected = [...shownSelected, ...hiddenSelected]
    }
}
