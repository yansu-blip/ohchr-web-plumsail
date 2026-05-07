window.OHCHR = window.OHCHR || {};

OHCHR.Translations = OHCHR.Translations || {};

OHCHR.Translations.termsByLanguage = {
    English: {
        'Latest': 'Latest',
        'Media Center': 'Media Center',
        'Statements and speeches': 'Statements and speeches',
        'Delivered by': 'Delivered by',
        'At': 'At',
        'Tags': 'Tags',
        'Special Procedures': 'Special Procedures',
        'Treaty bodies': 'Treaty bodies',
        'Multiple Mechanisms': 'Multiple Mechanisms',
        'Non-official UN languages:': 'Non-official UN languages:'
    },
    French: {
        'Latest': '\u00c0 la une',
        'Media Center': 'Centre des m\u00e9dias',
        'Statements and speeches': 'D\u00e9clarations et discours',
        'Delivered by': 'Prononc\u00e9 par',
        'At': '\u00c0',
        'Tags': 'Mots-cl\u00e9s',
        'Special Procedures': 'Proc\u00e9dures sp\u00e9ciales',
        'Treaty bodies': 'Organes conventionnels',
        'Multiple Mechanisms': 'Plusieurs m\u00e9canismes',
        'Non-official UN languages:': 'Langues non officielles de l\u2019ONU\u00a0:'
    },
    Russian: {
        'Latest': '\u0410\u043a\u0442\u0443\u0430\u043b\u044c\u043d\u043e\u0435',
        'Media Center': '\u041f\u0440\u0435\u0441\u0441-\u0441\u043b\u0443\u0436\u0431\u0430',
        'Statements and speeches': '\u0417\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u044f \u0438 \u0432\u044b\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f',
        'Delivered by': '\u0414\u041e\u041a\u041b\u0410\u0414\u0427\u0418\u041a',
        'At': '-',
        'Tags': '\u0422\u0435\u0433\u0438',
        'Special Procedures': '\u0421\u043f\u0435\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u044b',
        'Treaty bodies': '\u0414\u043e\u0433\u043e\u0432\u043e\u0440\u043d\u044b\u0435 \u043e\u0440\u0433\u0430\u043d\u044b',
        'Multiple Mechanisms': '\u0420\u0430\u0437\u043b\u0438\u0447\u043d\u044b\u0435 \u043c\u0435\u0445\u0430\u043d\u0438\u0437\u043c\u044b',
        'Non-official UN languages:': '\u043d\u0435\u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0435 \u044f\u0437\u044b\u043a\u0438 \u041e\u041e\u041d:'
    },
    Spanish: {
        'Latest': 'Novedades',
        'Media Center': 'Centro de prensa',
        'Statements and speeches': 'Declaraciones y discursos',
        'Delivered by': 'Pronunciado por',
        'At': 'En',
        'Tags': 'Etiquetas',
        'Special Procedures': 'Procedimientos Especiales',
        'Treaty bodies': '\u00d3rganos de Tratados',
        'Multiple Mechanisms': 'M\u00faltiples mecanismos',
        'Non-official UN languages:': 'Idiomas no oficiales de la ONU :'
    },
    Chinese: {
        'Latest': '\u6700\u65b0',
        'Media Center': '\u5a92\u4f53\u4e2d\u5fc3',
        'Statements and speeches': '\u58f0\u660e\u4e0e\u8bb2\u8bdd',
        'Delivered by': '\u53d1\u8a00\u4eba',
        'At': '\u573a\u5408',
        'Tags': '\u6807\u7b7e',
        'Special Procedures': '\u7279\u522b\u7a0b\u5e8f',
        'Treaty bodies': '\u6761\u7ea6\u673a\u6784',
        'Multiple Mechanisms': '\u591a\u4e2a\u673a\u5236',
        'Non-official UN languages:': '\u975e\u8054\u5408\u56fd\u5b98\u65b9\u8bed\u6587:'
    },
    Arabic: {
        'Latest': '\u0622\u062e\u0631 \u0627\u0644\u0623\u062e\u0628\u0627\u0631',
        'Media Center': '\u0645\u0631\u0643\u0632 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0645',
        'Statements and speeches': '\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0648\u0627\u0644\u062e\u0637\u0627\u0628\u0627\u062a',
        'Delivered by': '\u0623\u062f\u0644\u0649/\u062a \u0628\u0647',
        'At': '\u0641\u064a',
        'Tags': 'Tags',
        'Special Procedures': '\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629',
        'Treaty bodies': '\u0647\u064a\u0626\u0627\u062a \u0627\u0644\u0645\u0639\u0627\u0647\u062f\u0627\u062a',
        'Multiple Mechanisms': '\u0622\u0644\u064a\u0627\u062a \u0645\u062a\u0639\u062f\u0d4e\u062f\u0629',
        'Non-official UN languages:': '\u0627\u0644\u0644\u063a\u0627\u062a \u063a\u064a\u0631 \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0644\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062a\u062d\u062f\u0629:'
    }
};

OHCHR.Translations.getTerms = function(language, fallbackLanguage) {
    const fallback = fallbackLanguage || 'English';
    return OHCHR.Translations.termsByLanguage[language] ||
        OHCHR.Translations.termsByLanguage[fallback] ||
        {};
};

OHCHR.Translations.translate = function(language, term, fallbackValue) {
    const terms = OHCHR.Translations.getTerms(language);
    return terms[term] || fallbackValue || term;
};

OHCHR.TERMS_BY_LANGUAGE = OHCHR.Translations.termsByLanguage;
OHCHR.termsByLanguage = OHCHR.Translations.termsByLanguage;
OHCHR.getTermsForLanguage = OHCHR.Translations.getTerms;
OHCHR.translateTerm = OHCHR.Translations.translate;

window.termsByLanguage = OHCHR.Translations.termsByLanguage;
var termsByLanguage = window.termsByLanguage;
