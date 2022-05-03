import { LightningElement, track, api } from 'lwc';
import GetNinjaUsers from '@salesforce/apex/GetNinjaUsers.GetNinjaUsers';
import { url } from 'c/dataUtils';

export default class AssignTeamModal extends LightningElement {
    
    isShowing = false

    @api async showModal(activity) {
        this.patchActivity = this.getAttribute('data-patchactivity') === 'true' ?
            true : false
        
        if(this.activity !== activity){
            this.activity = activity; 
            this.suggestedMembers = await this.fetchSuggestedMembers()
        }       

        this.setSelectedMembers();

        this.isShowing = true

        this.toggleModalClasses()
    }

    closeModal(evt) {
        this.toggleModalClasses()
        
        this.isShowing = false

        this.dispatchEvent(evt)
    }

    @track boxClasses = 'slds-modal'
    @track backdropClasses = 'slds-backdrop'
    
    toggleModalClasses() {
        this.boxClasses = this.boxClasses.includes('slds-fade-in-open') ? 'slds-modal' : 'slds-modal slds-fade-in-open'
        this.backdropClasses = this.backdropClasses.includes('slds-backdrop_open') ? 'slds-backdrop' : 'slds-backdrop slds-backdrop_open'
    }

    suggestedNinjaMembers = [];
    @track selectedNinjaMembers = [];
    unselectedNinjaMembers = [];
    @track unselectedNinjaMembers_filtered = [];
    @track leadMemberId;

    //fetch all members and selected members from djangodb
    membersFetched = false;

    async fetchSuggestedMembers() {
        let suggestedNinjaMembers = await fetch(url + 'activity/' + this.activity.activity_ID + '/suggested_members/')
            .then(response => response.json())
            .catch(err => {console.error('Error: ', err)})
    
        const suggestedUserIds = suggestedNinjaMembers.map(user => user.external_member_ID)

        let salesforceNinjaMembers = await GetNinjaUsers({user_Ids: suggestedUserIds})
            .catch(err => {console.error('Error: ', err)})

        suggestedNinjaMembers.forEach(suggestedMember => {
            let salesforceMemberData = salesforceNinjaMembers.find(member => suggestedMember.external_member_ID === member.Id)

            suggestedMember.salesforceData = salesforceMemberData
            suggestedMember.leadState = false
        })

        this.membersFetched = true;

        return suggestedNinjaMembers
    }

    setSelectedMembers() {
        let selectedUserIds = this.activity.team.map(member => member.Id)

        this.selectedNinjaMembers = this.suggestedMembers.filter(member => selectedUserIds.includes(member.external_member_ID))

        this.unselectedNinjaMembers = this.suggestedMembers.filter(member => !selectedUserIds.includes(member.external_member_ID));

        const products = this.activity.products.map(product => product.name);
       
        for(let i=0; i < this.unselectedNinjaMembers.length; i++){
            for(let j=0; j < this.unselectedNinjaMembers[i].proficiency.length; j++){
                if(products.includes(this.unselectedNinjaMembers[i].proficiency[j].product.name)){
                    this.unselectedNinjaMembers[i].proficiency[j].color = false
                } else{
                    this.unselectedNinjaMembers[i].proficiency[j].color = true
                }
            }
        }
        
        if(this.activity.leadMember) {

            this.leadMemberId = this.activity.leadMember.Id

            let index = this.selectedNinjaMembers.indexOf(this.selectedNinjaMembers.find(user => user.external_member_ID === this.leadMemberId))

            const memberWithLead = this.selectedNinjaMembers.find(user => user.external_member_ID === this.leadMemberId);
            memberWithLead.leadState = true;
            this.selectedNinjaMembers.splice(index,1);
            this.selectedNinjaMembers.unshift(memberWithLead);

            this.saveBtnIsDisabled = false
        }

        this.unselectedNinjaMembers_filtered = [...this.unselectedNinjaMembers];
    }

    memberFilterBarHandler = (evt) => {
            const value = evt.target.value.toLowerCase();
            this.unselectedNinjaMembers_filtered = this.unselectedNinjaMembers
                .filter(member => member.salesforceData.Name.toLowerCase().includes(value));
    }

    suggestedMemberFilter = ''

    filterSuggestedMembers(filterString) {
        if(filterString)
            this.suggestedMemberFilter = filterString

        this.unselectedNinjaMembers_filtered = this.unselectedNinjaMembers
                .filter(member => member.salesforceData.Name.toLowerCase().includes(this.suggestedMemberFilter));
    }

    //
    //all the sort functions for the button-group
    //

    sortedBy = 'All'

    sortByCombinedWeights = (evt) => {
        this.unselectedNinjaMembers_filtered.sort((a, b) => b['Total Percentage'] - a['Total Percentage']);

        if(evt)
            this.setSelectedButton(evt);

        this.sortedBy = 'All'
    }

    sortByProficiency = (evt) => {
        this.unselectedNinjaMembers_filtered.sort((a, b) => b.productWeight - a.productWeight);
        
        if(evt)
            this.setSelectedButton(evt);

        this.sortedBy = 'Proficiency'
    }

