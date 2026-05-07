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

OHCHR.LanguageAaccordions.languageMatches = function(left, right) {
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
            const panel = OHCHR.LanguageAccordions.getPanel(form, lang%°€œèœ°”¤ì(€€€€€€€ô(€€€ô¤ì)ôì()=!!H¹1…¹Õ…•½É‘¥½¹Ì¹ÕÁ‘…Ñ•Y¥Í¥‰¥±¥Ñä€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€½¹ÍĞ€€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•Ñ)EÕ•Éä ¤ì(€€€½¹ÍĞÍ•ÑÑ¥¹Ì€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¹½Éµ…±¥é•½¹™¥œ¡½¹™¥œ¤ì(€€€½¹ÍĞ…Ñ¥Ù”€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•ÑÑ¥Ù•1…¹Õ…•Ì¡™½É´°Í•ÑÑ¥¹Ì¤ì((€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¥¹©•ÑÍÌ¡Í•ÑÑ¥¹Ì¤ì(€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹±½œ¡Í•ÑÑ¥¹Ì°€…Ñ¥Ù”±…¹Õ…•Ìœ°…Ñ¥Ù”¤ì((€€€İ¥¹‘½Ü¹}…½É‘¥½¹AÉ•Ù¥½ÕÍ±åÑ¥Ù”€ôİ¥¹‘½Ü¹}…½É‘¥½¹AÉ•Ù¥½ÕÍ±åÑ¥Ù”ñğíôì(€€€½¹ÍĞÁÉ•Ù¥½ÕÌ€ôİ¥¹‘½Ü¹}…½É‘¥½¹AÉ•Ù¥½ÕÍ±åÑ¥Ù•mÍ•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•åtñğmtì((€€€Í•ÑÑ¥¹Ì¹±…¹Õ…•Ì¹™½É… ¡™Õ¹Ñ¥½¸¡±…¹œ¤ì(€€€€€€€½¹ÍĞ¥ÍÑ¥Ù”€ô…Ñ¥Ù”¹Í½µ”¡…Ñ¥Ù•1…¹œ€ôø=!!H¹1…¹Õ…•½É‘¥½¹Ì¹±…¹Õ…•5…Ñ¡•Ì¡…Ñ¥Ù•1…¹œ°±…¹œ¤¤ì(€€€€€€€½¹ÍĞİ…ÍÑ¥Ù”€ôÁÉ•Ù¥½ÕÌ¹Í½µ”¡ÁÉ•Ù¥½ÕÍ1…¹œ€ôø=!!H¹1…¹Õ…•½É‘¥½¹Ì¹±…¹Õ…•5…Ñ¡•Ì¡ÁÉ•Ù¥½ÕÍ1…¹œ°±…¹œ¤¤ì((€€€€€€€ÑÉäì(€€€€€€€€€€€½¹ÍĞÁ…¹•°€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•ÑA…¹•°¡™½É´°±…¹œ°Í•ÑÑ¥¹Ì¤ì((€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹Í•ÑA…¹•±Y¥Í¥‰±”¡Á…¹•°°¥ÍÑ¥Ù”°Í•ÑÑ¥¹Ì¤ì((€€€€€€€€€€€¥˜€ €˜˜Á…¹•°€˜˜Á…¹•°¸‘•°¤ì(€€€€€€€€€€€€€€€½¹ÍĞ€‘Á…¹•±%Ñ•´€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•ÑA…¹•±%Ñ•´¡Á…¹•°°±…¹œ°Í•ÑÑ¥¹Ì¤ì(€€€€€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹Í•Ñ±•µ•¹ÑY¥Í¥‰±” ‘Á…¹•±%Ñ•´°¥ÍÑ¥Ù”°Í•ÑÑ¥¹Ì¤ì(€€€€€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹±½œ¡Í•ÑÑ¥¹Ì°±…¹œ°¥ÍÑ¥Ù”€ü€Í¡½İ¸œ€è€¡¥‘‘•¸œ°€‘Á…¹•±%Ñ•µlÁt¤ì((€€€€€€€€€€€€€€€¥˜€¡Í•ÑÑ¥¹Ì¹…ÕÑ½áÁ…¹‘9•Ü€˜˜¥ÍÑ¥Ù”€˜˜€…İ…ÍÑ¥Ù”¤ì(€€€€€€€€€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•áÁ…¹‘A…¹•°¡™½É´°±…¹œ°Í•ÑÑ¥¹Ì¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€ô((€€€€€€€€€€€½¹ÍĞ¥Ñ•´€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹™¥¹‘½É‘¥½¹%Ñ•´¡™½É´°±…¹œ°Í•ÑÑ¥¹Ì¤ì(€€€€€€€€€€€¥˜€ €˜˜¥Ñ•´¤ì(€€€€€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹Í•Ñ±•µ•¹ÑY¥Í¥‰±” ¡¥Ñ•´¤°¥ÍÑ¥Ù”°Í•ÑÑ¥¹Ì¤ì(€€€€€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹±½œ¡Í•ÑÑ¥¹Ì°±…¹œ°¥ÍÑ¥Ù”€ü€Í¡½İ¸‰ä¡•…‘•Èœ€è€¡¥‘‘•¸‰ä¡•…‘•Èœ°¥Ñ•´¤ì((€€€€€€€€€€€€€€€¥˜€¡Í•ÑÑ¥¹Ì¹…ÕÑ½áÁ…¹‘9•Ü€˜˜¥ÍÑ¥Ù”€˜˜€…İ…ÍÑ¥Ù”¤ì(€€€€€€€€€€€€€€€€€€€€¡¥Ñ•´¤¹™¥¹¡Í•ÑÑ¥¹Ì¹¡•…‘•ÉM•±•Ñ½È¤¹™¥ÉÍĞ ¤¹ÑÉ¥•È ±¥¬œ¤ì(€€€€€€€€€€€€€€€ô(€€€€€€€€€€€ô(€€€€€€€ô…Ñ €¡”¤ì(€€€€€€€€€€€½¹Í½±”¹İ…É¸ ÕÁ‘…Ñ•½É‘¥½¹Y¥Í¥‰¥±¥Ñä•ÉÉ½È™½Èœ°±…¹œ°€œèœ°”¤ì(€€€€€€€ô(€€€ô¤ì((€€€İ¥¹‘½Ü¹}…½É‘¥½¹AÉ•Ù¥½ÕÍ±åÑ¥Ù•mÍ•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•åt€ôl¸¸¹…Ñ¥Ù•tì((€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹…ÁÁ±å¥É•Ñ¥½¹Ì¡™½É´°Í•ÑÑ¥¹Ì¤ì)ôì()=!!H¹1…¹Õ…•½É‘¥½¹Ì¹Í¡•‘Õ±•UÁ‘…Ñ”€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€½¹ÍĞ…Ñ¥Ù•½É´€ô™½É´ñğİ¥¹‘½Ü¹™ì(€€€½¹ÍĞÍ•ÑÑ¥¹Ì€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¹½Éµ…±¥é•½¹™¥œ¡½¹™¥œ¤ì((€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹ÕÁ‘…Ñ•Y¥Í¥‰¥±¥Ñä¡…Ñ¥Ù•½É´°Í•ÑÑ¥¹Ì¤ì((€€€Í•ÑÑ¥¹Ì¹É•™É•Í¡•±…åÌ¹™½É… ¡™Õ¹Ñ¥½¸¡‘•±…ä¤ì(€€€€€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ¡™Õ¹Ñ¥½¸ ¤ì(€€€€€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹ÕÁ‘…Ñ•Y¥Í¥‰¥±¥Ñä¡…Ñ¥Ù•½É´°Í•ÑÑ¥¹Ì¤ì(€€€€€€€ô°‘•±…ä¤ì(€€€ô¤ì)ôì()=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•Ñ¥•±‘M•±•Ñ½È€ô™Õ¹Ñ¥½¸¡™¥•±‘9…µ”¤ì(€€€½¹ÍĞ•Í…Á•€ôMÑÉ¥¹œ¡™¥•±‘9…µ”¤¹ÍÁ±¥Ğ qpœ¤¹©½¥¸ qqqpœ¤¹ÍÁ±¥Ğ œˆœ¤¹©½¥¸ qpˆœ¤ì((€€€É•ÑÕÉ¸l(€€€€€€€m¹…µ”ôˆ‘í•Í…Á•‘ô‰u€°(€€€€€€€m‘…Ñ„µ™¥•±ôˆ‘í•Í…Á•‘ô‰u€°(€€€€€€€m‘…Ñ„µ™¥•±µ¹…µ”ôˆ‘í•Í…Á•‘ô‰u€°(€€€€€€€m‘…Ñ„µ¹…µ”ôˆ‘í•Í…Á•‘ô‰u€°(€€€€€€€m¥ôˆ‘í•Í…Á•‘ô‰u€(€€€t¹©½¥¸ œ°€œ¤ì)ôì()=!!H¹1…¹Õ…•½É‘¥½¹Ì¹‰¥¹€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€½¹ÍĞ…Ñ¥Ù•½É´€ô™½É´ñğİ¥¹‘½Ü¹™ì(€€€½¹ÍĞÍ•ÑÑ¥¹Ì€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¹½Éµ…±¥é•½¹™¥œ¡½¹™¥œ¤ì((€€€¥˜€ ……Ñ¥Ù•½É´ñğÑåÁ•½˜…Ñ¥Ù•½É´¹™¥•±€„ôô€™Õ¹Ñ¥½¸œ¤É•ÑÕÉ¸ì((€€€İ¥¹‘½Ü¹}±…¹Õ…•½É‘¥½¹Í%¹¥Ñ¥…±¥é•€ôİ¥¹‘½Ü¹}±…¹Õ…•½É‘¥½¹Í%¹¥Ñ¥…±¥é•ñğíôì(€€€¥˜€¡İ¥¹‘½Ü¹}±…¹Õ…•½É‘¥½¹Í%¹¥Ñ¥…±¥é•‘mÍ•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•åt¤É•ÑÕÉ¸ì(€€€İ¥¹‘½Ü¹}±…¹Õ…•½É‘¥½¹Í%¹¥Ñ¥…±¥é•‘mÍ•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•åt€ôÑÉÕ”ì((€€€½¹ÍĞ•¹ÍÕÉ•ÉÉ…ä€ô=!!H¹•¹ÍÕÉ•ÉÉ…äñğ™Õ¹Ñ¥½¸¡Ù…±Õ”¤ì(€€€€€€€¥˜€¡ÉÉ…ä¹¥ÍÉÉ…ä¡Ù…±Õ”¤¤É•ÑÕÉ¸Ù…±Õ”ì(€€€€€€€¥˜€¡Ù…±Õ”€ôôô¹Õ±°ñğÙ…±Õ”€ôôôÕ¹‘•™¥¹•ñğÙ…±Õ”€ôôô€œœ¤É•ÑÕÉ¸mtì(€€€€€€€É•ÑÕÉ¸mÙ…±Õ•tì(€€€ôì((€€€½¹ÍĞÍ¡•‘Õ±”€ô™Õ¹Ñ¥½¸ ¤ì(€€€€€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹Í¡•‘Õ±•UÁ‘…Ñ”¡…Ñ¥Ù•½É´°Í•ÑÑ¥¹Ì¤ì(€€€ôì((€€€½¹ÍĞ™¥•±‘9…µ•Ì€ôl(€€€€€€€Í•ÑÑ¥¹Ì¹±…¹Õ…•¥•±‘Ì¹½É¥¥¹…±¥•±ñğ€=É¥¥¹…±1…¹Õ…”œ°(€€€€€€€€¸¸¹•¹ÍÕÉ•ÉÉ…ä¡Í•ÑÑ¥¹Ì¹±…¹Õ…•¥•±‘Ì¹½Ñ¡•É¥•±‘ÌñğÍ•ÑÑ¥¹Ì¹±…¹Õ…•¥•±‘Ì¹½Ñ¡•É¥•±ñğ€=Ñ¡•ÉU91…¹Õ…•Ìœ¤(€€€tì((€€€™¥•±‘9…µ•Ì¹™½É… ¡™Õ¹Ñ¥½¸¡™¥•±‘9…µ”¤ì(€€€€€€€½¹ÍĞ™¥•±€ô…Ñ¥Ù•½É´¹™¥•±¡™¥•±‘9…µ”¤ì(€€€€€€€½¹ÍĞ‰¥¹‘¥•±€ô™Õ¹Ñ¥½¸ ¤ì(€€€€€€€€€€€¥˜€ …™¥•±¤É•ÑÕÉ¸ì((€€€€€€€€€€€¥˜€¡ÑåÁ•½˜™¥•±¸‘½¸€ôôô€™Õ¹Ñ¥½¸œ¤ì(€€€€€€€€€€€€€€€™¥•±¸‘½¸ ¡…¹”œ°Í¡•‘Õ±”¤ì(€€€€€€€€€€€ô((€€€€€€€€€€€¥˜€¡™¥•±¹İ¥‘•Ğ€˜˜ÑåÁ•½˜™¥•±¹İ¥‘•Ğ¹‰¥¹€ôôô€™Õ¹Ñ¥½¸œ¤ì(€€€€€€€€€€€€€€€™¥•±¹İ¥‘•Ğ¹‰¥¹ ¡…¹”œ°Í¡•‘Õ±”¤ì(€€€€€€€€€€€ô((€€€€€€€€€€€¥˜€¡™¥•±¹İ¥‘•Ğ€˜˜™¥•±¹İ¥‘•Ğ¹•±•µ•¹Ğ€˜˜ÑåÁ•½˜™¥•±¹İ¥‘•Ğ¹•±•µ•¹Ğ¹½¸€ôôô€™Õ¹Ñ¥½¸œ¤ì(€€€€€€€€€€€€€€€™¥•±¹İ¥‘•Ğ¹•±•µ•¹Ğ¹½¸¡¡…¹”¸‘íÍ•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•åô¥¹ÁÕĞ¸‘íÍ•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•åõ€°Í¡•‘Õ±”¤ì(€€€€€€€€€€€ô(€€€€€€€ôì((€€€€€€€‰¥¹‘¥•± ¤ì((€€€€€€€¥˜€¡™¥•±€˜˜ÑåÁ•½˜™¥•±¹É•…‘ä€ôôô€™Õ¹Ñ¥½¸œ¤ì(€€€€€€€€€€€™¥•±¹É•…‘ä ¤¹Ñ¡•¸¡‰¥¹‘¥•±¤ì(€€€€€€€ô(€€€ô¤ì((€€€½¹ÍĞ€€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•Ñ)EÕ•Éä ¤ì(€€€¥˜€ ¤ì(€€€€€€€½¹ÍĞ¹…µ•ÍÁ…”€ô€¹½¡¡É1…¹Õ…•½É‘¥½¹Ì‘íMÑÉ¥¹œ¡Í•ÑÑ¥¹Ì¹ÍÑ…Ñ•-•ä¤¹É•Á±…” ½q\½œ°€œœ¥õ€ì(€€€€€€€€¡‘½Õµ•¹Ğ¤¹½™˜¡¹…µ•ÍÁ…”¤ì((€€€€€€€™¥•±‘9…µ•Ì¹™½É… ¡™Õ¹Ñ¥½¸¡™¥•±‘9…µ”¤ì(€€€€€€€€€€€€¡‘½Õµ•¹Ğ¤¹½¸¡¡…¹”‘í¹…µ•ÍÁ…•ô¥¹ÁÕĞ‘í¹…µ•ÍÁ…•ô±¥¬‘í¹…µ•ÍÁ…•õ€°=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•Ñ¥•±‘M•±•Ñ½È¡™¥•±‘9…µ”¤°™Õ¹Ñ¥½¸ ¤ì(€€€€€€€€€€€€€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ¡Í¡•‘Õ±”°€À¤ì(€€€€€€€€€€€ô¤ì(€€€€€€€ô¤ì(€€€ô)ôì()=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¥¹¥Ğ€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€½¹ÍĞ…Ñ¥Ù•½É´€ô™½É´ñğİ¥¹‘½Ü¹™ì(€€€½¹ÍĞÍ•ÑÑ¥¹Ì€ô=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¹½Éµ…±¥é•½¹™¥œ¡½¹™¥œ¤ì((€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹‰¥¹¡…Ñ¥Ù•½É´°Í•ÑÑ¥¹Ì¤ì(€€€=!!H¹1…¹Õ…•½É‘¥½¹Ì¹Í¡•‘Õ±•UÁ‘…Ñ”¡…Ñ¥Ù•½É´°Í•ÑÑ¥¹Ì¤ì)ôì()=!!H¹¥¹¥Ñ1…¹Õ…•½É‘¥½¹Ì€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€É•ÑÕÉ¸=!!H¹1…¹Õ…•½É‘¥½¹Ì¹¥¹¥Ğ¡™½É´ñğİ¥¹‘½Ü¹™°½¹™¥œ¤ì)ôì()=!!H¹•áÁ…¹‘½É‘¥½¹A…¹•°€ô™Õ¹Ñ¥½¸¡±…¹œ°™½É´°½¹™¥œ€ôíô¤ì(€€€É•ÑÕÉ¸=!!H¹1…¹Õ…•½É‘¥½¹Ì¹•áÁ…¹‘A…¹•°¡™½É´ñğİ¥¹‘½Ü¹™°±…¹œ°½¹™¥œ¤ì)ôì()=!!H¹ÕÁ‘…Ñ•½É‘¥½¹Y¥Í¥‰¥±¥Ñä€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€É•ÑÕÉ¸=!!H¹1…¹Õ…•½É‘¥½¹Ì¹ÕÁ‘…Ñ•Y¥Í¥‰¥±¥Ñä¡™½É´ñğİ¥¹‘½Ü¹™°½¹™¥œ¤ì)ôì()=!!H¹…ÁÁ±å½É‘¥½¹¥É•Ñ¥½¹Ì€ô™Õ¹Ñ¥½¸¡™½É´°½¹™¥œ€ôíô¤ì(€€€É•ÑÕÉ¸=!!H¹1…¹Õ…•½É‘¥½¹Ì¹…ÁÁ±å¥É•Ñ¥½¹Ì¡™½É´ñğİ¥¹‘½Ü¹™°½¹™¥œ¤ì)ôì()İ¥¹‘½Ü¹•áÁ…¹‘½É‘¥½¹A…¹•°€ô™Õ¹Ñ¥½¸¡±…¹œ¤ì(€€€É•ÑÕÉ¸=!!H¹•áÁ…¹‘½É‘¥½¹A…¹•°¡±…¹œ°İ¥¹‘½Ü¹™°İ¥¹‘½Ü¹=!!I}=I5}=9%ü¹±…¹Õ…•½É‘¥½¹Ì¤ì)ôì()İ¥¹‘½Ü¹ÕÁ‘…Ñ•½É‘¥½¹Y¥Í¥‰¥±¥Ñä€ô™Õ¹Ñ¥½¸ ¤ì(€€€É•ÑÕÉ¸=!!H¹ÕÁ‘…Ñ•½É‘¥½¹Y¥Í¥‰¥±¥Ñä¡İ¥¹‘½Ü¹™°İ¥¹‘½Ü¹=!!I}=I5}=9%ü¹±…¹Õ…•½É‘¥½¹Ì¤ì)ôì()İ¥¹‘½Ü¹…ÁÁ±å½É‘¥½¹¥É•Ñ¥½¹Ì€ô™Õ¹Ñ¥½¸ ¤ì(€€€É•ÑÕÉ¸=!!H¹…ÁÁ±å½É‘¥½¹¥É•Ñ¥½¹Ì¡İ¥¹‘½Ü¹™°İ¥¹‘½Ü¹=!!I}=I5}=9%ü¹±…¹Õ…•½É‘¥½¹Ì¤ì)ôì()=!!H¹1…¹Õ…•½É‘¥½¹Ì¹…ÕÑ½%¹¥Ğ€ô™Õ¹Ñ¥½¸ ¤ì(€€€½¹ÍĞ™½É´€ôİ¥¹‘½Ü¹™ñğ€¡ÑåÁ•½˜™€„ôô€Õ¹‘•™¥¹•œ€ü™€è¹Õ±°¤ì(€€€½¹ÍĞ½¹™¥œ€ôİ¥¹‘½Ü¹=!!I}=I5}=9%ü¹±…¹Õ…•½É‘¥½¹Ìì((€€€¥˜€¡™½É´€˜˜½¹™¥œ¤ì(€€€€€€€=!!H¹¥¹¥Ñ1…¹Õ…•½É‘¥½¹Ì¡™½É´°½¹™¥œ¤ì(€€€ô)ôì()¥˜€¡İ¥¹‘½Ü¹=!!I}=I5}=9%ü¹±…¹Õ…•½É‘¥½¹Ì¤ì(€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ¡=!!H¹1…¹Õ…•½É‘¥½¹Ì¹…ÕÑ½%¹¥Ğ°€À¤ì(€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ¡=!!H¹1…¹Õ…•½É‘¥½¹Ì¹…ÕÑ½%¹¥Ğ°€ÔÀÀ¤ì)ô(