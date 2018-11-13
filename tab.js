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
                <ul id="open-tabs" class="tab-list"></ul>
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

    /**
     * Listener for background scripts
     */
    chrome.runtime.onMessage.addListener(function(req, sender, senderResponse) {
        console.log('test');
        if (req === 'toggle-feature-foo') {
            let chromeTab = document.getElementsByClassName('chrome-tab');
            chromeTab[0].classList.contains('show')
                ? chromeTab[0].classList.remove('show')
                : chromeTab[0].classList.add('show');
            senderResponse(`${sender.id} Received the command`);
        }
    });
    
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
        },
        
        getAllTabs: (callback) => {
            chrome.extension.sendMessage({type: 'getAllTabs'}, function(tabs) {
                chromeTabModule.allOpenedTabs = tabs;
                callback(chromeTabModule.allOpenedTabs);
            });
        },
        
        loadChromeExtension: () => {
            chromeTabModule.getAllTabs(chromeTabModule.constructTabs);
        },

        constructTabs: (tabs) => {
            let element = document.createElement('div');
            let tabList;

            chromeTabModule.allOpenedTabs = tabs;
            
            element.innerHTML = CONFIG.BASIC_SWITCH_TAB_MARKUP;
            document.body.appendChild(element);

            tabList = document.getElementById('open-tabs');
            
            tabs.forEach((tab, index) => {
                let list = document.createElement('li');
                let title = document.createElement('span');
                let icon = document.createElement('img');
                let favIconWrapper = document.createElement('span');

                list.setAttribute('class', 'tab-item');
                list.setAttribute('data-tab-id', tab.id);
                list.setAttribute('data-window-id', tab.windowId);

                icon.setAttribute('src', tab.favIconUrl ? tab.favIconUrl : CONFIG.DEFAULT_FAVICON);
                icon.setAttribute('class', 'fav-icon');
                title.setAttribute('class', 'tab-title');

                title.innerHTML = tab.title;
                
                favIconWrapper.appendChild(icon);
                list.appendChild(favIconWrapper);
                list.appendChild(title);
                
                tabList.appendChild(list);

                // TODO: adding event listener for all tab-item for switching
                list.addEventListener('click', chromeTabModule.switchTab);
            });
        },

        bookmarkTab: (tabId) => {},

        shareTab: (mediaName, tabId) => {},
    };
    
    chromeTabModule.loadChromeExtension();
})();
