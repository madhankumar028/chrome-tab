/**
 * Browser-tabs
 * 
 * Open source browser extension
 * Naviagte to opened tabs like your favourite editor or IDE
 * 
 * @author: Madhankumar <madhankumar028@gmail.com>
 */
(function() {

    'use strict';

    // all the app level constants are configured inside the configure object
    const CONFIG = {
        SHORTCUT_KEY: '⌘+⇧+k, ⌃+⇧+k'
    };

    var chromeTabModule = {
        
        allOpenedTabs: [],
        
        switchTab: function switchTab(tabId) {},
        
        getAllTabs: function getAllTabs(callback) {
            chrome.tabs.query({}, tabs => {
                callback(tabs);
            });
        },
        
        loadChromeExtension: function loadChromeExtension() {
            this.getAllTabs(this.constructTabs);
        },

        constructTabs: function constructTabs(tabs) {
            chromeTabModule.allOpenedTabs = tabs;
        },
        
        bookmarkTab: function bookmarkTab(tabId) {},

        shareTab: function shareTab(mediaName, tabId) {},

    };

    chromeTabModule.loadChromeExtension();
}());
