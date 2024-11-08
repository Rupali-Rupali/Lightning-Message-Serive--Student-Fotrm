import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import { createRecord } from 'lightning/uiRecordApi';
import CUSTOM_CHANNEL from '@salesforce/messageChannel/rstudentChannel__c';
import CUSTOM_STUDENT_OBJECT from '@salesforce/schema/Student__c';
import NAME_FIELD from '@salesforce/schema/Student__c.Name__c';
import DOB_FIELD from '@salesforce/schema/Student__c.Date_of_Birth__c';
import SEX_FIELD from '@salesforce/schema/Student__c.Sex__c';
import LANGUAGES_FIELD from '@salesforce/schema/Student__c.Languages__c';
import COUNTRY_FIELD from '@salesforce/schema/Student__c.Country__c';
import HOBBIES_FIELD from '@salesforce/schema/Student__c.Hobbies__c';

export default class CreateStudent extends LightningElement {
    @wire(MessageContext) messageContext;

    studentName = '';
    studentDOB = '';
    studentSex = '';
    studentLanguages = '';
    studentCountry = '';
    studentHobbies = '';

    handleNameChange(event) {
        this.studentName = event.target.value;
    }

    handleDOBChange(event) {
        this.studentDOB = event.target.value;
    }

    handleSexChange(event) {
        this.studentSex = event.target.value;
    }

    handleLanguagesChange(event) {
        this.studentLanguages = event.target.value;
    }

    handleCountryChange(event) {
        this.studentCountry = event.target.value;
    }

    handleHobbiesChange(event) {
        this.studentHobbies = event.target.value;
    }

    handleCreateStudent() {
        // Validation for Hobbies (Already in place)
        if (!this.studentHobbies) {
            this.showToast('Error', 'Please select at least one hobby.', 'error');
            return;
        }
    
        // Validation for Name
        if (!this.studentName) {
            this.showToast('Error', 'Name is required.', 'error');
            return;
        }
    
        // Validation for Date of Birth (DOB)
        if (!this.studentDOB) {
            this.showToast('Error', 'Date of Birth is required.', 'error');
            return;
        
        }

        const fields = {
            [NAME_FIELD.fieldApiName]: this.studentName,
            [DOB_FIELD.fieldApiName]: this.studentDOB,
            [SEX_FIELD.fieldApiName]: this.studentSex,
            [LANGUAGES_FIELD.fieldApiName]: this.studentLanguages,
            [COUNTRY_FIELD.fieldApiName]: this.studentCountry,
            [HOBBIES_FIELD.fieldApiName]: this.studentHobbies
        };

        createRecord({ apiName: CUSTOM_STUDENT_OBJECT.objectApiName, fields })
            .then((student) => {
                this.showToast('Success', 'Student created successfully!', 'success');
                const payload = {
                    Id: student.id,
                    Name__c: this.studentName,
                    DOB__c: this.studentDOB,
                    Sex__c: this.studentSex,
                    Languages__c: this.studentLanguages,
                    Country__c: this.studentCountry,
                    Hobbies__c: this.studentHobbies
                };
                publish(this.messageContext, CUSTOM_CHANNEL, payload);

                // Reset the input fields
                this.template.querySelectorAll('lightning-input-field').forEach(field => field.reset());
                this.studentName = '';
                this.studentDOB = '';
                this.studentSex = '';
                this.studentLanguages = '';
                this.studentCountry = '';
                this.studentHobbies = '';
            })
            .catch((error) => {
                console.error('Error creating student:', error);
                this.showToast('Error', `Error creating student: ${error.body.message}`, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
