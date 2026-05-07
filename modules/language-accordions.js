window.OHCHR = window.OHCHR || {};

OHCHR.LanguageAccordions = OHCHR.LanguageAccordions || {};

OHCHR.LanguageAccordions.DEFAULT_LANGUAGES = ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese'];

OHCHR.LanguageAccordions.normalizeConfig = function(config = {}) {
    const languageFields = config.languageFields || window.OHCHR_FORM_CONFIG?.languages || {};
    const languages = config.languages
        || languageFields.languages
        || OHCHR.UN_LANGUAGES
        || Object.keys(OHCHR.LANG_CODE_MAP || {});

    return {
        containerPrefix: config.containerPrefix || 'AccordionUNLangs',
        wrapperContainer: config.wrapperContainer || 'AccordionUNLangs',
        languageFields,
        languages: languages && languages.length ? languages : OHCHR.LanguageAccordions.DEFAULT_LANGUAGES,
        autoExpandNew: config.autoExpandNew !== false,
        applyDirections: config.applyDirections !== false,
        rtlLanguages: config.rtlLanguages || ['Arabic'],
        hiddenClass: config.hiddenClass || 'ohchr-language-accordion-hidden',
        itemSelector: config.itemSelector || '.fd-accordion__item, .fd-accordion-item, .accordion-item, [class*="accordion-item"], [class*="AccordionItem"], .k-panelbar > .k-item, .k-panelbar .k-item, .k-item[role="treeitem"], li[role="treeitem"], .panel, .card',
        headerSelector: config.headerSelector || 'button, h3, h4, .fd-accordion__header, [class*="header"], [class*="title"], [class*="Title"], .k-link',
        contentSelector: config.contentSelector || '.fd-accordion__content, .accordion-content, [class*="accordion-body"], [class*="accordion-content"], .k-content',
        refreshDelays: Array.isArray(config.refreshDelays) ? config.refreshDelays : [150, 500],
        debug: config.debug === true,
        stateKey: config.stateKey || 'default'
    };
};

OHCHR.LanguageAccordions.normalizeLanguageName = function(value) {
    if (typeof value === 'string') return value.trim();
    if (!value || typeof value !== 'object') return '';

    return String(
        value.value
        || value.Value
        || value.text
        || value.Text
        || value.LookupValue
        || value.Title
        || value.Name
        || ''
    ).trim();
};

OHCHR.LanguageAccordions.languageMatches = function(left, right) {
    return OHCHR.LanguageAccordions.normalizeLanguageName(left).toLowerCase()
        === OHCHR.LanguageAccordions.normalizeLanguageName(right).toLowerCase();
};

OHCHR.LanguageAccordions.getActiveLanguages = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (typeof OHCHR.getActiveLangs === 'function') {
        return OHCHR.getActiveLangs(activeForm, settings.languageFields)
            .map(OHCHR.LanguageAccordions.normalizeLanguageName)
            .filter(Boolean);
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

    return [...new Set(active.map(OHCHR.LanguageAccordions.normalizeLanguageName).filter(Boolean))];
};

OHCHR.LanguageAccordions.getJQuery = function() {
    return window.jQuery || window.$ || null;
};

OHCHR.LanguageAccordions.log = function(settings, ...args) {
    if (settings.debug && window.console) {
        console.log('[OHCHR LanguageAccordions]', ...args);
    }
};

OHCHR.LanguageAccordions.injectCss = function(settings) {
    const styleId = 'ohchr-language-accordion-css';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `.${settings.hiddenClass} { display: none !important; }`;
    document.head.appendChild(style);
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
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (!$ || !wrapper || !wrapper.$el) return null;

    let match = null;
    $(wrapper.$el).find(settings.itemSelector).each(function() {
        const headerText = $(this)
            .find(settings.headerSelector)
            .first()
            .text()
            .trim();

        if (headerText.toLowerCase().includes(String(lang).toLowerCase())) {
            match = this;
            return false;
        }

        return undefined;
    });

    if (match) return match;

    $(wrapper.$el).find(settings.headerSelector).each(function() {
        const headerText = $(this).text().trim();

        if (!headerText.toLowerCase().includes(String(lang).toLowerCase())) {
            return undefined;
        }

        const $header = $(this);
        const $item = $header.closest(settings.itemSelector);

        if ($item.length) {
            match = $item[0];
            return false;
        }

        const $fallback = $header.closest('li, section, article, .panel, .card, div');
        if ($fallback.length) {
            match = $fallback[0];
            return false;
        }

        return undefined;
    });

    return match;
};

