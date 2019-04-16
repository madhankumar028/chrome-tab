/**
 * Browser-tabs
 * 
 * Open source browser extension
 * Naviagte to opened tabs like your favourite editor or IDE
 * 
 * @author: Madhankumar<madhankumar028@gmail.com>
 */
(function () {

    'use strict';

    const
        VK_UP = 38,
        VK_DOWN = 40,
        VK_ESC = 27,
        VK_TAB = 13;

    const element = document.createElement('div');
    const shadow = element.attachShadow({
        mode: 'open'
    }); // shadowdom
    const inputElement = document.createElement('input');
    const tabList = document.createElement('div');

    // all the app level constants are configured inside the configure object
    const CONFIG = {

        DEFAULT_FAVICON: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII=',

        BASIC_SWITCH_TAB_MARKUP: `
            <input class="search-box" type="search" id="chrome-tab-search">
            <div id="open-tabs" class="container madhan-tab-item"></div>
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
                display: -webkit-flex;
                -webkit-flex-flow: row wrap;
                display: flex;
                flex-flow: row wrap;
                max-height: 70vh;
                flex: 1;
                overflow: auto;
            }
            .tab-item {
                margin: 0px;
                padding: 10px;
                display: flex;
            }
            .tab-item:hover {
                cursor:pointer;
                background: #9e999921;
            }
            .tab-item_icon {
                width: 20px;
                height: 20px;
                display: block;
                margin-right: 8px;
            }
            .tab-item_name {
                text-align: left;
                flex: 1;
                font-size: 16px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                margin: 0;
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
    chrome.runtime.onMessage.addListener(function (req, sender, senderResponse) {
        if (req === 'toggle-feature-foo') {
            toggleTabList();
            senderResponse(`${sender.id} Received the command`);
        }
    });

    /**
     * filter tabs based on the user search
     * TODO: Group tabs based on sites
     * @param {event} event 
     */
    function filterTabs(event) {
        let userInput = event.currentTarget.value;
        let matchedTabs = [];

        if (userInput.length) {
            matchedTabs = chromeTabModule.allOpenedTabs.filter(function (tab, index) {
                if (
                    (tab.title.toLowerCase().includes(userInput.toLowerCase()) ||
                        tab.url.toLowerCase().includes(userInput.toLowerCase())
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
        inputElement.setAttribute('class', 'search-box');
        inputElement.setAttribute('placeholder', 'Search opened tabs');
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
        let chromeTab = document.querySelector('.chrome-tab-switch');

        if (chromeTab.classList.contains('show')) {
            chromeTab.classList.remove('show');
        } else {
            chromeTabModule.getAllTabs(chromeTabModule.constructTabs);
            chromeTab.classList.add('show');
            inputElement.focus();
            inputElement.value = ''; // clearing the input field while hiding the tab-item
        }
    }

    /**
     * Handles the 'esc' key
     * @param {event} event 
     */
    function keyHandler(event) {
        if ((event.keyCode || event.which) === VK_ESC) {
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
                        selectedTab['tabId'] ?
                            selectedTab['windowId'] = data.value :
                            selectedTab['tabId'] = data.value;
                    }
                });
            if (event.keyCode === VK_TAB || event.which === VK_TAB || event.type === "click") {
                chrome.extension.sendMessage({
                    type: 'switchTab',
                    selectedTab
                }, function () {});
                toggleTabList();
            }
        },

        /**
         * gets all the opened tabs
         */
        getAllTabs: (callback) => {
            chrome.extension.sendMessage({
                type: 'getAllTabs'
            }, function (tabs) {
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

            if (tabs.length) {
                let tabItemsHTML = "";
                tabs.forEach((tab, index) => {

                    tabItemsHTML += `
                        <div class="tab-item" data-tab-id="${tab.id}" data-window-id="${tab.windowId}" title="${tab.title}" tabindex="0">
                            <img class="tab-item_icon" src="${tab.favIconUrl ? tab.favIconUrl : CONFIG.DEFAULT_FAVICON}">
                            <p class="tab-item_name">${tab.title}</p>
                        </div>
                    `;

                });
                tabList.innerHTML = tabItemsHTML;
                tabList.querySelectorAll('.tab-item').forEach((tabitem) => {
                    tabitem.addEventListener('click', chromeTabModule.switchTab);
                    tabitem.addEventListener('keyup', chromeTabModule.switchTab);
                });
            }
            document.addEventListener('keyup', keyHandler);
        },

        shareTab: (mediaName, tabId) => {},
    };

    chromeTabModule.loadChromeExtension();
})();
