/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

// This is a single context application with mutliple windows in a stack
(function() {
	"use strict";
	//determine platform and form factor and render approproate components
	var acs = require('lib/acs'),
		Cloud = require('ti.cloud'),
		osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth,
		isTablet = false,
		rootWindow = null,
		sessionId,
		accessToken,
		GuestWindow = require('ui/common/GuestWindow'),
		showGuestWindow,
		AppWindow,
		ApplicationTabGroup,
		tabGroup,
		FB, authCB, logoutCB;
		
	showGuestWindow = function () {
		// no user logged in previously, prompt user to login or sign up
		GuestWindow.createGuestWindow(rootWindow);
		//rootWindow.open();
	};
	
	Ti.API.info("Fashionista has started. Garez vous des voitures!");	
	
	isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	if (isTablet) {
		AppWindow = require('ui/tablet/ApplicationWindow');
	}
	else {
		AppWindow = require('ui/handheld/ApplicationWindow');
		Ti.UI.iPhone.hideStatusBar();
	}
	Cloud.debug = true;
	rootWindow = AppWindow.createApplicationWindow(L('Fashionista'));
			
    // Check here whether there is a logged in user
	try {	
		//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
		//yourself what you consider a tablet form factor for android	
		sessionId = Ti.App.Properties.getString('sessionId');
		Ti.API.info("Check whether we have a stored sessionId " + sessionId + " Cloud.sessionId " + Cloud.sessionId);
		Cloud.sessionId = sessionId;
		if (!sessionId) {
			Ti.API.info("no stored session " + sessionId);
		    showGuestWindow();			
		}
		// should not be able to get here without logging in
		else {
			Ti.API.info("found stored session " + sessionId);
			// we have a stored user token, retrieve the current user
			Cloud.Users.showMe(function (e) {
		        if (e.success) {
		            var user = e.users[0];
		            Ti.API.info('Retrieved current user:\\n' +
		                'id: ' + user.id + '\\n' +
		                'first name: ' + user.first_name + '\\n' +
		                'last name: ' + user.last_name + '\\n');
		            acs.setCurrentUser(user);
					acs.setIsLoggedIn(true);
										
					ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
					tabGroup = ApplicationTabGroup.createApplicationTabGroup(rootWindow);
					ApplicationTabGroup.addMainWindowTabs(rootWindow, tabGroup);
					ApplicationTabGroup.setDefaultActiveTab(tabGroup);
					tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.NONE});

		        } else {
		            alert('Error:\\n' +
		                ((e.error && e.message) || JSON.stringify(e)));
		        }
			});
		}
		
		//facebook integration
		FB = require('lib/facebook');
		authCB = function () { 
			Ti.API.info ("facebook authorize callback"); 
		};
		logoutCB = function () { 
			Ti.API.info ("facebook logout callback"); 
		};
		Ti.API.info("initializing social integration");
		FB.initSocialIntegration(authCB, logoutCB);
	}
	catch (e)
	{
		Ti.API.info("Exception caught" + e.Message);
	}

	Ti.API.info("Fashionista is rolling...");
}) ();
