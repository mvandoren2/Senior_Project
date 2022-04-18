import GetNinjaUsers from '@salesforce/apex/GetNinjaUsers.GetNinjaUsers';
import { LightningElement, track } from 'lwc';
import Id from "@salesforce/user/Id"


export default class NotesView extends LightningElement {
    connectedCallback() {
        this.activity_ID = this.getAttribute('data-activity-id')
        this.maxItems = parseInt(this.getAttribute('data-max-items'), 10)

        this.setState(this.getAttribute('data-handlenote'))
        
        this.getNoteDisplayData()
    }

    passNote = false
    postNote = false
    
    setState = (handleNote) => {
        switch(handleNote) {
            case 'pass':
                this.passNote = true
                this.postNote = false
                break

            case 'post':
                this.postNote = true
                this.passNote = false
                break

            default:
                this.postNote = false
                this.passNote = false
                break
        }
    }

    @track notes = []

    getNoteDisplayData = async () => {
        let notes = await this.getNotes()

        const memberIds = notes.map(note => note.member.external_member_ID).concat([Id])

        this.salesforceMembers = await GetNinjaUsers({user_Ids: memberIds})

        notes.forEach(note => this.buildNoteDisplayObj(note))

        this.notes = notes
    }

    buildNoteDisplayObj = (note) => {
        const submittedBy = this.salesforceMembers.find(member => member.Id === note.member.external_member_ID)

        note.member.name = submittedBy.Name

        let date = new Date(note.note_date)

        note.note_date = this.dateStringUtil(date)

        return note
    }


    dateStringUtil = (date) => {        
        const dateDisplayOptions = {
            weekday:'short', 
            month:"numeric", 
            day:'numeric', 
            year:'2-digit', 
            hour:'numeric', 
            minute:'2-digit', 
            hourCycle:'h12'
        }

        const dateString = date.toLocaleString('en-US', dateDisplayOptions)
            
        return dateString
    }

    url = 'http://localhost:8080/api/activity/'

    getNotes = async () => {
        return fetch(this.url + this.activity_ID + '/notes/')
            .then(response => response.json())
    }

    newNoteText = ''

    changeNewNoteText = (evt) => {        
        this.newNoteText = evt.target.value
        
        if(this.passNote)            
            this.dispatchEvent(new CustomEvent('change', {detail: {note: this.newNoteText}}))        
    }

    postNewNote = () => {
        this.userId = Id ? Id : '0055f0000041g1mAAA'
        
        let notePostBody = {
            member: this.userId,
            note_text: this.newNoteText
        }

        fetch(this.url + this.activity_ID + '/notes/', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notePostBody)
        })

        this.showNewNote(notePostBody)

        this.template.querySelector('lightning-textarea').value = ''
    }

    showNewNote = (note) => {
        note.note_date = Date.now()
        note.member = {external_member_ID: this.userId}
        note.note_ID = this.notes.slice(-1).note_ID + 1

        let newNote = this.buildNoteDisplayObj(note)

        this.notes.push(newNote)
    }
}