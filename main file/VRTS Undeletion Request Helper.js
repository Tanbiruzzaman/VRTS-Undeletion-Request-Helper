// VRTS Undeletion Request Helper
// A script to request undeletion of files on Wikimedia Commons, available only for VRT permissions agents.
// https://commons.wikimedia.org/wiki/*
// Imported from: https://github.com/Tanbiruzzaman/VRTS-Undeletion-Request-Helper/

(function() {
    'use strict';

    // Function to check if the user is in the "vrt-permissions" global group
    function isVRTAgent() {
        var userGroups = mw.config.get('wgUserGroups');
        return userGroups.includes('vrt-permissions');
    }

    // Function to prompt the user for input
    function requestUndeletion() {
        // Prompt user for file name and ticket number
        var fileName = prompt('Enter the file name (e.g., File:Example.jpg):');
        var ticketNumber = prompt('Enter the VRTS ticket number:');

        // Ensure both file name and ticket number are provided
        if (fileName && ticketNumber) {
            // Format the undeletion request
            var requestText = `== [[:${fileName}]] ==\n*[[File:Permission logo 2021.svg|26px|link=|VRTS]] Please restore the file for permission verification for [[Ticket:${ticketNumber}]].~~~~\n`;

            // Format the edit summary
            var editSummary = `Requesting undeletion of [[:${fileName}]] based on VRTS permission (Ticket: ${ticketNumber}).`;

            // Fetch the current content of the page
            var pageTitle = 'Commons:Undeletion_requests/Current_requests';
            var apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&titles=${encodeURIComponent(pageTitle)}&rvprop=content&format=json`;

            GM_xmlhttpRequest({
                method: 'GET',
                url: apiUrl,
                onload: function(response) {
                    var data = JSON.parse(response.responseText);
                    var page = data.query.pages[Object.keys(data.query.pages)[0]];
                    var existingContent = page.revisions[0]['*'];
                    var newContent = existingContent + requestText;

                    // Prepare the API request to save the updated content
                    var csrfUrl = 'https://commons.wikimedia.org/w/api.php?action=query&meta=tokens&type=edit&format=json';
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: csrfUrl,
                        onload: function(csrfResponse) {
                            var csrfData = JSON.parse(csrfResponse.responseText);
                            var csrfToken = csrfData.query.tokens.csrftoken;
                            var editUrl = 'https://commons.wikimedia.org/w/api.php';
                            var editData = {
                                action: 'edit',
                                title: pageTitle,
                                text: newContent,
                                summary: editSummary,
                                token: csrfToken,
                                format: 'json'
                            };

                            GM_xmlhttpRequest({
                                method: 'POST',
                                url: editUrl,
                                data: $.param(editData),
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                onload: function(editResponse) {
                                    var result = JSON.parse(editResponse.responseText);
                                    if (result.edit && result.edit.result === 'Success') {
                                        // Construct the thank you message with a link to the request
                                        var requestSection = encodeURIComponent(`[[:${fileName}]]`);
                                        var thankYouMessage = `Undeleting request submitted (see the request [https://commons.wikimedia.org/wiki/${pageTitle}#${requestSection}]).`;
                                        alert(thankYouMessage);
                                    } else {
                                        alert('Error adding the undeletion request.');
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } else {
            alert('File name and ticket number are required!');
        }
    }

    // Add a button to the interface for triggering the script
    function addButton() {
        var toolbar = document.querySelector('#p-cactions > .vector-menu-content');
        if (toolbar) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.textContent = 'Request Undeletion';
            a.style.cursor = 'pointer';
            a.addEventListener('click', requestUndeletion);
            li.appendChild(a);
            toolbar.appendChild(li);
        }
    }

    // Only add the button if the user is in the "VRT permissions agents" group
    if (isVRTAgent()) {
        addButton();
    } else {
        console.log('VRTS Undeletion Request Helper is only available for VRT permissions agents.');
    }
})();
