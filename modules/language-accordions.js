window.OHCHR = window.OHCHR || {};

OHCHR.LanguageAccordions = OHCHR.LanguageAccordions || {};

OHCHR.LanguageAccordions.normalizeConfig = function(config = {}) {
    const languageFields = config.languageFields || window.OHCHR_FORM_CONFIG?.languages || {};

    return {
        containerPrefix: config.containerPrefix || 'AccordionUNLangs',
        wrapperContainer: config.wrapperContainer || 'AccordionUNLangs',
        languageFields,
        languages: config.languages || languageFields.languages || OHCHR.UN_LANGUAGES || [],
        autoExpandNew: config.autoExpandNew !== false,
        applyDirections: config.applyDirections !== false,
        rtlLanguages: config.rtlLanguages || ['Arabic'],
        stateKey: config.stateKey || 'default'
    };
};

OHCHR.LanguageAccordions.getActiveLanguages = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (typeof OHCHR.getActiveLangs === 'function') {
        return OHCHR.getActiveLangs(activeForm, settings.languageFields);
    }

    if (!activeForm || typeof activeForm.field !== 'function') return [];

    const ensureArray = OHCHR.ensureArray || function(value) {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === '') return [];
        return [value];
    };

    const originalField = settings.languageFields.originalField || 'OriginalLanguage';
    const otherFields = ensureArray(
        settings.languageFields.otherFields || settings.languageFields.otherField || 'OtherUNLanguages'
    );

    const original = activeForm.field(originalField)?.value;
    const others = otherFields.flatMap(fieldName => ensureArray(activeForm.field(fieldName)?.value));
    const active = original ? [original, ...others.filter(lang => lang !== original)] : others;

    return [...new Set(active.filter(Boolean))];
};

OHCHR.LanguageAccordions.getJQuery = function() {
    return window.jQuery || window.$ || null;
};

OHCHR.LanguageAccordions.getPanel = function(form, lang, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (!activeForm || typeof activeForm.container !== 'function') return null;

    try {
        return activeForm.container(settings.containerPrefix + lang);
    } catch (e) {
        return null;
    }
};

OHCHR.LanguageAccordions.getWrapper = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (!activeForm || typeof activeForm.container !== 'function') return null;

    try {
        return activeForm.container(settings.wrapperContainer);
    } catch (e) {
        return null;
    }
};

OHCHR.LanguageAccordions.findAccordionItem = function(form, lang, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();
    const wrapper = OHCHR.LanguageAccordions.getWrapper(form, config);

    if (!$ || !wrapper || !wrapper.$el) return null;

    let match = null;
    $(wrapper.$el).find('.fd-accordion__item, .accordion-item, [class*="accordion-item"]').each(function() {
        const headerText = $(this)
            .find('button, h3, h4, .fd-accordion__header, [class*="header"]')
            .first()
            .text()
            .trim();

        if (headerText.toLowerCase().includes(String(lang).toLowerCase())) {
            match = this;
            return false;
        }

        return undefined;
    });

    return match;
};

OHCHR.LanguageAccordions.expandPanel = function(form, lang, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();

    try {
        const panel = OHCHR.LanguageAccordions.getPanel(form, lang, config);

        if (panel) {
            if (typeof panel.expand === 'function') {
                panel.expand();
                return;
            }

            if ($ && panel.$el) {
                const $panel = $(panel.$el);
                const $header = $panel.find('button, .fd-accordion__header, [class*="header"]').first();
                const isExpanded = $header.attr('aria-expanded') === 'true'
                    || $panel.hasClass('is-open')
                    || $panel.hasClass('fd-accordion__item--open');

                if (!isExpanded) $header.trigger('click');
                return;
            }
        }

        const item = OHCHR.LanguageAccordions.findAccordionItem(form, lang, config);
        if ($ && item) {
            $(item).find('button, .fd-accordion__header').first().trigger('click');
        }
    } catch (e) {
        console.warn('expandAccordionPanel error for', lang, ':', e);
    }
};

