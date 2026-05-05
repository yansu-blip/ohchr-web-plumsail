window.OHCHR = window.OHCHR || {};

OHCHR.ensureArray = function(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === '') return [];
    return [value];
};

OHCHR.escapeHtml = function(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

OHCHR.setFieldValue = function(fieldName, value) {
    if (!fd.field(fieldName)) {
        console.warn(`Field not found: ${fieldName}`);
        return;
    }
    fd.field(fieldName).value = value;
};
