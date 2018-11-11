/**
 * Background script
 * 
 * It has both the listeners, one will request content scripts and
 * another will respond to content scripts
 * 
 * @author: Madhankumar<madhankumar028@gmail.com>
 */

(function() {

    'use strict';

    /**
     * Listener for content scripts
     *
     */
    chrome.runtime.onMessage.addListener(function(request, sender, senderResponse) {
        let chromeExtensionMessageHandler = {
            
            /**
             * returns all the opened tabs in the chrome
             * by excluding the currently opened tab
             */
            getAllTabs: function() {
                chrome.tabs.query({}, tabs => {
                    let filteredTabs = tabs.filter(tab => {
                        if (!tab.active) {
                            return tab;
                        }
                    });
                    senderResponse(filteredTabs);
                });
                return true;
            },

            switchTab: function (tab) {
                chrome.tabs.update(tab.tabId, {active: true}, function() {
                    chrome.windows.update(tab.windowId, {focused: true});
                });

                return true;
            },
        }

        return chromeExtensionMessageHandler[request.type](request.selectedTab);
    });

    /**
     * Responder for background scripts
     */
    chrome.commands.onCommand.addListener(function(command) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, command, function(response) {
                console.info(response);
            });
        })
    });

})();
