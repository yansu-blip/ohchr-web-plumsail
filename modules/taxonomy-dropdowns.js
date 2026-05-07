window.OHCHR = window.OHCHR || {};

OHCHR.dropdownTerms = OHCHR.dropdownTerms || {};
OHCHR.TaxonomyDropdowns = OHCHR.TaxonomyDropdowns || {};

OHCHR.TaxonomyDropdowns.getCachedTerms = function(key) {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
};

OHCHR.TaxonomyDropdowns.cacheTerms = function(key, terms) {
    localStorage.setItem(key, JSON.stringify(terms));
};

OHCHR.TaxonomyDropdowns.getPrefixByDepth = function(depth) {
    const d = Number(depth || 0);
    if (d === 1) return '‣ ';
    if (d >= 2) return '・‣ ';
    return '';
};

OHCHR.TaxonomyDropdowns.getFlowUrl = function() {
    const flowUrl = window.OHCHR_CONFIG?.FLOW_URL;

    if (!flowUrl) {
        throw new Error('FLOW_URL is not defined. Set window.OHCHR_CONFIG.FLOW_URL to the full Power Automate URL.');
    }

    if (/[<>]/.test(flowUrl) || !/^https?:\/\//i.test(flowUrl)) {
        throw new Error('FLOW_URL must be replaced with the full Power Automate URL before taxonomy dropdowns can load.');
    }

    return flowUrl;
};

OHCHR.TaxonomyDropdowns.getTermList = async function(vocabularyId, config = {}) {
    const flowUrl = OHCHR.TaxonomyDropdowns.getFlowUrl();
    const lang = config?.lang || 'en';
    const cacheKey = `terms-${vocabularyId}-${lang}`;
    const cached = OHCHR.TaxonomyDropdowns.getCachedTerms(cacheKey);

    if (Array.isArray(cached) && cached.length) {
        return cached;
    }

    const response = await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            term_vocabulary: vocabularyId,
            langcode: lang
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch terms for ${vocabularyId}: ${response.status}`);
    }

    const json = await response.json();
    const data = Array.isArray(json.data) ? json.data : [];

    const termList = data
        .map(term => {
            if (typeof term === 'string') return term;

            const name = (term.term_name || '').trim();
            const depth = term.depth ?? term.level ?? 0;
            const prefix = OHCHR.TaxonomyDropdowns.getPrefixByDepth(depth);

            return name ? prefix + name : '';
        })
        .filter(Boolean);

    if (termList.length) {
        OHCHR.TaxonomyDropdowns.cacheTerms(cacheKey, termList);
    }

    return termList;
};

OHCHR.TaxonomyDropdowns.populateDropdown = async function(field, termList) {
    if (!field) {
        console.warn('Taxonomy dropdown field not found.');
        return;
    }

    if (typeof field.ready === 'function') {
        await field.ready();
    }

    if (!field.widget) {
        console.warn(`Taxonomy dropdown widget not available for ${field.internalName || field.name || 'field'}.`);
        return;
    }

    const items = (termList || []).map(x => ({
        text: x,
        value: x
    }));

    console.log(`Populating ${field.internalName || field.name} with`, items);

    field.widget.setOptions({
        dataTextField: 'text',
        dataValueField: 'value',
        filter: 'contains'
    });

    field.widget.setDataSource(new kendo.data.DataSource({
        data: items
    }));

    field.widget.refresh();
};

OHCHR.TaxonomyDropdowns.initialize = async function(form, config = {}) {
    if (OHCHR._dropdownsInitialized) return;

    const activeForm = form || window.fd;

    if (!activeForm || typeof activeForm.field !== 'function') {
        throw new Error('Plumsail form object is not available for taxonomy dropdowns.');
    }

    OHCHR._dropdownsInitialized = true;

    const fields = config?.fields || {};

    for (const [vocabularyId, fieldName] of Object.entries(fields)) {
        if (!fieldName) continue;

        try {
            OHCHR.dropdownTerms[vocabularyId] = await OHCHR.TaxonomyDropdowns.getTermList(vocabularyId, config);

            await OHCHR.TaxonomyDropdowns.populateDropdown(
                activeForm.field(fieldName),
                OHCHR.dropdownTerms[vocabularyId]
            );
        } catch (err) {
            console.error(`Failed for ${vocabularyId}:`, err);
        }
    }
};

OHCHR.initializeDropdowns = function(config = {}, form) {
    return OHCHR.TaxonomyDropdowns.initialize(form || window.fd, config);
};

OHCHR.normalizeLabel = function(value) {
    return String(value || '')
        .replace(/^[・‣\s]+/, '')
        .trim();
};

OHCHR.matchPrefixedValues = function(values, availableItems) {
    const ensureArray = OHCHR.ensureArray || function(value) {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === '') return [];
        return [value];
    };

    const map = new Map(
        ensureArray(availableItems).map(item => [
            OHCHR.normalizeLabel(item),
            item
        ])
    );

    return ensureArray(values)
        .map(v => map.get(OHCHR.normalizeLabel(v)) || v)
        .filter(Boolean);
};
