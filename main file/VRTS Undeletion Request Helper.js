// VRTS Undeletion Request Helper
// A script to request undeletion of files on Wikimedia Commons, available only for VRT permissions agents.
// https://commons.wikimedia.org/wiki/*
// Imported from: https://github.com/Tanbiruzzaman/VRTS-Undeletion-Request-Helper/
// Commons: https://commons.wikimedia.org/wiki/User:Tanbiruzzaman/VRTS_Undeletion_Request_Helper

(function() {
    'use strict';

    // Function to check if the user is a member of the vrt-permissions global group
    function checkGlobalUserGroup(callback) {
        mw.loader.using(['mediawiki.api'], function() {
            if ($.inArray('vrt-permissions', mw.config.get('wgGlobalGroups')) > -1 || $.inArray('sysop', mw.config.get('wgUserGroups')) > -1) {
                callback(true);
            } else {
                new mw.Api().get({
                    meta: 'globaluserinfo',
                    guiuser: mw.config.get('wgUserName'),
                    guiprop: 'groups'
                }).done(function(data) {
                    var userGroups = data.query.globaluserinfo.groups;
                    var isMember = $.inArray('vrt-permissions', userGroups) > -1;
                    callback(isMember);
                }).fail(function() {
                    console.error('API request failed');
                    callback(false);
                });
            }
        });
    }

    // Function to prompt the user for input and submit the request
    function requestUndeletion() {
        // Prompt user for file name and ticket number
        var fileName = prompt('Enter the file name (e.g., File:Example.jpg):');
        if (!fileName) {
            alert('File name is required!');
            return;
        }

        var ticketNumber = prompt('Enter the VRTS ticket number:');
        if (!ticketNumber) {
            alert('Ticket number is required!');
            return;
        }

        console.log('File Name:', fileName);
        console.log('Ticket Number:', ticketNumber);

        // Format the undeletion request with ~~~~ for signature and timestamp
        var requestText = `\n== [[:${fileName}]] ==\n*[[File:Permission logo 2021.svg|26px|link=|VRTS]] Please restore the file for permission verification for [[Ticket:${ticketNumber}]]. ~~~~\n`;

        // Format the edit summary with VRTURH link
        var editSummary = `Requesting undeletion of [[:${fileName}]] based on VRTS permission (Ticket: ${ticketNumber}). ([[User:Tanbiruzzaman/VRTS Undeletion Request Helper|VRTURH]])`;

        var pageTitle = 'Commons:Undeletion_requests/Current_requests';

        // Make a request to get the CSRF token
        new mw.Api().get({
            action: 'query',
            meta: 'tokens',
            type: 'csrf'
        }).done(function(data) {
            var csrfToken = data.query.tokens.csrftoken;

            // Make the edit request to update the undeletion request page
            new mw.Api().postWithToken('csrf', {
                action: 'edit',
                title: pageTitle,
                appendtext: requestText,
                summary: editSummary
            }).done(function() {
                // Success message with link to the undeletion request
                var requestSection = encodeURIComponent(`[[:${fileName}]]`);
                var thankYouMessage = `Undeleting request submitted (see the request [https://commons.wikimedia.org/wiki/${pageTitle}#${requestSection}]).`;
                alert(thankYouMessage);
            }).fail(function() {
                alert('Failed to submit the undeletion request.');
            });
        }).fail(function() {
            alert('Failed to get CSRF token.');
        });
    }

    // Add a button to the interface for triggering the script
    function addButton() {
        checkGlobalUserGroup(function(isMember) {
            if (isMember) {
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
            } else {
                console.log('User is not a member of the vrt-permissions group.');
            }
        });
    }

    // Load the button on the page
    mw.loader.using(['mediawiki.api'], addButton);

})();
