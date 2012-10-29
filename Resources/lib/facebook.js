/*
	Library to wrap app-specific functionality around the Social Integration APIs
*/

var Cloud = require('ti.cloud');

	
function initSocialIntegration(authCallback, logoutCallback) {
	"use strict";
	Ti.Facebook.appid = '355242507898610';
	Ti.Facebook.permissions = ['publish_stream']; // Permissions your app needs
	Ti.Facebook.addEventListener('login', function(e) {
	    if (e.success) {
	        Ti.API.info('Logged In to Facebook' + Titanium.Facebook.loggedIn);
	        authCallback();
	    } else if (e.error) {
	        Ti.API.info(e.error);
	    } else if (e.cancelled) {
	        Ti.API.info("Facebook login canceled");
	    }
	});
	Ti.Facebook.addEventListener('logout', function(e) {
	    Ti.API.info('Logged out of facebook ' + Titanium.Facebook.loggedIn);
	    logoutCallback();
	});
}

function linktoFBAccount(successCallback, errorCallback) {
	"use strict";
	Cloud.SocialIntegrations.externalAccountLink({
	    type: 'facebook',
	    token: Ti.Facebook.accessToken
	}, function (e) {
	    if (e.success) {
	        var user = e.users[0];
	        if (successCallback) {
				successCallback();
	        }
	        Ti.API.info('Success. Linked current user to facebook account:\\n' +
	            'id: ' + user.id + '\\n' +
	            'first name: ' + user.first_name + '\\n' +
	            'last name: ' + user.last_name);
	    } else {
			if (errorCallback) {
				errorCallback();
			}
	        Ti.API.info('Error. Failed to link to Facebook account:\\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
}

function authorize() {
	"use strict";
	if (!Ti.Facebook.loggedIn || !Ti.Facebook.accessToken) {
		Ti.API.info("Calling facebook authorize. Facebook login status " + Ti.Facebook.loggedIn + " FB access token " + Ti.Facebook.accessToken);
		Ti.Facebook.authorize();		
	}
	else {
		Ti.API.info("Not calling facebook authorize. Facebook login status " + Ti.Facebook.loggedIn + " FB access token " + Ti.Facebook.accessToken);		
	}
}

function logout() {
	"use strict";
	if (Ti.Facebook.getLoggedIn()) {
		Ti.Facebook.logout();
	}
	else {
		Ti.API.info("not logged into facebook");
	}
}

function postToWall(photoUrl) {
	'use strict';
	var data = {
		    link : "http://signup.3pmrevolution.com",
		    name : "Fashionista for iPhone",
		    message : "Checkout this cool iPhone app that makes shopping more fun",
		    caption : "Taken with Fashionista for iPhone",
		    picture : photoUrl,
		    description : "<add a description of your photo here>"
		};
	Ti.API.info("PostToWall " + photoUrl);
	Titanium.Facebook.dialog("feed", data, function(e) {
	    if(e.success && e.result) {
	        alert("Success! New Post ID: " + e.result);
	    } else {
	        if(e.error) {
	            alert(e.error);
	        } else {
	            alert("User canceled dialog.");
	        }
	    }
	});
}

exports.initSocialIntegration = initSocialIntegration;
exports.logout = logout;
exports.authorize = authorize;
exports.linktoFBAccount = linktoFBAccount;
exports.postToWall = postToWall;