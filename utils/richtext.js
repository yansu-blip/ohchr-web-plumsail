OHCHR.createRichTextToolbar = function(options = {}) {
    const headings = options.headings || ["h5", "p"];

    const headingLabels = {
        h3: "Heading-Large",
        h4: "Heading-Medium",
        h5: "Heading-Small",
        p: "Paragraph"
    };

    const tools = [
        "undo", "redo",
        {
            name: "formatting",
            items: headings.map(tag => ({
                text: headingLabels[tag] || tag,
                value: tag
            }))
        }
    ];

    if (options.lineBreak) {
        tools.push({
            exec: function(e) {
                const $k = window.kendo?.jQuery;
                if (!$k) {
                    console.warn("kendo.jQuery not available");
                    return;
                }

                const editor = $k(this).data("kendoEditor");
                if (!editor) {
                    console.warn("Kendo Editor not found for line break button.");
                    return;
                }

                editor.exec("inserthtml", { value: "<br/>" });
            },
            template: '<a class="k-button k-tool k-group-start k-group-end" role="button" title="Insert Line Break" aria-label="Insert Line Break" style="color:black;"><span class="k-icon k-i-insert-m"></span></a>'
        });
    }

    tools.push("bold");

    if (options.italic !== false) {
        tools.push("italic");
    }

    tools.push(
        "superscript",
        "createLink",
        "unlink",
        "insertUnorderedList",
        "insertOrderedList",
        "viewHtml"
    );

    return { tools };
};

OHCHR.initRichTextEditors = function(config = {}) {
    if (window._renderedRichTextOptions) return;
    window._renderedRichTextOptions = true;

    const fields = config.fields || [];

    fields.forEach(function(item) {
        const languages = item.languages?.length ? item.languages : [""];

        languages.forEach(function(lang) {
            const fieldName = `${item.prefix}${lang}`;
            const field = fd.field(fieldName);

            if (field) {
                field.ready().then(function() {
                    field.widgetOptions = OHCHR.createRichTextToolbar(item);
                });
            }
        });
    });
};
