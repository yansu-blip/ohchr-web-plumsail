window.OHCHR = window.OHCHR || {};

OHCHR.Core = OHCHR.Core || {};

OHCHR.Core.ensureArray = function(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === '') return [];
    return [value];
};

OHCHR.Core.escapeHtml = function(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

OHCHR.ensureArray = OHCHR.Core.ensureArray;
OHCHR.escapeHtml = OHCHR.Core.escapeHtml;

// Backward-compatible field helper. New code should load /modules/plumsail-fields.js.
OHCHR.setFieldValue = function(fieldName, value, form) {
    if (OHCHR.PlumsailFields) {
        return OHCHR.PlumsailFields.setValue(form || window.fd, fieldName, value);
    }

    const activeForm = form || window.fd;
    const field = activeForm?.field?.(fieldName);

    if (!field) {
        console.warn(`Field not found: ${fieldName}`);
        return null;
    }

    field.value = value;
    return field;
};
