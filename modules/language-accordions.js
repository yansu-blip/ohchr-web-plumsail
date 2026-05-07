window.OHCHR = window.OHCHR || {};

OHCHR.LanguageAccordions = OHCHR.LanguageAccordions || {};

OHCHR.LanguageAccordions.defaults = {
    languages: ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese'],
    containerPrefix: 'AccordionUNLangs',
    wrapperContainer: 'AccordionUNLangs',
    originalField: 'OriginalLanguage',
    otherField: 'OtherUNLanguages',
    hiddenClass: 'ohchr-language-accordion-hidden',
    itemSelector: '.fd-accordion__item, .fd-accordion-item, .accordion-item, [class*="accordion-item"], .k-panelbar .k-item, li[role="treeitem"], .panel, .card',
    headerSelector: 'button, h3, h4, .fd-accordion__header, [class*="header"], [class*="title"], .k-link',
    contentSelector: '.fd-accordion__content, .accordion-content, [class*="content"], .k-content',
    rtlLanguages: ['Arabic'],
    refreshDelays: [0, 150, 500],
    autoExpandNew: true,
    applyDirections: true,
    debug: false,
    stateKey: 'default'
};

OHCHR.LanguageAccordions.ensureArray = function(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === '') return [];
    return [value];
};

OHCHR.LanguageAccordions.config = function(config) {
    const formConfig = window.OHCHR_FORM_CONFIG || {};
    const languageFields = (config && config.languageFields) || formConfig.languages || {};
    const settings = Object.assign({}, OHCHR.LanguageAccordions.defaults, config || {});

    settings.languageFields = languageFields;
    settings.originalField = languageFields.originalField || settings.originalField;
    settings.otherFields = OHCHR.LanguageAccordions.ensureArray(
        languageFields.otherFields || languageFields.otherField || settings.otherFields || settings.otherField
    );
    settings.languages = settings.languages || languageFields.languages || OHCHR.UN_LANGUAGES || OHCHR.LanguageAccordions.defaults.languages;

    return settings;
};

OHCHR.LanguageAccordions.langName = function(value) {
    if (typeof value === 'string') return value.trim();
    if (!value || typeof value !== 'object') return '';

    return String(
        value.value ||
        value.Value ||
        value.text ||
        value.Text ||
        value.LookupValue ||
        value.Title ||
        value.Name ||
        ''
    ).trim();
};

OHCHR.LanguageAccordions.sameLang = function(left, right) {
    return OHCHR.LanguageAccordions.langName(left).toLowerCase() ===
        OHCHR.LanguageAccordions.langName(right).toLowerCase();
};

OHCHR.LanguageAccordions.getActiveLanguages = function(form, config) {
    const activeForm = form || window.fd;
    const settings = OHCHR.LanguageAccordions.config(config);

    if (typeof OHCHR.getActiveLangs === 'function') {
        return OHCHR.getActiveLangs(activeForm, settings.languageFields)
            .map(OHCHR.LanguageAccordions.langName)
            .filter(Boolean);
    }

    if (!activeForm || typeof activeForm.field !== 'function') return [];

    const original = activeForm.field(settings.originalField)?.value;
    const others = settings.otherFields.flatMap(function(fieldName) {
        return OHCHR.LanguageAccordions.ensureArray(activeForm.field(fieldName)?.value);
    });
    const active = original ? [original].concat(others.filter(function(lang) {
        return lang !== original;
    })) : others;

    return Array.from(new Set(active.map(OHCHR.LanguageAccordions.langName).filter(Boolean)));
};

OHCHR.LanguageAccordions.$ = function() {
    return window.jQuery || window.$ || null;
};

OHCHR.LanguageAccordions.element = function(value) {
    if (!value) return null;
    if (value.nodeType === 1) return value;
    if (value.jquery && value[0]) return value[0];
    if (value.length && value[0] && value[0].nodeType === 1) return value[0];
    return null;
};

OHCHR.LanguageAccordions.findAll = function(root, selector) {
    const element = OHCHR.LanguageAccordions.element(root) || document;
    return Array.prototype.slice.call(element.querySelectorAll(selector));
};

OHCHR.LanguageAccordions.closest = function(element, selector) {
    const el = OHCHR.LanguageAccordions.element(element);
    if (!el || typeof el.closest !== 'function') return null;
    return el.closest(selector);
};

OHCHR.LanguageAccordions.log = function(settings) {
    if (!settings.debug || !window.console) return;
    console.log.apply(console, ['[OHCHR LanguageAccordions]'].concat(Array.prototype.slice.call(arguments, 1)));
};

OHCHR.LanguageAccordions.injectCss = function(settings) {
    const styleId = 'ohchr-language-accordion-css';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = '.' + settings.hiddenClass + ' { display: none !important; }';
    document.head.appendChild(style);
};

