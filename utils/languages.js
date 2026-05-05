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

OHCHR.getActiveLangs = function() {
    const orig = fd.field('OriginalLanguage')?.value;
    const others = OHCHR.ensureArray(fd.field('OtherUNLanguages')?.value);
    const active = orig ? [orig, ...others.filter(l => l !== orig)] : [...others];
    return active.filter(Boolean);
};
