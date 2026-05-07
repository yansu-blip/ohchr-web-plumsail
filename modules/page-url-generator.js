window.OHCHR = window.OHCHR || {};

OHCHR.PageUrls = OHCHR.PageUrls || {};

OHCHR.PageUrls.defaults = {
    pageUrlField: 'PageURL',
    nonUnUrlField: 'NonUNURL',
    publicationDateField: 'PublicationDate',
    originalLanguageField: 'OriginalLanguage',
    previewLanguageField: 'PreviewLanguage',
    nonUnToggleField: 'NonUNToggle',
    nonUnLanguageField: 'NonUNLangName',
    finalisationNonUnField: 'FinalisationNonUNLang',
    issuedByField: 'IssuedBy',
    subjectField: 'Subject-list',
    pageTitlePrefix: 'PageTitle',
    pageTitleLanguage: 'original',
    baseWebUrl: 'https://www.ohchr.org',
    statementsPath: 'statements-and-speeches',
    nonUnPdfPath: '/sites/default/files/statements',
    nonUnCodeLength: 3,
    maxSlugLength: 68,
    loadPinyin: true,
    pinyinScriptUrl: 'https://unpkg.com/pinyin-pro',
    showSelector: '.HideOrShow',
    englishTitleSelector: '.ENPageTitleBG',
    pageUrlTitleTemplate: '{previewLanguage} URL: ',
    pageUrlDescriptionTemplate: 'Preview based on {originalLanguage} title. Final may differ.',
    finalisationNonUnTitleTemplate: '\uD83C\uDF1F Has the statement in {language} been finalized?',
    fieldsToWatch: null,
    languages: null,
    langCodeMap: null,
    stateKey: 'default',
    debug: false
};

OHCHR.PageUrls.ensureArray = function(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === '') return [];
    return [value];
};

OHCHR.PageUrls.config = function(config) {
    const formConfig = window.OHCHR_FORM_CONFIG || {};
    const settings = Object.assign(
        {},
        OHCHR.PageUrls.defaults,
        formConfig.pageUrls || {},
        config || {}
    );

    settings.languages = settings.languages || OHCHR.UN_LANGUAGES || [
        'English',
        'French',
        'Spanish',
        'Arabic',
        'Russian',
        'Chinese'
    ];
    settings.langCodeMap = Object.assign(
        {},
        OHCHR.LANG_CODE_MAP || {},
        {
            English: 'en',
            French: 'fr',
            Spanish: 'es',
            Russian: 'ru',
            Arabic: 'ar',
            Chinese: 'zh'
        },
        settings.langCodeMap || {}
    );
    settings.fieldsToWatch = settings.fieldsToWatch || [
        settings.publicationDateField,
        settings.originalLanguageField,
        settings.previewLanguageField,
        settings.nonUnToggleField,
        settings.nonUnLanguageField
    ];

    return settings;
};

OHCHR.PageUrls.log = function(settings) {
    if (!settings.debug || !window.console) return;
    console.log.apply(console, ['[OHCHR PageUrls]'].concat(Array.prototype.slice.call(arguments, 1)));
};

OHCHR.PageUrls.field = function(form, fieldName) {
    if (!form || typeof form.field !== 'function' || !fieldName) return null;

    try {
        return form.field(fieldName);
    } catch (e) {
        return null;
    }
};

OHCHR.PageUrls.setSelectorVisible = function(selector, visible) {
    if (!selector || typeof document === 'undefined') return;

    const $ = window.jQuery || window.$ || null;

    if ($) {
        $(selector).toggle(visible);
        return;
    }

    Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function(element) {
        element.style.display = visible ? '' : 'none';
    });
};

OHCHR.PageUrls.setReadOnly = function(form, settings) {
    const pageUrlField = OHCHR.PageUrls.field(form, settings.pageUrlField);
    const nonUnUrlField = OHCHR.PageUrls.field(form, settings.nonUnUrlField);

    if (pageUrlField) pageUrlField.disabled = true;
    if (nonUnUrlField) nonUnUrlField.disabled = true;
};

OHCHR.PageUrls.updateEnglishTitleVisibility = function(form, config) {
    const settings = OHCHR.PageUrls.config(config);
    const originalLanguage = OHCHR.PageUrls.field(form, settings.originalLanguageField)?.value;

    OHCHR.PageUrls.setSelectorVisible(settings.englishTitleSelector, originalLanguage !== 'English');
};