OHCHR.LanguageAccordions.container = function(form, name) {
    if (!form || typeof form.container !== 'function') return null;

    try {
        return form.container(name);
    } catch (e) {
        return null;
    }
};

OHCHR.LanguageAccordions.setPlumsailVisible = function(container, visible) {
    if (!container) return;

    try {
        if ('hidden' in container) container.hidden = !visible;
    } catch (e) {}

    try {
        if (visible && typeof container.show === 'function') container.show();
        if (!visible && typeof container.hide === 'function') container.hide();
    } catch (e) {}

    try {
        if ('visible' in container) container.visible = visible;
    } catch (e) {}
};

OHCHR.LanguageAccordions.setElementVisible = function($element, visible, settings) {
    const element = OHCHR.LanguageAccordions.element($element);
    if (!element) return;

    if ($element && $element.jquery) {
        $element.toggleClass(settings.hiddenClass, !visible);
        $element.attr('aria-hidden', String(!visible));
        return;
    }

    element.classList.toggle(settings.hiddenClass, !visible);
    element.setAttribute('aria-hidden', String(!visible));
};

OHCHR.LanguageAccordions.findItemByHeader = function(form, lang, settings) {
    const wrapper = OHCHR.LanguageAccordions.container(form, settings.wrapperContainer);
    const root = wrapper && wrapper.$el ? OHCHR.LanguageAccordions.element(wrapper.$el) : document;
    let match = null;

    OHCHR.LanguageAccordions.findAll(root, settings.itemSelector).some(function(item) {
        const header = item.querySelector(settings.headerSelector);
        const text = header ? header.textContent.trim() : '';
        if (text.toLowerCase().includes(String(lang).toLowerCase())) {
            match = item;
            return true;
        }
        return false;
    });

    if (match) return match;

    OHCHR.LanguageAccordions.findAll(root, settings.headerSelector).some(function(header) {
        const text = header.textContent.trim();
        if (!text.toLowerCase().includes(String(lang).toLowerCase())) return false;

        match = OHCHR.LanguageAccordions.closest(header, settings.itemSelector) ||
            OHCHR.LanguageAccordions.closest(header, 'li, section, article, .panel, .card, div');
        return true;
    });

    return match;
};

OHCHR.LanguageAccordions.findItemForPanel = function(form, panel, lang, settings) {
    if (!panel || !panel.$el) return null;

    const panelElement = OHCHR.LanguageAccordions.element(panel.$el);
    const item = OHCHR.LanguageAccordions.closest(panelElement, settings.itemSelector);
    if (item) return item;

    const itemByHeader = OHCHR.LanguageAccordions.findItemByHeader(form, lang, settings);
    return itemByHeader || panelElement;
};

OHCHR.LanguageAccordions.expand = function(form, lang, settings) {
    const panel = OHCHR.LanguageAccordions.container(form, settings.containerPrefix + lang);
    if (panel && typeof panel.expand === 'function') {
        panel.expand();
        return;
    }

    const item = panel && panel.$el
        ? OHCHR.LanguageAccordions.findItemForPanel(form, panel, lang, settings)
        : OHCHR.LanguageAccordions.findItemByHeader(form, lang, settings);

    if (!item) return;

    const header = item.querySelector(settings.headerSelector);
    const open = (header && header.getAttribute('aria-expanded') === 'true') ||
        item.classList.contains('is-open') ||
        item.classList.contains('fd-accordion__item--open') ||
        item.classList.contains('k-state-active');

    if (!open && header) header.click();
};

OHCHR.LanguageAccordions.applyDirections = function(form, config) {
    const settings = OHCHR.LanguageAccordions.config(config);
    if (!settings.applyDirections) return;

    settings.languages.forEach(function(lang) {
        const panel = OHCHR.LanguageAccordions.container(form, settings.containerPrefix + lang);
        const dir = settings.rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
        const target = panel && panel.$el
            ? OHCHR.LanguageAccordions.element(panel.$el)
            : OHCHR.LanguageAccordions.findItemByHeader(form, lang, settings);

        if (!target) return;

        OHCHR.LanguageAccordions.findAll(target, 'input[type="text"], input:not([type]), textarea, select').forEach(function(input) {
            input.setAttribute('dir', dir);
        });

        const content = target.querySelector(settings.contentSelector);
        if (content) content.setAttribute('dir', dir);

        OHCHR.LanguageAccordions.findAll(target, 'iframe').forEach(function(iframe) {
            try {
                iframe.contentDocument.body.setAttribute('dir', dir);
            } catch (e) {}
        });
    });
};