OHCHR.LanguageAccordions.getPanelItem = function(panel, lang, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    if (!$ || !panel || !panel.$el) return null;

    const $panel = $(panel.$el);
    const $item = $panel.closest(settings.itemSelector);

    if ($item.length) return $item;

    const headerItem = OHCHR.LanguageAccordions.findAccordionItem(window.fd, lang, settings);
    if (headerItem) return $(headerItem);

    return $panel;
};

OHCHR.LanguageAccordions.setPanelVisible = function(panel, isVisible, settings) {
    if (!panel) return;

    try {
        if ('hidden' in panel) {
            panel.hidden = !isVisible;
        }
    } catch (e) {}

    try {
        if (isVisible && typeof panel.show === 'function') {
            panel.show();
        } else if (!isVisible && typeof panel.hide === 'function') {
            panel.hide();
        }
    } catch (e) {}

    try {
        if ('visible' in panel) {
            panel.visible = isVisible;
        }
    } catch (e) {}
};

OHCHR.LanguageAccordions.setElementVisible = function($element, isVisible, settings) {
    if (!$element || !$element.length) return;

    $element.toggleClass(settings.hiddenClass, !isVisible);
    $element.attr('aria-hidden', String(!isVisible));
};

OHCHR.LanguageAccordions.expandPanel = function(form, lang, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    try {
        const panel = OHCHR.LanguageAccordions.getPanel(form, lang, settings);

        if (panel) {
            if (typeof panel.expand === 'function') {
                panel.expand();
                return;
            }

            if ($ && panel.$el) {
                const $panel = OHCHR.LanguageAccordions.getPanelItem(panel, lang, settings);
                const $header = $panel.find(settings.headerSelector).first();
                const isExpanded = $header.attr('aria-expanded') === 'true'
                    || $panel.hasClass('is-open')
                    || $panel.hasClass('fd-accordion__item--open')
                    || $panel.hasClass('k-state-active');

                if (!isExpanded) $header.trigger('click');
                return;
            }
        }

        const item = OHCHR.LanguageAccordions.findAccordionItem(form, lang, settings);
        if ($ && item) {
            $(item).find(settings.headerSelector).first().trigger('click');
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
                $panel.find(settings.contentSelector)
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
            $item.find(settings.contentSelector).first().attr('dir', dir);
        } catch (e) {
            console.warn('applyAccordionDirections error for', lang, ':', e);
        }
    });
};

OHCHR.LanguageAccordions.updateVisibility = function(form, config = {}) {
    const $ = OHCHR.LanguageAccordions.getJQuery();
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);
    const active = OHCHR.LanguageAccordions.getActiveLanguages(form, settings);

    OHCHR.LanguageAccordions.injectCss(settings);
    OHCHR.LanguageAccordions.log(settings, 'active languages', active);

    window._accordionPreviouslyActive = window._accordionPreviouslyActive || {};
    const previous = window._accordionPreviouslyActive[settings.stateKey] || [];

    settings.languages.forEach(function(lang) {
        const isActive = active.some(activeLang => OHCHR.LanguageAccordions.languageMatches(activeLang, lang));
        const wasActive = previous.some(previousLang => OHCHR.LanguageAccordions.languageMatches(previousLang, lang));

        try {
            const panel = OHCHR.LanguageAccordions.getPanel(form, lang, settings);

            OHCHR.LanguageAccordions.setPanelVisible(panel, isActive, settings);

            if ($ && panel && panel.$el) {
                const $panelItem = OHCHR.LanguageAccordions.getPanelItem(panel, lang, settings);
                OHCHR.LanguageAccordions.setElementVisible($panelItem, isActive, settings);
                OHCHR.LanguageAccordions.log(settings, lang, isActive ? 'shown' : 'hidden', $panelItem[0]);

                if (settings.autoExpandNew && isActive && !wasActive) {
                    OHCHR.LanguageAccordions.expandPanel(form, lang, settings);
                }

                return;
            }

            const item = OHCHR.LanguageAccordions.findAccordionItem(form, lang, settings);
            if ($ && item) {
                OHCHR.LanguageAccordions.setElementVisible($(item), isActive, settings);
                OHCHR.LanguageAccordions.log(settings, lang, isActive ? 'shown by header' : 'hidden by header', item);

                if (settings.autoExpandNew && isActive && !wasActive) {
                    $(item).find(settings.headerSelector).first().trigger('click');
                }
            }
        } catch (e) {
            console.warn('updateAccordionVisibility error for', lang, ':', e);
        }
    });

    window._accordionPreviouslyActive[settings.stateKey] = [...active];

    OHCHR.LanguageAccordions.applyDirections(form, settings);
};

