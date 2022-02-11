import { LightningElement } from 'lwc';

export default class SalesRequestForm extends LightningElement {
    value = ' ';

    get options() {
        return [
            { label: 'Opportunity #1', value: '1234445' },
            { label: 'Opportunity #2', value: '3455567' },
            { label: 'Opportunity #3', value: '8133456' },
            { label: 'Opportunity #4', value: '8139080' },
            { label: 'Opportunity #5', value: '8567890' },
            { label: 'Opportunity #6', value: '9178889' },
            { label: 'Opportunity #7', value: '9808891' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
    }
}