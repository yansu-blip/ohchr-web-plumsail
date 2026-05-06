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

    if (btn.dataset.initialized) return;
    btn.dataset.initialized = "true";
    btn._initialized = true;

    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > showAfter ? 'block' : 'none';
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

if (!window._backToTopCssInjected) {
    window._backToTopCssInjected = true;

    const style = document.createElement('style');
    style.textContent = `
#backToTop {
    display: none;
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    padding: 10px 14px;
    border: 0;
    border-radius: 4px;
    background: #005eb8;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
}
#backToTop:hover {
    background: #004b93;
}
`;
    document.head.appendChild(style);
}
