window.OHCHR = window.OHCHR || {};

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
