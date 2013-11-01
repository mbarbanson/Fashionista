/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by 3PM Revolution. All rights reserved.
 */

(function () {
	'use strict';

function loginCallback() {
	var acs = require('lib/acs'),
		Flurry = require('sg.flurry'),
		ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
		
	// if a user has successfully logged in or signed up
	if (acs.currentUser()) {	
		try {
			Ti.API.info("loginCallback");
			// hide guest tabgroup
			if (Ti.App.guestTabGroup) {
				Ti.App.guestTabGroup.close();					
			}
			ApplicationTabGroup.initAppUI();
		}				
		catch (ex) {
			Ti.API.info("Caught exception " + ex.message);
		}
	}
}


function createLoginToolbar() {
	var signup, login, toolbar, flexSpace,
		getContainingTab = function () {
			var tab = null;
			if (Ti.App.guestTabGroup) {
				tab = Ti.App.guestTabGroup.getActiveTab();
			}
			return tab;
		};


    flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });	
	signup = Ti.UI.createButton({
        title: Ti.Locale.getString('signup'),
		font: {
			fontFamily: Ti.App.defaultFontFamily,
			fontWeight: 'normal'
		},        
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
        color: 'blue',  //Ti.Locale.getString('themeColor')
        backgroundColor: Ti.Locale.getString('themeColor')
    });
    
    login = Ti.UI.createButton({
        title: Ti.Locale.getString('login'),
		font: {
			fontFamily: Ti.App.defaultFontFamily,
			fontWeight: 'normal'
		},        
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
        color: 'blue',  //Ti.Locale.getString('themeColor')
        backgroundColor: Ti.Locale.getString('themeColor')
    });
    
    toolbar = Titanium.UI.iOS.createToolbar({
        items: [flexSpace, login, flexSpace, signup, flexSpace],
        bottom:0,
        borderTop:true,
		barColor: Ti.Locale.getString('themeColor'),
        borderBottom:false,
        translucent: false
    });
 
    
    signup.addEventListener('click', function(e){
		var Flurry = require('sg.flurry'),
			LoginWindow = require('ui/common/LoginWindow'),
			tab = getContainingTab();
		if (tab) {
			tab.open(LoginWindow.createLoginWindow('signup', loginCallback, tab));
			}
		Flurry.logEvent('SignupClick', { 'button': "signupButton" });        
    });
	 
    login.addEventListener('click', function(e){
		var Flurry = require('sg.flurry'),
			LoginWindow = require('ui/common/LoginWindow'),
			tab = getContainingTab();
		if (tab) {
			tab.open(LoginWindow.createLoginWindow('login', loginCallback, tab));
			}
		Flurry.logEvent('LoginClick', { 'button': "loginButton" });        
    });
    
    return toolbar; 
}	


exports.createLoginToolbar = createLoginToolbar;

} ());