OHCHR.LanguageAccordions.scheduleUpdate = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    OHCHR.LanguageAccordions.updateVisibility(activeForm, settings);

    settings.refreshDelays.forEach(function(delay) {
        window.setTimeout(function() {
            OHCHR.LanguageAccordions.updateVisibility(activeForm, settings);
        }, delay);
    });
};

OHCHR.LanguageAccordions.getFieldSelector = function(fieldName) {
    const escaped = String(fieldName).replace(/\/g, '\\').replace(/"/g, '\"');

    return [
        `[name="${escaped}"]`,
        `[data-field="${escaped}"]`,
        `[data-field-name="${escaped}"]`,
        `[data-name="${escaped}"]`,
        `[id$="${escaped}"]`
    ].join(', ');
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

    const schedule = function() {
        OHCHR.LanguageAccordions.scheduleUpdate(activeForm, settings);
    };

    const fieldNames = [
        settings.languageFields.originalField || 'OriginalLanguage',
        ...ensureArray(settings.languageFields.otherFields || settings.languageFields.otherField || 'OtherUNLanguages')
    ];

    fieldNames.forEach(function(fieldName) {
        const field = activeForm.field(fieldName);
        const bindField = function() {
            if (!field) return;

            if (typeof field.$on === 'function') {
                field.$on('change', schedule);
            }

            if (field.widget && typeof field.widget.bind === 'function') {
                field.widget.bind('change', schedule);
            }

            if (field.widget && field.widget.element && typeof field.widget.element.on === 'function') {
                field.widget.element.on(`change.${settings.stateKey} input.${settings.stateKey}`, schedule);
            }
        };

        bindField();

        if (field && typeof field.ready === 'function') {
            field.ready().then(bindField);
        }
    });

    const $ = OHCHR.LanguageAccordions.getJQuery();
    if ($) {
        const namespace = `.ohchrLanguageAccordions${String(settings.stateKey).replace(/\W/g, '')}`;
        $(document).off(namespace);

        fieldNames.forEach(function(fieldName) {
            $(document).on(`change${namespace} input${namespace} click${namespace}`, OHCHR.LanguageAccordions.getFieldSelector(fieldName), function() {
                window.setTimeout(schedule, 0);
            });
        });
    }
};

OHCHR.LanguageAccordions.init = function(form, config = {}) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.normalizeConfig(config);

    OHCHR.LanguageAccordions.bind(activeForm, settings);
    OHCHR.LanguageAccordions.scheduleUpdate(activeForm, settings);
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

OHCHR.LanguageAccordions.autoInit = function() {
    const form = window.fd || (typeof fd !== 'undefined' ? fd : null);
    const config = window.OHCHR_FORM_CONFIG?.languageAccordions;

    if (form && config) {
        OHCHR.initLanguageAccordions(form, config);
    }
};

if (window.OHCHR_FORM_CONFIG?.languageAccordions) {
    window.setTimeout(OHCHR.LanguageAccordions.autoInit, 0);
    window.setTimeout(OHCHR.LanguageAccordions.autoInit, 500);
}
