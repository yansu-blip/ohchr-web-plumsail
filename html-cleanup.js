window.OHCHRPlumsail = window.OHCHRPlumsail || {};

window.OHCHRPlumsail.cleanHtml = function (html) {
  if (!html) return "";

  return html
    .replace(/\s+/g, " ")
    .trim();
};
