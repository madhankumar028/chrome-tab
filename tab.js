/**
 * Browser-tabs
 *
 * Open source browser extension
 * Naviagte to opened tabs like your favourite editor or IDE
 *
 * @author: Madhankumar<madhankumar028@gmail.com>
 */
(function () {
  "use strict";

  const VK_UP = 38;
  const VK_DOWN = 40;
  const VK_ESC = 27;
  const VK_TAB = 13;

  const element = document.createElement("div");
  const shadow = element.attachShadow({
    mode: "open",
  }); // shadowdom
  const inputElement = document.createElement("input");
  const tabList = document.createElement("div");

  const CONFIG = {
    DEFAULT_FAVICON:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII=",

		BASIC_SWITCH_TAB_MARKUP: `
			<div class="search__container">
				<input class="search-box" type="search" id="chrome-tab-search">
			</div>
			<div id="open-tabs" class="container"></div>
			<div class="attributes__block"></div>
    `,

    style: `
			<style type="text/css">
				.search-box {
					font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
					padding: 10px 16px;
					font-size: 14px;
					color: #fff;
					width: 100%;
					box-sizing: border-box;
					background: #1b1d2e;
					border: none;
					border-radius: 16px;
				}
				.search-box:focus {
					border: none;
					outline: none;
					box-shadow: 0 2px 4px 0 #1b1d2e;
				}
				
				.container {
					display: -webkit-flex;
					-webkit-flex-flow: row wrap;
					display: flex;
					flex-flow: row wrap;
					max-height: 70vh;
					flex: 1;
					overflow: auto;
					margin-top: 10px;
				}
				.tab-item {
					margin: 0px;
					padding: 10px;
					display: flex;
					width: 100%;
					margin-bottom: 12px;
				}
				.tab-item:hover {
					cursor:pointer;
					background: #9e999921;
					border-radius: 16px;
				}
				.tab-item_icon {
					width: 20px;
					height: 20px;
					display: block;
					margin-right: 16px;
				}
				.tab-item_name {
					flex: 1;
					font-size: 15px;
					text-align: left;
					margin: 0;
					white-space: nowrap;
					max-width: 80%;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.tab-item_name:hover {
					color: #fff;
				}
				.empty-state {
					height: 100px;
					text-align: center;
					opacity: 0.6;
				}
			</style>
		`,
  };

  /**
   * Listener for background scripts
   */
  chrome.runtime.onMessage.addListener(function (req, sender, senderResponse) {
    if (req === "toggle-feature-foo") {
      toggleTabList(false);
      senderResponse(`${sender.id} Received the command`);
    }
  });

  function filterTabs(event) {
    let userInput = event.currentTarget.value;
    let matchedTabs = [];

    if (userInput.length) {
      matchedTabs = chromeTabsManager.allOpenedTabs.filter(function (tab, index) {
        if (
          tab.title.toLowerCase().includes(userInput.toLowerCase()) ||
          tab.url.toLowerCase().includes(userInput.toLowerCase())
        ) {
          return tab;
        }
      });
      chromeTabsManager.constructTabs(matchedTabs);
    } else {
      chromeTabsManager.constructTabs(chromeTabsManager.allOpenedTabs);
    }
  }

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

  function toggleTabList(stopToggle) {
		let chromeTab = document.querySelector(".chrome-tab-switch");
		
		if (stopToggle) {
      chromeTab.classList.remove("show");
			return;
		} else {
			chromeTabsManager.getAllTabs(chromeTabsManager.constructTabs);
			chromeTab.classList.add("show");
			inputElement.focus();
			inputElement.value = ""; // clearing the input field while hiding the tab-item
		}
  }

  function keyHandler(event) {
    if ((event.keyCode || event.which) === VK_ESC) {
			toggleTabList(element.classList.contains('show'))
    }
  }

  const chromeTabsManager = {
    allOpenedTabs: [],

    switchTab: (event) => {
      let selectedTab = {};

      Array.from(event.currentTarget.attributes).forEach((data) => {
        if (data.name !== "class") {
          selectedTab["tabId"]
            ? (selectedTab["windowId"] = data.value)
            : (selectedTab["tabId"] = data.value);
        }
      });
      if (
        event.keyCode === VK_TAB ||
        event.which === VK_TAB ||
        event.type === "click"
      ) {
        chrome.extension.sendMessage(
          {
            type: "switchTab",
            selectedTab,
          },
          function () {}
        );
        toggleTabList(false);
      }
    },

    getAllTabs: (callback) => {
      chrome.extension.sendMessage(
        {
          type: "getAllTabs",
        },
        function (tabs) {
          chromeTabsManager.allOpenedTabs = tabs;
          callback(chromeTabsManager.allOpenedTabs);
        }
      );
    },

    loadChromeExtension: () => {
      render();
    },

    constructTabs: (tabs) => {
      if (tabs.length) {
        let tabItemsHTML = "";
        tabs.forEach((tab, index) => {
          tabItemsHTML += `
						<div
							class="tab-item"
							data-tab-id="${tab.id}"
							data-window-id="${tab.windowId}"
							title="${tab.title}"
							tabindex="0"
						>
							<img class="tab-item_icon" src="${
								tab.favIconUrl
									? tab.favIconUrl
									: CONFIG.DEFAULT_FAVICON
							}">
							<p class="tab-item_name">${tab.title}</p>
						</div>
					`;
        });
        tabList.innerHTML = tabItemsHTML;
        tabList.querySelectorAll(".tab-item").forEach((tabitem) => {
          tabitem.addEventListener("click", chromeTabsManager.switchTab);
          tabitem.addEventListener("keyup", chromeTabsManager.switchTab);
        });
      }
      document.addEventListener("keyup", keyHandler);
    },

    shareTab: (mediaName, tabId) => {},
  };

  chromeTabsManager.loadChromeExtension();
})();