OHCHR.PageUrls.getDateParts = function(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return {
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        day: String(date.getDate()).padStart(2, '0')
    };
};

OHCHR.PageUrls.slugify = function(value, settings) {
    if (OHCHR.Transliteration && typeof OHCHR.Transliteration.slugify === 'function') {
        return OHCHR.Transliteration.slugify(value, {
            maxLength: settings.maxSlugLength,
            stopWords: settings.stopWords
        });
    }

    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, settings.maxSlugLength);
};

OHCHR.PageUrls.renderTemplate = function(template, values) {
    return String(template || '').replace(/\{([^}]+)\}/g, function(match, key) {
        return values[key] === undefined || values[key] === null ? '' : values[key];
    });
};

OHCHR.PageUrls.generate = function(form, config) {
    const activeForm = form || window.fd || null;
    const settings = OHCHR.PageUrls.config(config);

    if (!activeForm) return '';

    const pageUrlField = OHCHR.PageUrls.field(activeForm, settings.pageUrlField);
    const nonUnUrlField = OHCHR.PageUrls.field(activeForm, settings.nonUnUrlField);
    const publicationDateField = OHCHR.PageUrls.field(activeForm, settings.publicationDateField);
    const originalLanguageField = OHCHR.PageUrls.field(activeForm, settings.originalLanguageField);
    const previewLanguageField = OHCHR.PageUrls.field(activeForm, settings.previewLanguageField);
    const nonUnToggleField = OHCHR.PageUrls.field(activeForm, settings.nonUnToggleField);
    const nonUnLanguageField = OHCHR.PageUrls.field(activeForm, settings.nonUnLanguageField);
    const issuedByField = OHCHR.PageUrls.field(activeForm, settings.issuedByField);
    const subjectField = OHCHR.PageUrls.field(activeForm, settings.subjectField);
    const previewLanguage = previewLanguageField?.value;
    const originalLanguage = originalLanguageField?.value;
    const pageTitleLanguage = settings.pageTitleLanguage === 'preview'
        ? previewLanguage
        : originalLanguage;
    const pageTitleField = pageTitleLanguage
        ? OHCHR.PageUrls.field(activeForm, settings.pageTitlePrefix + pageTitleLanguage)
        : null;
    const pageTitleValue = pageTitleField?.value || '';
    const dateParts = OHCHR.PageUrls.getDateParts(publicationDateField?.value);
    const langCode = settings.langCodeMap[previewLanguage] || 'en';
    let finalPageUrl = '';

    if (issuedByField) issuedByField.required = true;
    if (subjectField) subjectField.required = true;

    OHCHR.PageUrls.setSelectorVisible(settings.showSelector, true);
    OHCHR.PageUrls.updateEnglishTitleVisibility(activeForm, settings);

    if (!pageUrlField) return '';

    if (!dateParts || !pageTitleValue) {
        pageUrlField.hidden = true;
    } else {
        const slug = OHCHR.PageUrls.slugify(pageTitleValue, settings);
        const pageUrlPath = [
            settings.baseWebUrl.replace(/\/+$/, ''),
            langCode,
            settings.statementsPath,
            dateParts.year,
            dateParts.month
        ].join('/') + '/';

        pageUrlField.hidden = false;
        finalPageUrl = pageUrlPath + slug;
        pageUrlField.value = finalPageUrl;
        pageUrlField.title = OHCHR.PageUrls.renderTemplate(settings.pageUrlTitleTemplate, {
            previewLanguage: previewLanguage || ''
        });
        pageUrlField.description = OHCHR.PageUrls.renderTemplate(settings.pageUrlDescriptionTemplate, {
            originalLanguage: originalLanguage || ''
        });
    }

    const nonUnLanguageName = nonUnLanguageField?.value || '';
    const shouldShowNonUnUrl = !!(nonUnToggleField?.value && nonUnLanguageName && finalPageUrl && dateParts);

    if (shouldShowNonUnUrl) {
        const finalisationNonUnField = OHCHR.PageUrls.field(activeForm, settings.finalisationNonUnField);
        const firstWord = String(nonUnLanguageName).trim().split(/\s+/)[0];
        const slug = finalPageUrl.split('/').filter(Boolean).pop() || '';
        const nonUnLanguageCode = String(nonUnLanguageName).trim().toLowerCase().substring(0, settings.nonUnCodeLength);

        if (nonUnUrlField) {
            nonUnUrlField.hidden = false;
            nonUnUrlField.value = settings.baseWebUrl.replace(/\/+$/, '') +
                settings.nonUnPdfPath +
                '/' +
                dateParts.year +
                dateParts.month +
                dateParts.day +
                '-' +
                slug +
                '-' +
                nonUnLanguageCode +
                '.pdf';
        }

        if (finalisationNonUnField) {
            finalisationNonUnField.title = OHCHR.PageUrls.renderTemplate(settings.finalisationNonUnTitleTemplate, {
                language: firstWord
            });
        }
    } else if (nonUnUrlField) {
        nonUnUrlField.hidden = true;
    }

    OHCHR.PageUrls.log(settings, 'generated', finalPageUrl);

    return finalPageUrl;
};

