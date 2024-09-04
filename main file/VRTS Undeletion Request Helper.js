// ==UserScript==
// @name         VRTS Undeletion Request Helper
// @description  A script to request undeletion of files on Wikimedia Commons, available only for VRT permissions agents.
// @match        https://commons.wikimedia.org/wiki/*
// @grant        none
// ==/UserScript==

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
            var requestText = `== [[:${fileName}]] ==\n*[[File:Permission logo 2021.svg|26px|link=|VRTS]] Please restore the file for permission verification for [[Ticket:${ticketNumber}]].~~~~`;

            // Format the edit summary
            var editSummary = `Requesting undeletion of [[:${fileName}]] based on VRTS permission (Ticket: ${ticketNumber}).`;

            // Redirect to the undeletion request page with the preloaded request text and edit summary
            var url = '/wiki/Commons:Undeletion_requests';
            var editPageUrl = `${url}?action=edit&preloadtitle=${encodeURIComponent(fileName)}&preload=Template:Undeletion_request&preloadparams=${encodeURIComponent(requestText)}&summary=${encodeURIComponent(editSummary)}`;
            window.location.href = editPageUrl;
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
