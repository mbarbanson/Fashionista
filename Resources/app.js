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


//bootstrap and check dependencies
if (Ti.version < 2.0 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 2.0 or later');
}

// This is a single context application with multiple windows in a stack
(function() {
	"use strict";
	//determine platform and form factor and render approproate components
	var acs = require('lib/acs'),
		Cloud = require('ti.cloud'),
		FB = require('lib/facebook'),
		ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
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
		AppWindow;

	
	// test out logging to developer console, formatting and localization
	Ti.API.info(String.format("%s%s", L("welcome_message","default_not_set"),Titanium.version));
	Ti.API.debug(String.format("%s %s", L("user_agent_message","default_not_set"),Titanium.userAgent));
	
	Ti.API.debug(String.format("locale specific date is %s",String.formatDate(new Date()))); // default is short
	Ti.API.debug(String.format("locale specific date (medium) is %s",String.formatDate(new Date(),"medium")));
	Ti.API.debug(String.format("locale specific date (long) is %s",String.formatDate(new Date(),"long")));
	Ti.API.debug(String.format("locale specific time is %s",String.formatTime(new Date())));
	Ti.API.debug(String.format("locale specific currency is %s",String.formatCurrency(12.99)));
	Ti.API.debug(String.format("locale specific decimal is %s",String.formatDecimal(12.99)));
	
	
	Ti.API.info("should be en, was = "+Ti.Locale.currentLanguage);
	Ti.API.info("welcome_message = "+Ti.Locale.getString("welcome_message"));
	Ti.API.info("should be def, was = "+Ti.Locale.getString("welcome_message2","def"));
	Ti.API.info("should be 1, was = "+String.format('%d',1));

	Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
	Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
	Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
	Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
	
	Ti.App.SCREEN_WIDTH = (width > height) ? height : width;
	Ti.App.SCREEN_HEIGHT = (width > height) ? width : height;
	
	if(Ti.Platform.osname === 'android'){
	  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
	  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
	  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
	}
	
	// TODO: This is failing
	//Ti.API.info("should be 1.0, was = "+String.format('%1.1f',1));
	
	Ti.API.info("should be hello, was = "+String.format('%s','hello'));
			
	showGuestWindow = function () {
		// no user logged in previously, prompt user to login or sign up
		GuestWindow.createGuestWindow(rootWindow);
		//rootWindow.open();
	};
		
	isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	if (isTablet) {
		AppWindow = require('ui/tablet/ApplicationWindow');
	}
	else {
		AppWindow = require('ui/handheld/ApplicationWindow');
		if (Ti.Platform.name === 'iPhone OS') { 
			Ti.UI.iPhone.hideStatusBar(); 
			Ti.App.spinnerStyle = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
		}
	}
	Cloud.debug = true;
	
	Ti.App.photoSizes ={"thumbnail": [100,100], "iphone": [640,640], "android": [480,480]};
	
	rootWindow = AppWindow.createApplicationWindow(L('Fashionista'));
	
	// for now exit if device is offline
	if (!Ti.Network.online) {
		alert("Sorry - Fashionista requires an internet connection. Your device is offline. Please make sure you are connected to the internet, then exit and restart.");
		rootWindow.close();
	}
	else {
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
				// we have a stored user session, retrieve the current user	
				acs.getCurrentUserDetails(ApplicationTabGroup.initAppUI);
			}		
		}
		catch (e)
		{
			Ti.API.info("Exception caught" + e.Message);
		}
	
		Ti.API.info("Fashionista is running...");

		
	}
} ());
