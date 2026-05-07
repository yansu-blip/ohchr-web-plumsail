function loadScript(url) {
    return new Promise(function(resolve, reject) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = function() {
            reject(new Error('Failed to load script: ' + url));
        };
        document.head.appendChild(script);
    });
}

fd.rendered(async function() {
    try {
        window.fd = fd;

        const baseUrl = 'https://cdn.jsdelivr.net/gh/yansu-blip/ohchr-web-plumsail@main';

        window.OHCHR_CONFIG = {
            // Replace this placeholder with the full Power Automate HTTP trigger URL.
            FLOW_URL: '<POWER_AUTOMATE_FLOW_URL>'
        };

        window.OHCHR_FORM_CONFIG = {
            ui: {
                backToTop: {
                    buttonId: 'backToTop',
                    showAfter: 200,
                    position: 'bottom-center'
                }
            },
            languages: {
                originalField: 'OriginalLanguage',
                otherField: 'OtherUNLanguages'
            },
            dropdowns: {
                lang: 'en',
                fields: {
                    entity: 'IssuedBy',
                    subject: 'Subject-list',
                    geolocation: 'Geolocation-list'
                }
            },
            richTextEditors: {
                fields: [
                    {
                        prefix: 'MainBody',
                        languages: ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese'],
                        headings: ['h3', 'h4', 'h5', 'p'],
                        lineBreak: true,
                        italic: true
                    },
                    {
                        prefix: 'Boilerplate',
                        languages: ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese'],
                        headings: ['h5', 'p'],
                        lineBreak: true,
                        italic: false
                    }
                ]
            },
            richTextCleaners: [
                {
                    prefix: 'MainBody',
                    languages: ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese']
                },
                {
                    prefix: 'Boilerplate',
                    languages: ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Chinese'],
                    options: {
                        removeEm: true
                    }
                }
            ]
        };

        await loadScript(`${baseUrl}/utils/core.js`);
        await loadScript(`${baseUrl}/utils/html-cleanup.js`);
        await loadScript(`${baseUrl}/utils/languages.js`);

        await loadScript(`${baseUrl}/modules/plumsail-fields.js`);
        await loadScript(`${baseUrl}/modules/taxonomy-dropdowns.js`);
        await loadScript(`${baseUrl}/modules/richtext-editors.js`);
        await loadScript(`${baseUrl}/modules/richtext-cleaners.js`);
        await loadScript(`${baseUrl}/modules/back-to-top.js`);

        await loadScript(`${baseUrl}/forms/form.js`);

        OHCHR.initBackToTop(window.OHCHR_FORM_CONFIG?.ui?.backToTop);
    } catch (err) {
        console.error('OHCHR form initialization failed:', err);
    }
});
