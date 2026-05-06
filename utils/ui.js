window.OHCHR = window.OHCHR || {};

OHCHR.initBackToTop = function (options = {}) {
    const {
        buttonId = 'backToTop',
        showAfter = 200
    } = options;

    const btn = document.getElementById(buttonId);
    if (!btn) {
        console.warn(`BackToTop: element #${buttonId} not found`);
        return;
    }

    if (btn._initialized) return;
    btn._initialized = true;

    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > showAfter ? 'block' : 'none';
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};
