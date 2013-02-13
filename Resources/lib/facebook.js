/*
	Library to wrap app-specific functionality around the Social Integration APIs
*/

(function () {
	'use strict';
	var Cloud = require('ti.cloud'),
		acs = require('lib/acs'),
		loginListener = null,
		logoutListener = null;

	function linktoFBAccount(callback, token) {
		if (!token) {
			token = Ti.Facebook.accessToken;
		}
		Cloud.SocialIntegrations.externalAccountLink({
		    type: 'facebook',
		    token: token
		}, function (e) {
		    if (e.success) {
		        var user = e.users[0];
		        Ti.API.info('Success. Linked current user to facebook account:\\n' +
		            'id: ' + user.id + '\\n' +
		            'first name: ' + user.first_name + '\\n' +
		            'last name: ' + user.last_name);
		    } else {
		        Ti.API.info('Error. Failed to link to Facebook account:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		    if (callback) {
				Ti.API.info(" Calling linktoFBAccount callback");
				callback();
		    }
		});
	}


	
	function logout() {
		if (Ti.Facebook.getLoggedIn()) {
			Ti.Facebook.logout();
		}
		else {
			Ti.API.info("not logged into facebook");
			Ti.Facebook.logout();
		}
	}
	
		
	function initFBIntegration(actionCB) {
		Ti.Facebook.appid = '355242507898610';
		Ti.Facebook.permissions = ['publish_stream', 'user_photos', 'friends_photos', 'xmpp_login']; // Permissions your app needs

		if (loginListener) {
			Ti.Facebook.removeEventListener('login', loginListener);
		}
		loginListener = function(e) {
		    if (e.success) {
		        Ti.API.info('Logged In to Facebook ' + Titanium.Facebook.loggedIn + ". Now link the facebook account.");
		        linktoFBAccount(actionCB);
		    } else if (e.error) {
		        Ti.API.info("Facebook login listener. Error result from authorize " + e.error);
		        logout();
		        Ti.API.info("Please try facebook authorize again");
		    } else if (e.cancelled) {
		        Ti.API.info("Facebook login canceled");
		    }
		};
		Ti.Facebook.addEventListener('login', loginListener);
		if (logoutListener) {
			Ti.Facebook.removeEventListener('logout', logoutListener);
		}		
		logoutListener = function(e) {
		    Ti.API.info('Logged out of facebook ' + Titanium.Facebook.loggedIn);
		};
		Ti.Facebook.addEventListener('logout', logoutListener);
	}
	

	
	function unlinkFBAccount(callback) {
		Cloud.SocialIntegrations.externalAccountUnlink({
		    type: 'facebook',
		    id: Ti.Facebook.uid
		}, function (e) {
		    if (e.success) {
		        var user = e.users[0];
		        Ti.API.info('Success. Unlinked current user from facebook account:\\n' +
		            'id: ' + user.id + '\\n' +
		            'first name: ' + user.first_name + '\\n' +
		            'last name: ' + user.last_name);
		    } else {
		        Ti.API.info('Error. Failed to unlink to Facebook account: ' + Ti.Facebook.uid +  ' \\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
	        if (callback) {
				Ti.API.info("Calling unlinkFBAccount Callback");
				callback();
	        }
		});
	}
	
	// make sure user is authorized for facebook before executing action
	// if the current user has a linked fb account already, logging into Fashionista will have already updated Ti.Facebook.accessToken
	function authorize(actionCB) {
		var currentUser = acs.currentUser();

		if (!currentUser) {
			alert("No currentUser while trying to authorize with Facebook. Please send your system console log to the Fashionista team!");
			return;
		}
		if (!Ti.Facebook.accessToken) {
			initFBIntegration(actionCB);
			Ti.API.info("Calling facebook authorize. Facebook login status " + Ti.Facebook.loggedIn + " FB access token " + Ti.Facebook.accessToken);
			Ti.Facebook.authorize();				
		}
		else {
			Ti.API.info("Not calling facebook authorize. Facebook login status " + Ti.Facebook.loggedIn + " FB access token " + Ti.Facebook.accessToken);
			Ti.API.info("User is already authorized for facebook, calling actionCB directly");	
			actionCB();	
		}
	}

	
	
	function postToWall(photoUrl, message) {
		var name, 
			data;
		name = L("Fashionista for iPhone");
		data = {
			    link : "http://signup.3pmrevolution.com",
			    name : name,
			    message : message,
			    picture : photoUrl
		};
		alert("PostToWall " + photoUrl);
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
	
	
	function getAllFBFriends() {
		Ti.Facebook.requestWithGraphPath('me/friends', {}, 'GET', function(e) {
			var result = null;
		    if (e.success) {
		        Ti.API.info("Success! Returned from FB: " + e.result);
		        result = e.result.data;
		    } else {
		        if (e.error) {
		            alert(e.error);
		        } else {
		            alert("Unknown result");
		        }
		    }
		    return result;
		});
	}



	
	exports.initFBIntegration = initFBIntegration;
	exports.logout = logout;
	exports.authorize = authorize;
	exports.linktoFBAccount = linktoFBAccount;
	exports.postToWall = postToWall;
	exports.getAllFBFriends = getAllFBFriends;

} ());
