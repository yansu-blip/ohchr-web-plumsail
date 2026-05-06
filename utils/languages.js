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

OHCHR.getActiveLangs = function(config = {}) {
    const originalField = config.originalField || 'OriginalLanguage';
    const otherFields = config.otherFields || ['OtherUNLanguages'];

    const orig = fd.field(originalField)?.value;

    const others = otherFields.flatMap(fieldName =>
        OHCHR.ensureArray(fd.field(fieldName)?.value)
    );

    const active = orig
        ? [orig, ...others.filter(lang => lang !== orig)]
        : [...others];

    return [...new Set(active.filter(Boolean))];
};

OHCHR.updateOtherLanguagesOptions = function(config = {}) {
    const originalFieldName = config.originalField || "OriginalLanguage";
    const otherFieldName = config.otherField || "OtherUNLanguages";
    const languages = config.languages || OHCHR.UN_LANGUAGES || [];

    const otherField = fd.field(otherFieldName);
    if (!otherField) return;

    const origLang = fd.field(originalFieldName)?.value;

    const items = languages
        .filter(lang => lang !== origLang)
        .map(lang => ({ text: lang, value: lang }));

    otherField.ready().then(function() {
        const current = OHCHR.ensureArray(otherField.value)
            .filter(lang => lang !== origLang);

        if (otherField.widget && typeof otherField.widget.setDataSource === "function") {
            otherField.widget.setOptions({
                dataTextField: "text",
                dataValueField: "value"
            });

            otherField.widget.setDataSource(new kendo.data.DataSource({ data: items }));
            otherField.widget.refresh();
            otherField.widget.value(current);
            otherField.widget.trigger("change");
        } else {
            try {
                otherField.options = items;
            } catch(e) {
                console.warn(`Could not set ${otherFieldName} options:`, e);
            }

            otherField.value = current;
        }
    });
};
