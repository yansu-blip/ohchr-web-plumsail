window.OHCHR = window.OHCHR || {};

OHCHR.initBackToTop = function (options = {}) {

    options = options || {};

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
#back-to-top {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0078d4;
    color: white;
    padding: 10px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    z-index: 9999;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: background-color 0.3s, opacity 0.3s;
  }

#back-to-top:hover {
    background-color: #005a9e;
}
`;
    document.head.appendChild(style);
}
