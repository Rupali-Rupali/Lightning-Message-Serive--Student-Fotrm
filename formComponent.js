import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FormComponent extends LightningElement {
    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Student Created",
            message: "Record ID: " + event.detail.id,
            variant: "success",
        });
        this.dispatchEvent(evt);
    }

    handleError(event) {
        const evt = new ShowToastEvent({
            title: "Error Creating Student",
            message: event.detail.message,
            variant: "error",
        });
        this.dispatchEvent(evt);
    }

    handleSubmit(event) {
        // Perform custom validation for required fields
        const allValid = [...this.template.querySelectorAll('lightning-input-field')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        // Additional custom validation
        const additionalValid = this.additionalValidation();
        
        if (!allValid || !additionalValid) {
            event.preventDefault(); // Stop form submission
            this.showToast('Error', 'Please fill in all required fields and ensure all inputs are valid', 'error');
        }
    }

    additionalValidation() {
        // Example of additional validation logic: Ensuring all text fields are not empty
        const textFields = this.template.querySelectorAll('lightning-input-field');
        let valid = true;
        textFields.forEach(field => {
            if (field.fieldName !== 'Name__c' && field.fieldName !== 'Date_of_Birth__c' && field.fieldName !== 'Hobbies__c') {
                if (!field.value || field.value.trim() === '') {
                    field.setCustomValidity('This field cannot be empty');
                    field.reportValidity();
                    valid = false;
                } else {
                    field.setCustomValidity(''); // Clear any previous error message
                    field.reportValidity();
                }
            }
        });
        return valid;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }
}
