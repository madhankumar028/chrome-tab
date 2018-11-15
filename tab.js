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
            <input class="search-box" type="search" id="chrome-tab-search">
            <ul id="open-tabs" class="tab-list madhan-tab-list"></ul>
        `,

        STYLES: `
            .chrome-tab-switch {
                display: none;
                position: fixed;
                top: 10vmin;
                right: 25vw;
                z-index: 9999999;
                background-color: #fff;
                width: 50vw;
                border: 1px solid #c7d1d6;
                padding: 10px;
                box-shadow: rgba(167, 162, 158, 0.7) 4px 4px 9px 0px;
            }
            
            .show {
                display: block;
            }
            
            .search-box {
                font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
                padding: 10px 0;
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
                padding: 10px;
            }
            
            .tab-item {
                height: 60px;
                padding: 10px 0;
                list-style: none;
                margin-top: 10px;
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
                border: 1px solid rgb(167, 164, 164);
                border-style: dotted;
            }
        `,
    };

    /**
     * Listener for background scripts
     */
    chrome.runtime.onMessage.addListener(function(req, sender, senderResponse) {
        // if (req === 'toggle-feature-foo') {
        //     hideTabList();
        //     senderResponse(`${sender.id} Received the command`);
        // }
        
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
    }

    function hideTabList() {
        let chromeTab = document.getElementsByClassName('chrome-tab-switch');
        let searchBox = document.getElementById('chrome-tab-search');
        if (chromeTab[0].classList.contains('show')) {
            chromeTab[0].classList.remove('show');
        } else {
            chromeTabModule.getAllTabs(chromeTabModule.constructTabs);
            chromeTab[0].classList.add('show');
            searchBox.focus();
        }
        searchBox.value = ''; // clearing the input field while hiding the tab-list
    }


    function createShadowRoot() {
        let element = document.createElement('div');
        
        let shadow = element.attachShadow({mode: 'open'});
        // let style = document.createElement('style');
        
        element.classList.add('chrome-tab-switch');
        
        // element.appendChild(style);
        document.body.appendChild(element);
    }

    function render() {
        console.log('shadow');
        createShadowRoot();
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
            render();
        },

        constructTabs: (tabs) => {
            let tabList = document.getElementById('open-tabs');

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
