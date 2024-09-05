// importedfrom https://github.com/Tanbiruzzaman/VRTS-Undeletion-Request-Helper/
// name         VRTS Undeletion Request Helper
// namespace    User:Tanbiruzzaman
// version      1.0
// description  A script to request undeletion of files on Wikimedia Commons, available only for VRT permissions agents.
// author       Tanbiruzzaman
// match        https://commons.wikimedia.org/wiki/Commons:Undeletion_requests/Current_requests
// grant        mw.Api
// grant        mw.loader.using
// grant        mw.user.options.get
// require      https://code.jquery.com/jquery-3.6.0.min.js
// commons      https://commons.wikimedia.org/wiki/User:Tanbiruzzaman/VRTS_Undeletion_Request_Helper

(function() {
    'use strict';

    function checkUserGroup(callback) {
        mw.loader.using('mediawiki.api', function() {
            new mw.Api().get({
                meta: 'globaluserinfo',
                guiuser: mw.config.get('wgUserName'),
                guiprop: 'groups'
            }).done(function(data) {
                var userGroups = data.query.globaluserinfo.groups;
                if (userGroups.includes('vrt-permissions')) {
                    callback(true);
                } else {
                    alert('You do not have the required permissions to use this script.');
                    callback(false);
                }
            }).fail(function() {
                alert('Failed to check user groups.');
                callback(false);
            });
        });
    }

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

        // Format the undeletion request with split ~~~~
        var requestText = `\n\n== [[:${fileName}]] ==\n*[[File:Permission logo 2021.svg|26px|link=|VRTS]] Please restore the file for permission verification for [[Ticket:${ticketNumber}]]. \n~~\n~~\n`;

        // Edit summary with VRTURH link
        var editSummary = `Requesting undeletion of [[:${fileName}]] based on VRTS permission (Ticket: ${ticketNumber}). ([[User:Tanbiruzzaman/VRTS Undeletion Request Helper|VRTURH]])`;

        var pageTitle = 'Commons:Undeletion_requests/Current_requests';

        // Get CSRF token
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

    // Check user group and add button if authorized
    checkUserGroup(function(isAuthorized) {
        if (isAuthorized) {
            // Add a button to the page to trigger the requestUndeletion function
            $(document).ready(function() {
                $('<button>')
                    .text('Request Undeletion')
                    .attr('id', 'requestUndeletionButton')
                    .on('click', requestUndeletion)
                    .appendTo('#p-cactions .bodyContent');
            });
        }
    });
})();
