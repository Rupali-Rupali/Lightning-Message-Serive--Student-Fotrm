import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import CUSTOM_CHANNEL from '@salesforce/messageChannel/rstudentChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';

// Columns for the datatable
const COLUMNS = [
    { label: 'Custom Student Id', fieldName: 'Id', type: 'text' },
    { label: 'Name', fieldName: 'Name__c', type: 'text' },
    { label: 'DOB', fieldName: 'DOB__c', type: 'date' },
    { label: 'Sex', fieldName: 'Sex__c', type: 'text' },
    { label: 'Languages', fieldName: 'Languages__c', type: 'text' },
    { label: 'Country', fieldName: 'Country__c', type: 'text' },
    { label: 'Hobbies', fieldName: 'Hobbies__c', type: 'text' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' }
            ]
        }
    }
];

export default class StudentDataTable extends LightningElement {
    @track records = [];
    @track columns = COLUMNS;
    @track draftValues = [];
    @track selectedRecord = null;
    subscription = null;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                CUSTOM_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        const newRecord = {
            Id: message.Id,
            Name__c: message.Name__c,
            DOB__c: message.DOB__c,
            Sex__c: message.Sex__c,
            Languages__c: message.Languages__c,
            Country__c: message.Country__c,
            Hobbies__c: message.Hobbies__c
        };
        this.records = [newRecord, ...this.records];
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.editRecord(row);
                break;
            case 'delete':
                this.deleteRecord(row);
                break;
            default:
        }
    }

    // Edit functionality
    editRecord(row) {
        this.selectedRecord = { ...row }; // Clone the record to prevent direct mutation
        this.showToast('Info', 'Editing record, make changes in the form below.', 'info');
    }

    // Delete functionality
    deleteRecord(row) {
        deleteRecord(row.Id)
            .then(() => {
                this.records = this.records.filter(record => record.Id !== row.Id);
                this.showToast('Success', 'Record deleted successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', `Error deleting record: ${error.body.message}`, 'error');
            });
    }

    // Save the edited record
    handleSave() {
        const fields = {};
        fields.Id = this.selectedRecord.Id;
        fields.Name__c = this.selectedRecord.Name__c;
        fields.DOB__c = this.selectedRecord.Date_of_Birth__c;
        fields.Sex__c = this.selectedRecord.Sex__c;
        fields.Languages__c = this.selectedRecord.Languages__c;
        fields.Country__c = this.selectedRecord.Country__c;
        fields.Hobbies__c = this.selectedRecord.Hobbies__c;

        updateRecord({ fields })
            .then(() => {
                this.showToast('Success', 'Record updated successfully', 'success');
                // Update the record in the local list
                const index = this.records.findIndex(record => record.Id === this.selectedRecord.Id);
                if (index !== -1) {
                    this.records[index] = { ...this.selectedRecord }; // Update record in the list
                }
                this.selectedRecord = null; // Close the form after save
            })
            .catch(error => {
                this.showToast('Error', `Error updating record: ${error.body.message}`, 'error');
            });
    }

    // Show Toast message
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
