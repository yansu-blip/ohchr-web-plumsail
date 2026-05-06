OHCHR.dropdownTerms = OHCHR.dropdownTerms || {};

OHCHR.initializeDropdowns = async function(config = {}) {
    if (OHCHR._dropdownsInitialized) return;
    OHCHR._dropdownsInitialized = true;
    // Populate configured taxonomy dropdowns when the form opens
    const getCachedTerms = (key) => {
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    };

    const cacheTerms = (key, terms) => {
        localStorage.setItem(key, JSON.stringify(terms));
    };

    const getPrefixByDepth = (depth) => {
        const d = Number(depth || 0);
        if (d === 1) return '‣ ';
        if (d >= 2) return '・‣ ';
        return '';
    };

    const getTermList = async (vocabularyId) => {
        const flowUrl = window.OHCHR_CONFIG?.FLOW_URL;
        if (!flowUrl) {
            throw new Error("FLOW_URL is not defined");
        }
        const lang = config?.lang || 'en';
        const cacheKey = `terms-${vocabularyId}-${lang}`;

        const cached = getCachedTerms(cacheKey);
        if (Array.isArray(cached) && cached.length) {
            return cached;
        }

        const response = await fetch(flowUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                term_vocabulary: vocabularyId,
                langcode: 'en'
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
                const prefix = getPrefixByDepth(depth);

                return name ? prefix + name : '';
            })
            .filter(Boolean);

        if (termList.length) {
            cacheTerms(cacheKey, termList);
        }

        return termList;
    };

    const populateDropdown = async (termList, field) => {
        await field.ready();

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
    
    const fields = config?.fields || {};
    
    for (const [vocabularyId, fieldName] of Object.entries(fields)) {
        if (!fieldName) continue;

        try {
            OHCHR.dropdownTerms[vocabularyId] = await getTermList(vocabularyId);
            
            await populateDropdown(
                OHCHR.dropdownTerms[vocabularyId],
                fd.field(fieldName)
            );
        } catch (err) {
            console.error(`Failed for ${vocabularyId}:`, err);
        }
    }
};

OHCHR.normalizeLabel = function(value) {
    return String(value || '')
        .replace(/^[・‣\s]+/, '')
        .trim();
};

OHCHR.matchPrefixedValues = function(values, availableItems) {
    const map = new Map(
        OHCHR.ensureArray(availableItems).map(item => [
            OHCHR.normalizeLabel(item),
            item
        ])
    );

    return OHCHR.ensureArray(values)
        .map(v => map.get(OHCHR.normalizeLabel(v)) || v)
        .filter(Boolean);
};

OHCHR.setMultiValue = function(fieldName, values) {
    const field = fd.field(fieldName);
    if (!field) {
        console.warn(`Field not found: ${fieldName}`);
        return;
    }
    const arr = OHCHR.ensureArray(values).filter(Boolean);

    if (!field) {
        console.warn(`Field not found: ${fieldName}`);
        return;
    }

    console.log(`Setting ${fieldName}:`, arr);

    field.value = arr;

    if (field.widget) {
        field.widget.value(arr);
        field.widget.trigger('change');
    }
};
