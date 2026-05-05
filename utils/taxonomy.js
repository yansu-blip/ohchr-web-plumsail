OHCHR.dropdownTerms = {
    entity: [],
    subject: [],
    geolocation: []
};

OHCHR.initializeDropdowns = async function() {
    // Move your current initializeDropdowns() code here
};

OHCHR.normalizeLabel = function(value) {
    return String(value || '')
        .replace(/^[・‣\s]+/, '')
        .trim();
};
