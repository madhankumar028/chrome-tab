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
    const tabList       = document.createElement('div');

    // all the app level constants are configured inside the configure object
    const CONFIG = {
        
        DEFAULT_FAVICON: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII=',

        BASIC_SWITCH_TAB_MARKUP : `
            <input class="search-box" type="search" id="chrome-tab-search">
            <div id="open-tabs" class="container madhan-tab-list"></div>
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
            
            .container {
                display: flex;
                -webkit-flex-flow: row wrap;
                max-height: 70vh;
                overflow: auto;
              }
              .tab-list {
                margin: 0px;
                padding: 10px;
              }
              .tab-list:hover {
                cursor:pointer;
                background: #9e999921;
              }
              .img-container {
                background:#f7f7f7;
                margin: 0 auto;
                height:50px;
                width:50px;
                border-radius: 50%;
              }
              .img-container img {
                  width: 20px;
                  height: 20px;
                  display: block;
                  margin: 0 auto;
                  position: relative;
                  top: 25%;
              }
              .tab-name {
                  font-size: 16px;
                  width: 200px;
                  overflow: hidden;
                  text-align: center;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  margin-top: 20px;
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
        tabList.setAttribute('class', 'container');

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
                    let list        = document.createElement('div');
                    let figure      = document.createElement('figure');
                    let icon        = document.createElement('img');
                    let tabName     = document.createElement('p');
    
                    list.setAttribute('class', 'tab-list');
                    list.setAttribute('data-tab-id', tab.id);
                    list.setAttribute('data-window-id', tab.windowId);
    
                    icon.setAttribute('src', tab.favIconUrl ? tab.favIconUrl : CONFIG.DEFAULT_FAVICON);
                    
                    tabName.setAttribute('class', 'tab-name');
                    figure.setAttribute('class', 'img-container');
                    tabName.innerHTML = `${tab.title}`;
                    
                    list.appendChild(figure);
                    figure.appendChild(icon);
                    list.appendChild(tabName);
    
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
