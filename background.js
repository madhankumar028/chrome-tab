(function() {

    'use strict';

    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.insertCSS(tab.id, { file: "tab.css" });
        chrome.tabs.executeScript(tab.id, { file: "tab.js" });
    });

    /**
     * Listener for communicating to the scripts
     * inside the webpage
     */
    chrome.runtime.onMessage.addListener(function(request, sender, senderResponse) {
        let chromeExtensionMessageHandler = {
            /**
             * returns all the opened tabs in the chrome
             */
            getAllTabs: function(sender) {
                chrome.tabs.query({}, tabs => {
                    let filteredTabs = tabs.filter(tab => {
                        if (tab.id != sender.tab.id) {
                            return tab;
                        }
                    });
                    senderResponse(filteredTabs);
                });
                return true;
            }
        }

        return chromeExtensionMessageHandler[request.type](sender);
    });

})();
