window.OHCHR = window.OHCHR || {};

OHCHR.UN_LANGUAGES = ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese'];

OHCHR.LANG_CODE_MAP = {
    English: 'en',
    French: 'fr',
    Spanish: 'es',
    Arabic: 'ar',
    Russian: 'ru',
    Chinese: 'zh'
};

OHCHR.LANG_LOCALE_MAP = {
    English: 'en-GB',
    French: 'fr-CH',
    Spanish: 'es',
    Arabic: 'ar',
    Russian: 'ru',
    Chinese: 'zh-CN'
};

OHCHR.LanguageFields = OHCHR.LanguageFields || {};

OHCHR.LanguageFields.ensureArray = function(value) {
    if (typeof OHCHR.ensureArray === 'function') {
        return OHCHR.ensureArray(value);
    }

    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === '') return [];
    return [value];
};

OHCHR.LanguageFields.normalizeConfig = function(config = {}) {
    const otherFieldNames = OHCHR.LanguageFields.ensureArray(
        config.otherFields || config.otherField || 'OtherUNLanguages'
    );

    return {
        originalField: config.originalField || 'OriginalLanguage',
        otherField: otherFieldNames[0] || 'OtherUNLanguages',
        otherFields: otherFieldNames.length ? otherFieldNames : ['OtherUNLanguages'],
        languages: config.languages || OHCHR.UN_LANGUAGES || [],
        logActive: config.logActive !== false
    };
};

OHCHR.getActiveLangs = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageFields.normalizeConfig(config);

    if (!activeForm || typeof activeForm.field !== 'function') {
        return [];
    }

    const orig = activeForm.field(settings.originalField)?.value;

    const others = settings.otherFields.flatMap(fieldName =>
        OHCHR.LanguageFields.ensureArray(activeForm.field(fieldName)?.value)
    );

    const active = orig
        ? [orig, ...others.filter(lang => lang !== orig)]
        : [...others];

    return [...new Set(active.filter(Boolean))];
};

OHCHR.updateOtherLanguagesOptions = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageFields.normalizeConfig(config);

    if (!activeForm || typeof activeForm.field !== 'function') {
        return Promise.resolve([]);
    }

    const originalField = activeForm.field(settings.originalField);
    const otherField = activeForm.field(settings.otherField);

    if (!originalField || !otherField) {
        return Promise.resolve([]);
    }

    const origLang = originalField.value;

    const items = settings.languages
        .filter(lang => lang !== origLang)
        .map(lang => ({ text: lang, value: lang }));

    const applyOptions = function() {
        const current = OHCHR.LanguageFields.ensureArray(otherField.value)
            .filter(lang => lang !== origLang);

        if (otherField.widget && typeof otherField.widget.setDataSource === 'function') {
            otherField.widget.setOptions({
                dataTextField: 'text',
                dataValueField: 'value'
            });

            otherField.widget.setDataSource(new kendo.data.DataSource({ data: items }));
            otherField.widget.refresh();
            otherField.widget.value(current);
            otherField.widget.trigger('change');
        } else {
            try {
                otherField.options = items;
            } catch (e) {
                console.warn(`Could not set ${settings.otherField} options:`, e);
            }

            otherField.value = current;
        }

        return OHCHR.getActiveLangs(activeForm, settings);
    };

    if (typeof otherField.ready === 'function') {
        return otherField.ready().then(applyOptions);
    }

    return Promise.resolve(applyOptions());
};

OHCHR.initLanguageFields = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageFields.normalizeConfig(config);

    if (!activeForm || typeof activeForm.field !== 'function') {
        return Promise.resolve([]);
    }

    const originalField = activeForm.field(settings.originalField);

    if (!originalField) {
        return Promise.resolve([]);
    }

    const update = function() {
        return OHCHR.updateOtherLanguagesOptions(activeForm, settings).then(function(activeLangs) {
            if (settings.logActive) {
                console.log('Active languages:', activeLangs);
            }

            return activeLangs;
        });
    };

    if (!window._languageFieldsInitialized) {
        window._languageFieldsInitialized = true;

        if (typeof originalField.$on === 'function') {
            originalField.$on('change', update);
        }
    }

    return update();
};
