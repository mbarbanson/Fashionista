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
			Flurry.logEvent('SucessfulSignupOrLogin');				
			if (!Ti.App.mainTabGroup) {
				ApplicationTabGroup.initAppUI();					
			}
			// hide guest tabgroup
			if (Ti.App.guestTabGroup) {
				Ti.App.guestTabGroup.close();
				Ti.App.guestTabGroup = null;					
			}
		}				
		catch (ex) {
			Ti.API.info("Caught exception " + ex.message);
		}
	}
}

function createLoginToolbar(containingTab) {
	var signup, login, toolbar, flexSpace,
		Flurry = require('sg.flurry'),
		LoginWindow = require('ui/common/LoginWindow');


    flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });	
	signup = Ti.UI.createButton({
        title: Ti.Locale.getString('signup'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
        backgroundColor: '#5D3879'
    });
    
    login = Ti.UI.createButton({
        title: Ti.Locale.getString('login'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
        backgroundColor: '#5D3879'
    });
    
    toolbar = Titanium.UI.iOS.createToolbar({
        items:[flexSpace, login, flexSpace, signup, flexSpace],
        bottom:0,
        borderTop:true,
        barColor: '#5D3879',
        borderBottom:false
    });
    
    signup.addEventListener('click', function(e){
        containingTab.open(LoginWindow.createLoginWindow('signup', loginCallback, containingTab));
		Flurry.logEvent('SignupClick', { 'button': "signupButton" });        
    });
	 
    login.addEventListener('click', function(e){
        containingTab.open(LoginWindow.createLoginWindow('login', loginCallback, containingTab));
		Flurry.logEvent('LoginClick', { 'button': "loginButton" });        
    });
    
    return toolbar; 
}	


exports.createLoginToolbar = createLoginToolbar;

} ());