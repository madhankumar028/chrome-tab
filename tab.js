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
        
        DEFAULT_FAVICON: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII=',

        SHORTCUT_KEY: '⌘+⇧+k, ⌃+⇧+k',

        BASIC_SWITCH_TAB_MARKUP : `
            <div class="chrome-tab" id="tabber">
                <input type="search" class="search-box">
                <ul id="tab-list"></ul>
            </div>
        `,

        TAB_TEMPLATE  : `
            <li class="tab-item">
                <span class="favicon-img">
                    <img src="{favIcon}">
                </span>
                <span class="title">{tabTitle}</span>
            </li>
        `,
    };

    const chromeTabModule = {
        
        allOpenedTabs: [],
        
        switchTab: (tabId) => {},
        
        getAllTabs: (callback) => {
            chrome.tabs.query({}, tabs => {
                callback(tabs);
            });
        },
        
        loadChromeExtension: () => {
            chromeTabModule.getAllTabs(chromeTabModule.constructTabs);
            // TODO: needs to add event listener here for keyboard shortut to open all opened tabs
        },

        constructTabs: (tabs) => {
            let element = document.createElement('div');
            let tabList;

            chromeTabModule.allOpenedTabs = tabs;
            
            element.innerHTML = CONFIG.BASIC_SWITCH_TAB_MARKUP;
            document.body.appendChild(element);

            tabList = document.getElementById('tab-list');
            
            tabs.forEach((tab, index) => {
                let list = document.createElement('li');
                let title = document.createElement('span');
                let icon = document.createElement('img');
                let favIconWrapper = document.createElement('span');

                icon.setAttribute('src', tab.favIconUrl ? tab.favIconUrl : CONFIG.DEFAULT_FAVICON);
                icon.setAttribute('class', 'fav-icon');
                title.setAttribute('class', 'tab-title');

                title.innerHTML = tab.title;
                
                favIconWrapper.appendChild(icon);
                list.appendChild(favIconWrapper);
                list.appendChild(title);
                
                tabList.appendChild(list);
            });

            chromeTabModule.createTabberShortcutKey();
        },

        createTabberShortcutKey: () => {
            const tabberCustomEvent = new CustomEvent("tabberEvent",  {
                detail: {
                    message: "Tabber event triggered",
                    time: new Date(),
                },
                bubbles: true,
                cancelable: true
            });

            document.getElementById('tabber').dispatchEvent(tabberCustomEvent);
        },
        
        bookmarkTab: (tabId) => {},

        shareTab: (mediaName, tabId) => {},

    };

    chromeTabModule.loadChromeExtension();
}());
