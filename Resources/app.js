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
"use strict";

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

// This is a single context application with mutliple windows in a stack
(function() {
	//determine platform and form factor and render approproate components
	var acs = require('lib/acs'),
		Cloud = require('ti.cloud'),
		osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth,
		isTablet = false,
		rootWindow = null;	
    
    // Check here whether there is a logged in user
	try {		
		//require('lib/FakeDataGenerator');
		//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
		//yourself what you consider a tablet form factor for android
		isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
		if (isTablet) {
			var AppWindow = require('ui/tablet/ApplicationWindow');
		}
		else {
			var AppWindow = require('ui/handheld/ApplicationWindow');
			Ti.UI.iPhone.hideStatusBar();
		}
			
		Cloud.debug = true;
		rootWindow = new AppWindow.createApplicationWindow(L('Fashionista'));

		if (!Cloud.hasStoredSession()) {
			acs.logout();
		    // no user logged in previously, prompt user to login or sign up
			var GuestWindow = require('ui/common/GuestWindow');
			new GuestWindow(rootWindow);
			rootWindow.open();			
		}
		// should not be able to get here without logging in
		else {
			// we have a stored user session, retrieve the current user
			Cloud.Users.showMe(function (e) {
		        if (e.success) {
		            var user = e.users[0];
		            Ti.API.info('Retrieved current user:\\n' +
		                'id: ' + user.id + '\\n' +
		                'first name: ' + user.first_name + '\\n' +
		                'last name: ' + user.last_name + '\\n');
		            acs.setCurrentUser(user);
		           	acs.setIsLoggedIn(true);

				    var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
					new ApplicationTabGroup(user, rootWindow).open({transition: Titanium.UI.iPhone.AnimationStyle.NONE});
		        } else {
		            alert('Error:\\n' +
		                ((e.error && e.message) || JSON.stringify(e)));
		        }
	    	});
	
		}
	}
	catch (e)
	{
		Ti.API.info("Exception caught" + e.Message)
	}

	
	

 
})();
