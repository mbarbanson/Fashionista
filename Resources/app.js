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
		Flurry = require('sg.flurry'),
		FB = require('lib/facebook'),
		ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
		osname = Ti.Platform.osname,
		//version = Ti.Platform.version,
		//model = Ti.Platform.model,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth,
		isTablet = false,
		sessionId,
		accessToken,
		GuestWindow = require('ui/common/GuestWindow'),
		showGuestWindow,
		AppWindow,
		appKey = 'D82FTRKTYMS9SJKWHT6P';

	// new relic initialization
	require('ti.newrelic').start("AA8416ee1ec3cc6670dbf2be64791a3e7da1252222");
	
	// Flurry initialization
	Flurry.secureTransport(true); //use https to send request to make them more safe
	Flurry.logUncaughtExceptions(true); //logs exception in objective-c code
	Flurry.crashReportingEnabled(true); //enable crash reporting	
	Flurry.startSession(appKey);
	Flurry.setContinueSessionMillis(10000);
	Flurry.setReportLocation(true);
	Flurry.setUseHttps(true);
	Flurry.setCaptureUncaughtExceptions(true);		
	Flurry.reportOnClose = true;

	//Ti.API.info("Titanium version " + Ti.version);
	//Ti.API.info("App version " + Ti.App.version + "\n");
	//Ti.App.itunesLink = "https://itunes.apple.com/us/app/fashionist/id603194546";
	
	// test out logging to developer console, formatting and localization
	//Ti.API.info(String.format("%s %s", Ti.Locale.getString("welcome_message","default_not_set"), model));
	//Ti.API.debug(String.format("%s %s", Ti.Locale.getString("user_agent_message","default_not_set"),Titanium.userAgent));
	
	//Ti.API.debug(String.format("locale specific date is %s",String.formatDate(new Date()))); // default is short
	//Ti.API.debug(String.format("locale specific date (medium) is %s",String.formatDate(new Date(),"medium")));
	//Ti.API.debug(String.format("locale specific date (long) is %s",String.formatDate(new Date(),"long")));
	//Ti.API.debug(String.format("locale specific time is %s",String.formatTime(new Date())));
	//Ti.API.debug(String.format("locale specific currency is %s",String.formatCurrency(12.99)));
	//Ti.API.debug(String.format("locale specific decimal is %s",String.formatDecimal(12.99)));
	
	
	//Ti.API.info("should be en, was = "+Ti.Locale.currentLanguage);
	//Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
	//Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
	//Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
	//Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
	/*
	if (Ti.Platform.displayCaps.density === 'high') {
		Ti.App.pixelScaling = 2;
	}
	else {
		Ti.App.pixelScaling = 1;
	}
	*/
	Ti.App.SCREEN_WIDTH = (width > height) ? height : width;
	Ti.App.SCREEN_HEIGHT = (width > height) ? width : height;
	
	Ti.App.isInForeground = true;
 
	Ti.App.addEventListener('pause', function(){
	    Ti.App.isInForeground = false;
	});
	 

	Ti.App.addEventListener('significanttimechange', function() {
		Ti.App.fireEvent('refreshFeedWindow', {"reason": "significanttimechange"});
		Ti.App.fireEvent('refreshFindFeedWindow', {"reason": "significanttimechange"});
	});
	
	Ti.App.addEventListener('resume', function() {
		var appBadge = Ti.UI.iPhone.getAppBadge();
	    Ti.App.isInForeground = true;
	    if (appBadge > 0 ) {
			Ti.API.info("Fashionist resumed with appBadge " + appBadge);
			Ti.UI.iPhone.setAppBadge(0);
	    }
	});
	
	Ti.App.addEventListener('close', function(){
	    Ti.API.info('Fashionist is closing. See you again soon.');
		if (Ti.App.mainTabGroup) {Ti.App.mainTabGroup.close();} 
		if (Ti.App.rootWindow) {Ti.App.rootWindow.close();}   
		Ti.App.mainTabGroup = null;
		Ti.App.getFeedTab = null;
		Ti.App.rootWindow = null;	    
	});
	
	// max number of posts in feed
	Ti.App.maxNumPosts = 8;
	Ti.App.maxPages = 6;
	Ti.App.maxNumCachedComments = 3;
	Ti.App.maxCommentsInPostSummary = 3;
	
	// default font
	Ti.App.defaultFontFamily = "HelveticaNeue-Light";

	
	// initialize main tabgroup
	Ti.App.mainTabGroup = null;
	Ti.App.guestTabGroup = null;	
	Ti.App.getFeedTab = null;
	Ti.App.rootWindow = null;
	
	//setup spinny activity indicator
	if (osname === 'iphone' || osname === 'ipad'){
		Ti.App.spinnerStyle = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
		Ti.App.darkSpinner = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
	}
	else {
		Ti.App.spinnerStyle = Ti.UI.ActivityIndicatorStyle.BIG;
		Ti.App.darkSpinner = Ti.UI.ActivityIndicatorStyle.BIG_DARK;				
	}
	// initialize Facebook 
	Ti.App.facebookInitialized = false;
	/*
	if(Ti.Platform.osname === 'android'){
	  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
	  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
	  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
	}
	*/
	//Ti.API.info("should be hello, was = " + String.format('%s','hello'));
	
	//these acl objects were created using curl on the command line
	/*
	if (Ti.App.deployType === 'production') {
		Ti.App.postACLId = "52377acea7a0670b0f02c6c0";
	}
	else {
		Ti.App.postACLId = "5233ba89e126880b21004b74";
	}
	*/		
	showGuestWindow = function () {
		// no user logged in previously, prompt user to login or sign up
		GuestWindow.createGuestWindow(Ti.App.rootWindow);
	};
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android		
	isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	if (isTablet) {
		AppWindow = require('ui/tablet/ApplicationWindow');
	}
	else {
		AppWindow = require('ui/handheld/ApplicationWindow');
		if (Ti.Platform.name === 'iPhone OS') { 
			Ti.UI.iPhone.setStatusBarStyle(Titanium.UI.iPhone.StatusBar.DEFAULT); 
			Ti.App.spinnerStyle = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
		}
	}
	Cloud.debug = true;
	
	Ti.App.photoSizes ={"iphone": [640,640], "ipad": [768,768], "android": [478,478]};	
	Ti.App.rootWindow = AppWindow.createApplicationWindow(Ti.Locale.getString('fashionista'));
	Ti.App.rootWindow.open();
	
	// for now exit if device is offline
	if (!Ti.Network.online) {
		alert("Sorry - Fashionist requires an internet connection. Your device is offline. Please make sure you are connected to the internet, then exit and restart.");
		Ti.App.rootWindow.close();
	}
	else {
	    // Check here whether there is a logged in user
		try {		
			sessionId = Ti.App.Properties.getString('sessionId');
			Ti.API.info("Check whether we have a stored sessionId " + sessionId + " Cloud.sessionId " + Cloud.sessionId);
			//Let ACS know we want to resume the saved session
			Cloud.sessionId = sessionId;
			if (!sessionId) {
				Ti.API.info("no stored session " + sessionId);
			    showGuestWindow();			
			}
			// should not be able to get here without logging in
			else {
				Ti.API.info("found stored session " + sessionId);
				// we have a stored user session, retrieve the current user	
				acs.getCurrentUserDetails(ApplicationTabGroup.initAppUI, showGuestWindow);
			}		
		}
		catch (e)
		{
			Ti.API.info("Exception caught" + e.Message);
		}
	
		Ti.API.info("Fashionist is running...");
	}
		
} ());
