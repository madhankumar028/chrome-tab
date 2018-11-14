/**
 * Browser-tabs
 * 
 * Open source browser extension
 * Naviagte to opened tabs like your favourite editor or IDE
 * 
 * @author: Madhankumar<madhankumar028@gmail.com>
 */
(function() {

    'use strict';

    // all the app level constants are configured inside the configure object
    const CONFIG = {
        
        DEFAULT_FAVICON: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII=',

        BASIC_SWITCH_TAB_MARKUP : `
            <div class="chrome-tab" id="tabber">
                <input class="search-box" type="search" id="chrome-tab-search">
                <ul id="open-tabs" class="tab-list"></ul>
            </div>
        `,
    };

    /**
     * Listener for background scripts
     */
    chrome.runtime.onMessage.addListener(function(req, sender, senderResponse) {
        if (req === 'toggle-feature-foo') {
            hideTabList();
            senderResponse(`${sender.id} Received the command`);
        }
    });

    function filterTabs(event) {
        let searchBox = document.getElementById('chrome-tab-search');
        let matchedTabs = [];

        if (searchBox.value.length) {
            matchedTabs = chromeTabModule.allOpenedTabs.filter(function(tab, index) {
                if (
                    (tab.title.includes(searchBox.value) 
                    || tab.url.includes(searchBox.value)
                    )
                ) {
                    return tab;
                }
            });
            chromeTabModule.constructTabs(matchedTabs);
        }
        
        if (!searchBox.value.length) {
            chromeTabModule.loadChromeExtension();
        }
    }

    function hideTabList() {
        let chromeTab = document.getElementsByClassName('chrome-tab');
            
            if (chromeTab[0].classList.contains('show')) {
                chromeTab[0].classList.remove('show');
            } else {
                chromeTabModule.getAllTabs(chromeTabModule.constructTabs);
                chromeTab[0].classList.add('show');
            }
    }
    
    const chromeTabModule = {
        
        allOpenedTabs: [],

        switchTab: (event) => {
            
            let selectedTab = {};

            Array.from(event.currentTarget.attributes)
            .forEach(data => {
                if (data.name !== 'class') {
                    selectedTab['tabId']
                        ? selectedTab['windowId'] = data.value
                        : selectedTab['tabId'] = data.value;
                }
            });

            chrome.extension.sendMessage({type: 'switchTab', selectedTab}, function() {});
            hideTabList();
        },
        
        getAllTabs: (callback) => {
            chrome.extension.sendMessage({type: 'getAllTabs'}, function(tabs) {
                chromeTabModule.allOpenedTabs = tabs;
                callback(chromeTabModule.allOpenedTabs);
            });
        },
        
        loadChromeExtension: () => {
            let element = document.createElement('div');
            element.innerHTML = CONFIG.BASIC_SWITCH_TAB_MARKUP;
            document.body.appendChild(element);
        },

        constructTabs: (tabs) => {
            let tabList;
            tabList = document.getElementById('open-tabs');

            while(tabList.firstChild) {
                tabList.removeChild(tabList.firstChild);
            }
            
            tabs.forEach((tab) => {
                let container = document.createElement('div');
                let list = document.createElement('li');
                let title = document.createElement('span');
                let icon = document.createElement('img');
                let favIconWrapper = document.createElement('span');

                container.setAttribute('class', 'tab-item-container');

                list.setAttribute('class', 'tab-item');
                list.setAttribute('data-tab-id', tab.id);
                list.setAttribute('data-window-id', tab.windowId);

                icon.setAttribute('src', tab.favIconUrl ? tab.favIconUrl : CONFIG.DEFAULT_FAVICON);
                icon.setAttribute('class', 'fav-icon');
                
                title.setAttribute('class', 'tab-title');
                title.innerHTML = `${tab.title}`;
                
                list.appendChild(container);
                favIconWrapper.appendChild(icon);
                container.appendChild(favIconWrapper);
                container.appendChild(title);

                tabList.appendChild(list);

                // TODO: adding event listener for all tab-item for switching
                list.addEventListener('click', chromeTabModule.switchTab);
            });

            let searchBox = document.getElementById('chrome-tab-search');
            searchBox.addEventListener('keyup', filterTabs);
        },

        shareTab: (mediaName, tabId) => {},
    };
    
    chromeTabModule.loadChromeExtension();
})();
