(function () {
    'use strict';

    var STORAGE_KEY = 'theme';

    function readSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        var isDark = theme === 'dark';
        var checkboxes = document.querySelectorAll('.dark-light-switcher #switch');
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = isDark;
        }
    }

    function init() {
        var saved = readSavedTheme();
        var theme = (saved === 'dark' || saved === 'light') ? saved : 'dark';
        applyTheme(theme);

        var checkboxes = document.querySelectorAll('.dark-light-switcher #switch');
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].addEventListener('change', function () {
                var next = this.checked ? 'dark' : 'light';
                try {
                    localStorage.setItem(STORAGE_KEY, next);
                } catch (e) {}
                applyTheme(next);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
