window.OHCHR = window.OHCHR || {};

(function() {
    function moduleUrl(path) {
        const current = document.currentScript?.src;

        if (current) {
            return new URL(path, current).href;
        }

        return `https://cdn.jsdelivr.net/gh/yansu-blip/ohchr-web-plumsail@main/${path.replace(/^\.\.\//, '')}`;
    }

    function loadTaxonomyModule() {
        if (OHCHR.TaxonomyDropdowns) {
            return Promise.resolve(OHCHR.TaxonomyDropdowns);
        }

        if (OHCHR._taxonomyDropdownsReady) {
            return OHCHR._taxonomyDropdownsReady;
        }

        OHCHR._taxonomyDropdownsReady = new Promise(function(resolve, reject) {
            const script = document.createElement('script');
            script.src = moduleUrl('../modules/taxonomy-dropdowns.js');
            script.onload = function() {
                if (OHCHR.TaxonomyDropdowns) {
                    resolve(OHCHR.TaxonomyDropdowns);
                } else {
                    reject(new Error('Taxonomy dropdown module loaded without exposing OHCHR.TaxonomyDropdowns.'));
                }
            };
            script.onerror = function() {
                reject(new Error('Failed to load taxonomy dropdown module.'));
            };
            document.head.appendChild(script);
        });

        return OHCHR._taxonomyDropdownsReady;
    }

    OHCHR.dropdownTerms = OHCHR.dropdownTerms || {};

    OHCHR.initializeDropdowns = function(config = {}, form) {
        return loadTaxonomyModule()
            .then(function(taxonomy) {
                return taxonomy.initialize(form || window.fd, config);
            })
            .catch(function(err) {
                console.error('Failed to initialize taxonomy dropdowns:', err);
                throw err;
            });
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

    OHCHR.setMultiValue = function(fieldName, values, form) {
        const activeForm = form || window.fd;
        const field = activeForm?.field?.(fieldName);

        if (!field) {
            console.warn(`Field not found: ${fieldName}`);
            return null;
        }

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
})();