OHCHR.PageUrls.bindFieldChange = function(form, fieldName, callback) {
    const field = OHCHR.PageUrls.field(form, fieldName);

    if (!field) return;

    const bind = function() {
        if (typeof field.$on === 'function') field.$on('change', callback);
        if (field.widget && typeof field.widget.bind === 'function') field.widget.bind('change', callback);
    };

    bind();

    if (typeof field.ready === 'function') {
        field.ready().then(bind);
    }
};

OHCHR.PageUrls.bind = function(form, config) {
    const settings = OHCHR.PageUrls.config(config);

    window._pageUrlsInitialized = window._pageUrlsInitialized || {};
    if (window._pageUrlsInitialized[settings.stateKey]) return;
    window._pageUrlsInitialized[settings.stateKey] = true;

    const generate = function() {
        OHCHR.PageUrls.generate(form, settings);
    };

    settings.fieldsToWatch.forEach(function(fieldName) {
        OHCHR.PageUrls.bindFieldChange(form, fieldName, generate);
    });

    settings.languages.forEach(function(language) {
        OHCHR.PageUrls.bindFieldChange(form, settings.pageTitlePrefix + language, generate);
    });
};

OHCHR.PageUrls.init = function(form, config) {
    const activeForm = form || window.fd || null;
    const settings = OHCHR.PageUrls.config(config);

    if (!activeForm) return Promise.resolve('');

    OHCHR.PageUrls.setReadOnly(activeForm, settings);
    OHCHR.PageUrls.bind(activeForm, settings);

    const initialUrl = OHCHR.PageUrls.generate(activeForm, settings);

    if (
        settings.loadPinyin !== false &&
        OHCHR.Transliteration &&
        typeof OHCHR.Transliteration.loadPinyin === 'function'
    ) {
        OHCHR.Transliteration.loadPinyin(settings.pinyinScriptUrl)
            .then(function() {
                OHCHR.PageUrls.log(settings, 'Pinyin library loaded.');
                OHCHR.PageUrls.generate(activeForm, settings);
            })
            .catch(function(error) {
                console.warn('Could not load Pinyin library. Chinese URL transliteration will be limited.', error);
            });
    }

    return Promise.resolve(initialUrl);
};

OHCHR.initPageUrls = function(form, config) {
    return OHCHR.PageUrls.init(form || window.fd, config);
};

OHCHR.generatePageURL = function(form, config) {
    return OHCHR.PageUrls.generate(form || window.fd, config);
};

OHCHR.showEnTitleField = function(form, config) {
    return OHCHR.PageUrls.updateEnglishTitleVisibility(form || window.fd, config);
};

window.generatePageURL = function() {
    return OHCHR.generatePageURL(window.fd, window.OHCHR_FORM_CONFIG?.pageUrls);
};

window.showEnTitleField = function() {
    return OHCHR.showEnTitleField(window.fd, window.OHCHR_FORM_CONFIG?.pageUrls);
};

OHCHR.PageUrls.autoInit = function() {
    if (window.fd && window.OHCHR_FORM_CONFIG?.pageUrls) {
        OHCHR.initPageUrls(window.fd, window.OHCHR_FORM_CONFIG.pageUrls);
    }
};

window.setTimeout(OHCHR.PageUrls.autoInit, 0);
window.setTimeout(OHCHR.PageUrls.autoInit, 500);