OHCHR.LanguageAccordions.updateVisibility = function(form, config) {
    const settings = OHCHR.LanguageAccordions.config(config);
    const active = OHCHR.LanguageAccordions.getActiveLanguages(form, settings);

    OHCHR.LanguageAccordions.injectCss(settings);
    OHCHR.LanguageAccordions.log(settings, 'active languages', active);

    window._accordionPreviouslyActive = window._accordionPreviouslyActive || {};
    const previous = window._accordionPreviouslyActive[settings.stateKey] || [];

    settings.languages.forEach(function(lang) {
        const visible = active.some(function(activeLang) {
            return OHCHR.LanguageAccordions.sameLang(activeLang, lang);
        });
        const wasVisible = previous.some(function(previousLang) {
            return OHCHR.LanguageAccordions.sameLang(previousLang, lang);
        });
        const panel = OHCHR.LanguageAccordions.container(form, settings.containerPrefix + lang);

        OHCHR.LanguageAccordions.setPlumsailVisible(panel, visible);

        const item = panel && panel.$el
            ? OHCHR.LanguageAccordions.findItemForPanel(form, panel, lang, settings)
            : OHCHR.LanguageAccordions.findItemByHeader(form, lang, settings);

        OHCHR.LanguageAccordions.setElementVisible(item, visible, settings);
        OHCHR.LanguageAccordions.log(settings, lang, visible ? 'show' : 'hide', item);

        if (settings.autoExpandNew && visible && !wasVisible) {
            OHCHR.LanguageAccordions.expand(form, lang, settings);
        }
    });

    window._accordionPreviouslyActive[settings.stateKey] = active.slice();
    OHCHR.LanguageAccordions.applyDirections(form, settings);
};

OHCHR.LanguageAccordions.scheduleUpdate = function(form, config) {
    const settings = OHCHR.LanguageAccordions.config(config);

    settings.refreshDelays.forEach(function(delay) {
        window.setTimeout(function() {
            OHCHR.LanguageAccordions.updateVisibility(form, settings);
        }, delay);
    });
};

OHCHR.LanguageAccordions.bind = function(form, config) {
    const settings = OHCHR.LanguageAccordions.config(config);
    const $ = OHCHR.LanguageAccordions.$();

    window._languageAccordionsInitialized = window._languageAccordionsInitialized || {};
    if (window._languageAccordionsInitialized[settings.stateKey]) return;
    window._languageAccordionsInitialized[settings.stateKey] = true;

    const schedule = function() {
        OHCHR.LanguageAccordions.scheduleUpdate(form, settings);
    };
    const fields = [settings.originalField].concat(settings.otherFields);

    fields.forEach(function(fieldName) {
        const field = form && typeof form.field === 'function' ? form.field(fieldName) : null;
        const bindField = function() {
            if (!field) return;
            if (typeof field.$on === 'function') field.$on('change', schedule);
            if (field.widget && typeof field.widget.bind === 'function') field.widget.bind('change', schedule);
        };

        bindField();
        if (field && typeof field.ready === 'function') field.ready().then(bindField);

        if ($) {
            const selector = '[name="' + fieldName + '"], [data-field="' + fieldName + '"], [data-field-name="' + fieldName + '"], [data-name="' + fieldName + '"], [id$="' + fieldName + '"]';
            $(document).on('change input click', selector, function() {
                window.setTimeout(schedule, 0);
            });
        }
    });

    if (!window._languageAccordionsNativeListener) {
        window._languageAccordionsNativeListener = true;
        document.addEventListener('change', function() {
            window.setTimeout(schedule, 0);
        }, true);
    }
};

OHCHR.LanguageAccordions.init = function(form, config) {
    const activeForm = form || window.fd || null;
    const settings = OHCHR.LanguageAccordions.config(config);

    if (!activeForm) return;

    OHCHR.LanguageAccordions.bind(activeForm, settings);
    OHCHR.LanguageAccordions.scheduleUpdate(activeForm, settings);
};

OHCHR.initLanguageAccordions = function(form, config) {
    return OHCHR.LanguageAccordions.init(form || window.fd, config);
};

OHCHR.expandAccordionPanel = function(lang, form, config) {
    return OHCHR.LanguageAccordions.expand(form || window.fd, lang, OHCHR.LanguageAccordions.config(config));
};

OHCHR.updateAccordionVisibility = function(form, config) {
    return OHCHR.LanguageAccordions.updateVisibility(form || window.fd, config);
};

OHCHR.applyAccordionDirections = function(form, config) {
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
    if (window.fd && window.OHCHR_FORM_CONFIG?.languageAccordions) {
        OHCHR.initLanguageAccordions(window.fd, window.OHCHR_FORM_CONFIG.languageAccordions);
    }
};

window.setTimeout(OHCHR.LanguageAccordions.autoInit, 0);
window.setTimeout(OHCHR.LanguageAccordions.autoInit, 500);
