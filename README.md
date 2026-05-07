# OHCHR Web Plumsail JS Modules

Reusable JavaScript modules for OHCHR Plumsail forms and web automation workflows.

## Structure

```text
/forms
  Form-level orchestrators that read config and call modules.

/modules
  Reusable Plumsail/Kendo feature modules. These may talk to fd.field(...),
  fd.control(...), Kendo widgets, or the DOM.

/utils
  Small helpers for validation, formatting, escaping, normalization, and cleanup.
  Legacy utility entrypoints remain here for backward-compatible CDN URLs.

/examples
  Usage snippets that can be pasted into Plumsail form custom JavaScript.
```

## Current Modules

- `modules/taxonomy-dropdowns.js` populates taxonomy dropdown fields from Power Automate.
- `modules/richtext-editors.js` configures Kendo rich-text editor toolbars.
- `modules/richtext-cleaners.js` attaches paste cleanup and image blocking to rich-text editors.
- `modules/back-to-top.js` initializes the floating Back to Top button.
- `modules/plumsail-fields.js` contains reusable Plumsail field setters.

## Utilities

- `utils/core.js` contains generic helpers such as `ensureArray()` and `escapeHtml()`.
- `utils/html-cleanup.js` contains HTML cleanup helpers for rich-text content.
- `utils/languages.js` contains UN language constants and language-selection helpers.

## Usage

Import scripts into Plumsail forms via CDN, for example with jsDelivr:

```js
await loadScript('https://cdn.jsdelivr.net/gh/yansu-blip/ohchr-web-plumsail@main/modules/taxonomy-dropdowns.js');
```

See `examples/statements-form-loader.js` for a fuller loader snippet.

## Compatibility

Existing `/utils/*.js` CDN URLs are kept as compatibility entrypoints where needed. New form code should prefer `/modules` for Plumsail features and `/utils` for pure helpers.

## Notes

- Designed for the Kendo UI / Plumsail environment.
- Integrated with SharePoint and Power Automate flows.
- Modules should accept the Plumsail form object as an argument where practical instead of relying only on a global `fd`.
