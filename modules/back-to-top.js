window.OHCHR = window.OHCHR || {};

OHCHR.BackToTop = OHCHR.BackToTop || {};

OHCHR.BackToTop.injectCss = function() {
    if (window._backToTopCssInjected) return;
    window._backToTopCssInjected = true;

    const style = document.createElement('style');
    style.textContent = `
#backToTop {
    display: none;
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0078d4;
    color: white;
    padding: 10px 14px;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    z-index: 9999;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: background-color 0.3s, opacity 0.3s;
}

#backToTop[data-position="bottom-right"] {
    right: 24px;
    left: auto;
    transform: none;
}

#backToTop:hover {
    background-color: #005a9e;
}
`;
    document.head.appendChild(style);
};

OHCHR.BackToTop.init = function(options = {}) {
    options = options || {};

    const {
        buttonId = 'backToTop',
        showAfter = 200,
        position = 'bottom-center'
    } = options;

    OHCHR.BackToTop.injectCss();

    const btn = document.getElementById(buttonId);

    if (!btn) {
        console.warn(`BackToTop: element #${buttonId} not found`);
        return;
    }

    btn.dataset.position = position;

    if (btn.dataset.initialized) return;
    btn.dataset.initialized = 'true';

    const updateVisibility = function() {
        btn.style.display = window.scrollY > showAfter ? 'block' : 'none';
    };

    updateVisibility();

    window.addEventListener('scroll', updateVisibility);

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

OHCHR.initBackToTop = function(options = {}) {
    return OHCHR.BackToTop.init(options);
};

OHCHR.BackToTop.injectCss();
