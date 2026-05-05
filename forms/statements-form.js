fd.rendered(async function () {
    try {
        await OHCHR.initializeDropdowns();

        OHCHR.initRichTextEditors();

        // Later add:
        // OHCHR.initNonUNLanguage();
        // OHCHR.initPreview();
        // OHCHR.initEmbargo();
        // OHCHR.initDrafts();
        // OHCHR.initSubmissionGuard();

        console.log('Statements form initialized successfully.');
    } catch (error) {
        console.error('Error initializing Statements form:', error);
    }
});