OHCHR.LanguageAccordions.applyDirections = function(form, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (!$ || !settings.applyDirections) return;

    settings.languages.forEach(function(lang) {
        const dir = settings.rtlLanguages.includes(lang) ? 'rtl' : 'ltr';

        try {
            const panel = OHCHR.LanguageAccordions.getPanel(form, lang, settings);

            if (panel && panel.$el) {
                const $panel = $(panel.$el);
                $panel.find('input[type="text"], input:not([type]), textarea, select').attr('dir', dir);
                $panel.find('iframe').each(function() {
                    try {
                        $(this).contents().find('body').attr('dir', dir);
                    } catch (e) {}
                });
                $panel.find('.fd-accordion__content, .accordion-content, [class*="accordion-body"], [class*="accordion-content"]')
                    .first()
                    .attr('dir', dir);
                return;
            }

            const item = OHCHR.LanguageAccordions.findAccordionItem(form, lang, settings);
            if (!item) return;

            const $item = $(item);
            $item.find('input[type="text"], input:not([type]), textarea, select').attr('dir', dir);
            $item.find('iframe').each(function() {
                try {
                    $(this).contents().find('body').attr('dir', dir);
                } catch (e) {}
            });
            $item.find('.fd-accordion__content, .accordion-content, [class*="content"]').first().attr('dir', dir);
        } catch (e) {
            console.warn('applyAccordionDirections error for', lang, ':', e);
        }
    });
};

OHCHR.LanguageAccordions.updateVisibility = function(form, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);
    const active = OHCHR.LanguageAccordions.getActiveLanguages(form, settings);

    window._accordionPreviouslyActive = window._accordionPreviouslyActive || {};
    const previous = window._accordionPreviouslyActive[settings.stateKey] || [];

    settings.languages.forEach(function(lang) {
        const isActive = active.includes(lang);
        const wasActive = previous.includes(lang);

        try {
            const panel = OHCHR.LanguageAccordions.getPanel(form, lang, settings);

            if ($ && panel && panel.$el) {
                $(panel.$el).toggle(isActive);

                if (settings.autoExpandNew && isActive && !wasActive) {
                    OHCHR.LanguageAccordions.expandPanel(form, lang, settings);
                }

                return;
            }

            const item = OHCHR.LanguageAccordions.findAccordionItem(form, lang, settings);
            if ($ && item) {
                $(item).toggle(isActive);

                if (settings.autoExpandNew && isActive && !wasActive) {
                    $(item).find('button, .fd-accordion__header').first().trigger('click');
                }
            }
        } catch (e) {
            console.warn('updateAccordionVisibility error for', lang, ':', e);
        }
    });

    window._accordionPreviouslyActive[settings.stateKey] = [...active];

    OHCHR.LanguageAccordions.applyDirections(form, settings);
};

OHCHR.LanguageAccordions.bind = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (!activeForm || typeof activeForm.field !== 'function') return;

    window._languageAccordionsInitialized = window._languageAccordionsInitialized || {};
    if (window._languageAccordionsInitialized[settings.stateKey]) return;
    window._languageAccordionsInitialized[settings.stateKey] = true;

    const ensureArray = OHCHR.ensureArray || function(value) {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === '') return [];
        return [value];
    };

    const fieldNames = [
        settings.languageFields.originalField || 'OriginalLanguage',
        ...ensureArray(settings.languageFields.otherFields || settings.languageFields.otherField || 'OtherUNLanguages')
    ];

    fieldNames.forEach(function(fieldName) {
        const field = activeForm.field(fieldName);
        if (field && typeof field.$on === 'function') {
            field.$on('change', function() {
                OHCHR.LanguageAccordions.updateVisibility(activeForm, settings);
            });
        }
    });
};

OHCHR.LanguageAccordions.init = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    OHCHR.LanguageAccordions.bind(activeForm, settings);
    OHCHR.LanguageAccordions.updateVisibility(activeForm, settings);
};

OHCHR.initLanguageAccordions = function(form, config = {}) {
    return OHCHR.LanguageAccordions.init(form || window.fd, config);
};

OHCHR.expandAccordionPanel = function(lang, form, config = {}) {
    return OHCHR.LanguageAccordions.expandPanel(form || window.fd, lang, config);
};

OHCHR.updateAccordionVisibility = function(form, config = {}) {
    return OHCHR.LanguageAccordions.updateVisibility(form || window.fd, config);
};

OHCHR.applyAccordionDirections = function(form, config = {}) {
    return OHCHR.LanguageAccordions.applyDirections(form || window.fd, config);
};

window.expandAccordionPanel = function(lang) {
    return OHCHR.expandAccordionPanel(lang, window.fd, window.OHCHR_FORM_CONFIG?.languageAccordions);
};

window.updateAccordionVisibility = function() {
    return OHCHR.updateAccordionVisibility(window.fd, window.OHCHR_FORM_CONFIG?.languageAccordions);
};

window.applyAccordionDirections = function() {
    return OHCHR.applyAccordionDirections(window.fd, window.OHCHR_FORM_CONFIG?.languageAccordions);
};
