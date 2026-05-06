window.OHCHR = window.OHCHR || {};

// 1. Toolbar setup
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

// 2. HTML cleaning
OHCHR.cleanRichTextHtml = function(html, options = {}) {
    if (!html) return html;

    html = html.replace(/<span[^>]*style="[^"]*font-weight\s*:\s*bolder[^"]*"[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>');
    html = html.replace(/href="https?:\/\/(account\.plumsail\.com|www\.ohchr\.org|waps\.ohchr\.org)(\/[^"]*)"/gi, 'href="$2"');
    html = html.replace(/\s*(clear|style|lang|name|class|paraid|paraeid|role|data-leveltext|data-font|data-listid|data-list-defn-props|data-list|data-level|aria-setsize|data-aria-posinset|data-aria-level|rel|data-entity-type|data-entity-uuid|data-entity-substitution)="[^"]*"/gi, '');
    html = html.replace(/&nbsp;/gi, ' ');
    html = html.replace(/<(?!\/?em)(?!\/?i)(?!\/?b)(?!\/?strong)(?!\/?br)(?!\/?p)(?!\/?h[1-6])(?!\/?ul)(?!\/?ol)(?!\/?li)(?!\/?a)(?!\/?sup)(?!\/?table)(?!\/?tbody)(?!\/?th)(?!\/?tr)(?!\/?td)[^>]+>/g, '');
    html = html.replace(/<p[^>]*>/g, '<p>');

    if (options.removeEm) {
      html = html.replace(/<(\/?em)[^>]*>/g, '');
    }

    html = html.replace(/(<br\s*\/?>\s*){2,}/gi, '</p>\n<p>');
    html = html.replace(/<a(?![^>]*\bhref\b)[^>]*>(.*?)<\/a>/gi, '$1');

    html = html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, function(match) {
      return match.replace(/<strong>(.*?)<\/strong>/gi, '$1');
    });

    while (/(<[h1-9p]*>\s*<\/[h1-9p]+>|<[h1-9p]*><br\s?\/?><\/[h1-9p]+>)/gi.test(html)) {
      html = html.replace(/(<[h1-9p]*>\s*<\/[h1-9p]+>|<[h1-9p]*><br\s?\/?><\/[h1-9p]+>)/gi, '');
    }

    return html;
};

OHCHR.enforceNoImages = function(editor) {
    const body = editor && editor.body;
    if (!body) return;

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeName === 'IMG') node.remove();

                if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(img => img.remove());
                }
            });
        });
    });

    observer.observe(body, {
        childList: true,
        subtree: true
    });
};