    sortByOpportunityWeight = (evt) => {
        this.unselectedNinjaMembers_filtered.sort((a, b) => b.opportunityWeight - a.opportunityWeight);
        
        if(evt)
            this.setSelectedButton(evt);

        this.sortedBy = 'Opportunity'
    }

    sortByAccountWeight = (evt) => {
        this.unselectedNinjaMembers_filtered.sort((a, b) => b.accountWeight - a.accountWeight);

        if(evt)
            this.setSelectedButton(evt);

        this.sortedBy = 'Account'
    }

    //function to change the status of group button
    setSelectedButton = (evt) => {
        const buttonGroup = this.template.querySelectorAll(".sortBtn");

        buttonGroup.forEach(btn => {
            btn.variant = "neutral";
        });
       
        evt.target.variant = "brand";
    }

    reSortSuggestedMembers() {
        switch (this.sortedBy) {
            case 'All' : 
                this.sortByCombinedWeights()
                break

            case 'Proficiency' :
                this.sortByProficiency()
                break

            case 'Opportunity' :
                this.sortByOpportunityWeight()
                break

            case 'Account' :
                this.sortByAccountWeight()
                break

            default: break
        }
    }

    //onclick change the button label and save the data to selected array
    assignMemberToTeam = (evt) => {
        const memberToAddId = evt.target.dataset.item

        const memberToAdd = this.suggestedMembers.find(member => member.external_member_ID === memberToAddId)

        if(this.selectedNinjaMembers.length === 0){
            memberToAdd.leadState = true
            this.leadMemberId = memberToAddId;
        }

        this.selectedNinjaMembers.push(memberToAdd)

        this.unselectedNinjaMembers = this.unselectedNinjaMembers.filter(member => member.external_member_ID !== memberToAddId)

        this.filterSuggestedMembers()

        this.saveBtnIsDisabled = false

    }

    removeMemberFromTeam = (evt) => {
        const memberToRemoveId = evt.target.dataset.item

        for(let i=0; i < this.selectedNinjaMembers.length; i++){
            if(memberToRemoveId === this.selectedNinjaMembers[i].external_member_ID){
                if(this.selectedNinjaMembers[i].leadState === true){
                    this.leadMemberId = undefined;
                    this.selectedNinjaMembers[i].leadState = false;
                }
            }
        }

        const memberToRemove = this.suggestedMembers.find(member => member.external_member_ID === memberToRemoveId)

        this.unselectedNinjaMembers.push(memberToRemove)

        this.selectedNinjaMembers = this.selectedNinjaMembers.filter(member => member.external_member_ID !== memberToRemoveId)

        this.filterSuggestedMembers()
        this.reSortSuggestedMembers()

        if(!this.selectedNinjaMembers.length)
            this.saveBtnIsDisabled = true

        
        if(this.selectedNinjaMembers.length === 1){
            this.selectedNinjaMembers[0].leadState = true
            this.leadMemberId = this.selectedNinjaMembers[0].external_member_ID;
        } else if(this.selectedNinjaMembers.length > 1){
            const newLead = this.selectedNinjaMembers[0];
            newLead.leadState = true;
            this.selectedNinjaMembers.splice(0,1);
            this.leadMemberId = this.selectedNinjaMembers[0].external_member_ID;
            this.selectedNinjaMembers.unshift(newLead);
        }
    }


    @track saveBtnIsDisabled = true;
    
    selectLead = (evt) => {

        this.leadMemberId = evt.target.dataset.item;

        const oldLead = this.selectedNinjaMembers[0];
        oldLead.leadState = false;
        this.selectedNinjaMembers.splice(0,1);
        this.selectedNinjaMembers.unshift(oldLead);

        const leadMember = this.selectedNinjaMembers.find(member => member.external_member_ID === this.leadMemberId)

        for(let i=0; i < this.selectedNinjaMembers.length; i++){
            if(this.selectedNinjaMembers[i].external_member_ID === evt.target.dataset.item){
                this.selectedNinjaMembers.splice(i,1);
            }
        }

        leadMember.leadState = true

        this.selectedNinjaMembers.unshift(leadMember);

        this.saveBtnIsDisabled = false
    }

    patchActivity = false

    //save button action
    selectTeam() {      
        if(this.patchActivity)
            this.patchActivityTeam();

        const team = {
            team: this.selectedNinjaMembers.map(member => member.salesforceData),
            leadMember: this.leadMemberId
        }

        let teamSelectedEvent = new CustomEvent('teamassigned', {
            detail: team
        })

        this.closeModal(teamSelectedEvent);
    }
    
    //push the data to backend
    patchActivityTeam() {
        let activity_ID = this.activity.activity_ID;

        let patchBody = {
            'members': this.selectedNinjaMembers.map(member => member.external_member_ID),
            'leadMember': this.leadMemberId
        }    

        fetch(url + 'activity/' + activity_ID + '/', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patchBody),
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    cancelSelectTeam = () => {
        this.closeModal(new CustomEvent('cancel'))
    }
}
