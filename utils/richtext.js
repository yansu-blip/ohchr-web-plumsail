OHCHR.initRichTextEditors = function() {
    if (window._renderedRichTextOptions) return;
    window._renderedRichTextOptions = true;

    const mainBodyToolbar = {
        tools: [
            'undo', 'redo',
            {
                name: 'formatting',
                items: [
                    { text: "Heading-Large",  value: "h3" },
                    { text: "Heading-Medium", value: "h4" },
                    { text: "Heading-Small",  value: "h5" },
                    { text: "Paragraph",      value: "p"  }
                ]
            },
            'bold', 'italic', 'superscript', 'createLink', 'unlink',
            'insertUnorderedList', 'insertOrderedList', 'viewHtml'
        ]
    };

    OHCHR.UN_LANGUAGES.forEach(function(lang) {
        const mainBody = fd.field(`MainBody${lang}`);
        if (mainBody) mainBody.widgetOptions = mainBodyToolbar;
    });
};
