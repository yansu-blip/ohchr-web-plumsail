window.OHCHR = window.OHCHR || {};

OHCHR.PlumsailFields = OHCHR.PlumsailFields || {};

OHCHR.PlumsailFields.getForm = function(form) {
    return form || window.fd || null;
};

OHCHR.PlumsailFields.getField = function(form, fieldName) {
    const activeForm = OHCHR.PlumsailFields.getForm(form);

    if (!activeForm || typeof activeForm.field !== 'function') {
        console.warn('Plumsail form object is not available.');
        return null;
    }

    const field = activeForm.field(fieldName);

    if (!field) {
        console.warn(`Field not found: ${fieldName}`);
        return null;
    }

    return field;
};

OHCHR.PlumsailFields.setValue = function(form, fieldName, value) {
    const field = OHCHR.PlumsailFields.getField(form, fieldName);
    if (!field) return null;

    field.value = value;
    return field;
};

OHCHR.PlumsailFields.setMultiValue = function(form, fieldName, values) {
    const field = OHCHR.PlumsailFields.getField(form, fieldName);
    if (!field) return null;

    const ensureArray = OHCHR.ensureArray || function(value) {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === '') return [];
        return [value];
    };

    const arr = ensureArray(values).filter(Boolean);

    console.log(`Setting ${fieldName}:`, arr);

    field.value = arr;

    if (field.widget) {
        field.widget.value(arr);
        field.widget.trigger('change');
    }

    return field;
};

OHCHR.setFieldValue = function(fieldName, value, form) {
    return OHCHR.PlumsailFields.setValue(form, fieldName, value);
};

OHCHR.setMultiValue = function(fieldName, values, form) {
    return OHCHR.PlumsailFields.setMultiValue(form, fieldName, values);
};
