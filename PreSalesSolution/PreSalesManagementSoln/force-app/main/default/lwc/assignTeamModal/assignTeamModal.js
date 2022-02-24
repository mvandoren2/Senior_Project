import { LightningElement, track, api } from 'lwc';

export default class AssignTeamModal extends LightningElement {
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
    ]

    allSelected = []
    selected = []
    options = [...this.teamMembers]

    activityID

    @api toggleShow = (rowID) => {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'

        this.activityID = rowID
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'

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