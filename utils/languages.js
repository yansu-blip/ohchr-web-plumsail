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
