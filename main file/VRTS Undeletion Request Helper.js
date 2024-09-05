// VRTS Undeletion Request Helper
// A script to request undeletion of files on Wikimedia Commons, available only for VRT permissions agents.
// https://commons.wikimedia.org/wiki/*
// Imported from: https://github.com/Tanbiruzzaman/VRTS-Undeletion-Request-Helper/

(function() {
    'use strict';

    // Function to dynamically load jQuery
    function loadjQuery(callback) {
        var script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Function to prompt the user for input
    function requestUndeletion() {
        // Prompt user for file name and ticket number
        var fileName = prompt('Enter the file name (e.g., File:Example.jpg):');
        var ticketNumber = prompt('Enter the VRTS ticket number:');

        // Ensure both file name and ticket number are provided
        if (fileName && ticketNumber) {
            // Format the undeletion request
            var requestText = `== [[:${fileName}]] ==\n*[[File:Permission logo 2021.svg|26px|link=|VRTS]] Please restore the file for permission verification for [[Ticket:${ticketNumber}]].–[[User:Tanbiruzzaman|'''<span style="color:darkgrey;font-family:monospace">TANBIRUZZAMAN</span>''']] ([[User talk:Tanbiruzzaman|&#128172;]]) 00:18, 5 September 2024 (UTC)\n`;

            // Format the edit summary
            var editSummary = `Requesting undeletion of [[:${fileName}]] based on VRTS permission (Ticket: ${ticketNumber}).`;

            // Fetch the current content of the page
            var pageTitle = 'Commons:Undeletion_requests/Current_requests';
            var apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&titles=${encodeURIComponent(pageTitle)}&rvprop=content&format=json`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    var page = data.query.pages[Object.keys(data.query.pages)[0]];
                    var existingContent = page.revisions[0]['*'];
                    var newContent = existingContent + requestText;

                    // Prepare the API request to save the updated content
                    var csrfUrl = 'https://commons.wikimedia.org/w/api.php?action=query&meta=tokens&type=edit&format=json';
                    return fetch(csrfUrl)
                        .then(response => response.json())
                        .then(csrfData => {
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

                            return fetch(editUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: $.param(editData)
                            });
                        })
                        .then(editResponse => editResponse.json())
                        .then(result => {
                            if (result.edit && result.edit.result === 'Success') {
                                // Construct the thank you message with a link to the request
                                var requestSection = encodeURIComponent(`[[:${fileName}]]`);
                                var thankYouMessage = `Undeleting request submitted (see the request [https://commons.wikimedia.org/wiki/${pageTitle}#${requestSection}]).`;
                                alert(thankYouMessage);
                            } else {
                                alert('Error adding the undeletion request.');
                            }
                        });
                })
                .catch(error => {
                    alert('Error occurred: ' + error.message);
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

    // Load jQuery and then add the button
    loadjQuery(addButton);
})();
