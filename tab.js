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

    const element       = document.createElement('div');
    const shadow        = element.attachShadow({mode: 'open'}); // shadowdom
    const inputElement  = document.createElement('input');
    const tabList       = document.createElement('ul');

    // all the app level constants are configured inside the configure object
    const CONFIG = {
        
        DEFAULT_FAVICON: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII=',

        BASIC_SWITCH_TAB_MARKUP : `
            <input class="search-box" type="search" id="chrome-tab-search">
            <ul id="open-tabs" class="tab-list madhan-tab-list"></ul>
        `,

        style: `
        <style type="text/css">
            .search-box {
                font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
                padding: 10px 10px;
                font-size: 14px;
                color: #3b4045;
                background: #FFF;
                border: 1px solid #c8ccd0;
                width: 100%;
                box-sizing: border-box;
            }
            
            .fav-icon {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                vertical-align: middle;
            }
            
            .tab-title {
                font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
                margin-left: 10px;
                font-size: 15px;
            }
            
            .tab-list {
                margin: 10px 0;
                height: 400px;
                overflow: auto;
                padding: 0;
            }
            
            .tab-list::-webkit-scrollbar {
                width: 6px;
                background-color: #F5F5F5;
            }
            
            .tab-item-container {
                padding: 8px;
            }
            
            .tab-item {
                height: 40px;
                padding: 10px 0;
                list-style: none;
                margin-bottom: 10px;
            }
            
            .tab-item:nth-child(even) {
                background: #ffffff;
            }
            
            .tab-item:nth-child(odd) {
                background: #f3f4f8;
            }
            
            .tab-item:hover {
                cursor: pointer;
                background: rgb(226, 234, 245);
            }

            .empty-state {
                height: 100px;
                text-align: center;
                opacity: 0.6;
            }
        </style>
        `
    };

    /**
     * Listener for background scripts
     */
    chrome.runtime.onMessage.addListener(function(req, sender, senderResponse) {
        if (req === 'toggle-feature-foo') {
            toggleTabList();
            senderResponse(`${sender.id} Received the command`);
        }
    });

    /**
     * filter tabs based on the user search
     * @param {event} event 
     */
    function filterTabs(event) {
        let userInput = event.currentTarget.value;
        let matchedTabs = [];

        if (userInput.length) {
            matchedTabs = chromeTabModule.allOpenedTabs.filter(function(tab, index) {
                if (
                    (tab.title.includes(userInput) 
                    || tab.url.includes(userInput)
                    )
                ) {
                    return tab;
                }
            });
            chromeTabModule.constructTabs(matchedTabs);
        } else {
            chromeTabModule.constructTabs(chromeTabModule.allOpenedTabs);
        }
    }

    /**
     * Initializes the app
     */
    function render() {
        shadow.innerHTML = CONFIG.style;
        element.setAttribute('id', 'tab-host');
        element.classList.add('chrome-tab-switch');
        document.body.appendChild(element);

        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('id', 'chrome-tab-search');
        inputElement.setAttribute('for', 'chrome-tab-search');
        inputElement.setAttribute('class', 'search-box');
        inputElement.addEventListener('keyup', filterTabs);

        tabList.setAttribute('id', 'open-tabs');
        tabList.setAttribute('class', 'tab-list');

        shadow.appendChild(inputElement);
        shadow.appendChild(tabList);
    }
    
    /**
     * toggles the tab list by hiding and showing
     */
    function toggleTabList() {
        let chromeTab = document.getElementsByClassName('chrome-tab-switch');

        if (chromeTab[0].classList.contains('show')) {
            chromeTab[0].classList.remove('show');
        } else {
            chromeTabModule.getAllTabs(chromeTabModule.constructTabs);
            chromeTab[0].classList.add('show');
            inputElement.focus();
            inputElement.value = ''; // clearing the input field while hiding the tab-list
        }
    }

    /**
     * Handles the 'esc' key
     * @param {event} event 
     */
    function keyHandler(event) {
        if ((event.keyCode || event.which) === 27) {
            toggleTabList();
        }
    }
    
    const chromeTabModule = {
        
        allOpenedTabs: [],
        
        /**
         * navigates the tab to corresponding user selection
         */
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
            toggleTabList();
        },
        
        /**
         * gets all the opened tabs
         */
        getAllTabs: (callback) => {
            chrome.extension.sendMessage({type: 'getAllTabs'}, function(tabs) {
                chromeTabModule.allOpenedTabs = tabs;
                callback(chromeTabModule.allOpenedTabs);
            });
        },
        
        /**
         * loads the extension
         */
        loadChromeExtension: () => {
            render();
        },
        
        /**
         * construct the all opened tabs in the list
         */
        constructTabs: (tabs) => {

            while(tabList.firstChild) {
                tabList.removeChild(tabList.firstChild);
            }
            if (tabs.length) {
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
    
                    list.addEventListener('click', chromeTabModule.switchTab);
                });
            }
            document.addEventListener('keyup', keyHandler);
        },

        shareTab: (mediaName, tabId) => {},
    };
    
    chromeTabModule.loadChromeExtension();
})();
