window.OHCHR = window.OHCHR || {};

OHCHR.Transliteration = OHCHR.Transliteration || {};

OHCHR.Transliteration.arabicMap = {
    '\u0627': 'a',
    '\u0623': 'a',
    '\u0625': 'a',
    '\u0622': 'a',
    '\u0628': 'b',
    '\u062a': 't',
    '\u062b': 'th',
    '\u062c': 'j',
    '\u062d': 'h',
    '\u062e': 'kh',
    '\u062f': 'd',
    '\u0630': 'dh',
    '\u0631': 'r',
    '\u0632': 'z',
    '\u0633': 's',
    '\u0634': 'sh',
    '\u0635': 's',
    '\u0636': 'd',
    '\u0637': 't',
    '\u0638': 'dh',
    '\u0639': '',
    '\u063a': 'gh',
    '\u0641': 'f',
    '\u0642': 'q',
    '\u0643': 'k',
    '\u0644': 'l',
    '\u0645': 'm',
    '\u0646': 'n',
    '\u0647': 'h',
    '\u0648': 'w',
    '\u064a': 'y',
    '\u0649': 'y',
    '\u0629': 't',
    '\u0621': '',
    '\u0626': 'y',
    '\u0624': 'w',
    '\u0671': 'a',
    '\u064b': '',
    '\u064c': '',
    '\u064d': '',
    '\u064e': '',
    '\u064f': '',
    '\u0650': '',
    '\u0651': '',
    '\u0652': ''
};

OHCHR.Transliteration.cyrillicMap = {
    '\u0430': 'a',
    '\u0431': 'b',
    '\u0432': 'v',
    '\u0433': 'g',
    '\u0434': 'd',
    '\u0435': 'e',
    '\u0451': 'yo',
    '\u0436': 'zh',
    '\u0437': 'z',
    '\u0438': 'i',
    '\u0439': 'y',
    '\u043a': 'k',
    '\u043b': 'l',
    '\u043c': 'm',
    '\u043d': 'n',
    '\u043e': 'o',
    '\u043f': 'p',
    '\u0440': 'r',
    '\u0441': 's',
    '\u0442': 't',
    '\u0443': 'u',
    '\u0444': 'f',
    '\u0445': 'kh',
    '\u0446': 'ts',
    '\u0447': 'ch',
    '\u0448': 'sh',
    '\u0449': 'shch',
    '\u044a': '',
    '\u044b': 'y',
    '\u044c': '',
    '\u044d': 'e',
    '\u044e': 'yu',
    '\u044f': 'ya'
};

OHCHR.Transliteration.defaultStopWords = [
    'a',
    'an',
    'as',
    'at',
    'before',
    'but',
    'by',
    'for',
    'from',
    'is',
    'in',
    'into',
    'like',
    'of',
    'off',
    'on',
    'onto',
    'per',
    'since',
    'than',
    'the',
    'this',
    'that',
    'to',
    'up',
    'via',
    'with'
];

OHCHR.Transliteration.loadScript = function(url) {
    if (!url || typeof document === 'undefined') {
        return Promise.resolve(null);
    }

    window._ohchrScriptPromises = window._ohchrScriptPromises || {};

    if (window._ohchrScriptPromises[url]) {
        return window._ohchrScriptPromises[url];
    }

    window._ohchrScriptPromises[url] = new Promise(function(resolve, reject) {
        const existing = Array.prototype.slice.call(document.scripts || []).find(function(script) {
            return script.src === url;
        });

        if (existing && existing.dataset.ohchrLoaded === 'true') {
            resolve(existing);
            return;
        }

        const script = existing || document.createElement('script');

        script.onload = function() {
            script.dataset.ohchrLoaded = 'true';
            resolve(script);
        };
        script.onerror = function() {
            reject(new Error('Failed to load script: ' + url));
        };

        if (!existing) {
            script.src = url;
            document.head.appendChild(script);
        }
    });

    return window._ohchrScriptPromises[url];
};

OHCHR.Transliteration.loadPinyin = function(url) {
    const scriptUrl = url || 'https://unpkg.com/pinyin-pro';

    if (typeof window !== 'undefined' && window.pinyinPro) {
        return Promise.resolve(window.pinyinPro);
    }

    return OHCHR.Transliteration.loadScript(scriptUrl).then(function() {
        return window.pinyinPro || null;
    });
};

OHCHR.Transliteration.getPinyinApi = function() {
    if (typeof window !== 'undefined' && window.pinyinPro) {
        return window.pinyinPro;
    }

    if (typeof pinyinPro !== 'undefined') {
        return pinyinPro;
    }

    return null;
};

OHCHR.Transliteration.toLatin = function(value) {
    const arabic = OHCHR.Transliteration.arabicMap;
    const cyrillic = OHCHR.Transliteration.cyrillicMap;
    const pinyinApi = OHCHR.Transliteration.getPinyinApi();

    return String(value || '').toLowerCase().split('').map(function(ch) {
        if (arabic[ch] !== undefined) return arabic[ch];
        if (cyrillic[ch] !== undefined) return cyrillic[ch];

        if (/[\u4e00-\u9fff]/.test(ch)) {
            if (pinyinApi && typeof pinyinApi.pinyin === 'function') {
                return pinyinApi.pinyin(ch, { toneType: 'none' }).replace(/\s+/g, '-') + '-';
            }

            return ch;
        }

        return ch;
    }).join('');
};

OHCHR.Transliteration.escapeRegex = function(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

OHCHR.Transliteration.truncateSlug = function(slug, maxLength) {
    if (!maxLength || slug.length <= maxLength) return slug;

    let truncated = slug.substring(0, maxLength);

    if (truncated.includes('-')) {
        truncated = truncated.substring(0, truncated.lastIndexOf('-'));
    }

    return truncated.replace(/-+$/, '');
};

OHCHR.Transliteration.slugify = function(value, options) {
    const settings = Object.assign({
        maxLength: 68
    }, options || {});
    settings.stopWords = settings.stopWords || OHCHR.Transliteration.defaultStopWords;

    const stopWords = settings.stopWords || [];
    const stopWordPattern = stopWords.length
        ? new RegExp('\\b(' + stopWords.map(OHCHR.Transliteration.escapeRegex).join('|') + ')\\b', 'g')
        : null;

    let slug = OHCHR.Transliteration.toLatin(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (stopWordPattern) {
        slug = slug.replace(stopWordPattern, '');
    }

    slug = slug
        .replace(/[:\u060c\u061b\u061f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return OHCHR.Transliteration.truncateSlug(slug, settings.maxLength);
};

OHCHR.transliterateToLatin = OHCHR.Transliteration.toLatin;
OHCHR.slugify = OHCHR.Transliteration.slugify;

window.transliterateToLatin = OHCHR.Transliteration.toLatin;
var transliterateToLatin = window.transliterateToLatin;
