/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	var Cloud = require('ti.cloud'),
		authAction = null,
		loginListener = null,
		logoutListener = null;

	// Facebook graph API
	function getLinkedFBId(author) {
		var acs = require('lib/acs'),
			fb = require('facebook'),		
			user = author || acs.currentUser(),
			extAccounts = user.external_accounts,
			extAccount = null,
			numAccounts = (extAccounts && extAccounts.length) || 0, 
			i;
		for (i= 0; i < numAccounts ; i = i + 1) {
			extAccount = extAccounts[i];
			if (extAccount.external_type === "facebook") {
				return extAccount.external_id;
			}
		}			
		return null;			
	}
	
		
	function postToWall(photoUrl, message) {
		var fb = require('facebook'),
			name = Ti.Locale.getString('Fashionist for iPhone'), 
			data;

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
		var fb = require('facebook');
		fb.requestWithGraphPath('me/friends', {}, 'GET', function(e) {
			var result = null;
		    if (e.success) {
		        Ti.API.info("getAllFBFriends Success! Returned from FB: " + e.result);
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
	
	
	/*
	 * 
{
  "id": "100004652744055",
  "picture": {
    "data": {
      "url": "http://profile.ak.fbcdn.net/hprofile-ak-ash4/369721_100004652744055_361395030_q.jpg",
      "is_silhouette": false
    }
  }
}
	 */	
	function getFBProfilePic(successCallback, errorCallback) {
		var fb = require('facebook');
		fb.requestWithGraphPath('me?fields=picture', {}, 'GET', function(e) {
			var result = null,
				picData, isSilhouette,
				imgView;
		    if (e.success) {
		        Ti.API.info("getFBProfilePic Success! Returned from FB: " + e.result);
		        result = JSON.parse(e.result);
		        if (result && result.picture && result.picture.data) {
					picData = result.picture.data;
					isSilhouette = picData.is_silhouette;
					imgView = Ti.UI.createImageView({image: picData.url});
					successCallback("http://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash3/49136_1646556920_4385_q.jpg");
				}
		        else {
					Ti.API.info("getFBProfilePic wasn't able to retrieve a profile picture from Facebook " + result);
		        }
		    } else {
		        if (e.error) {
					if (errorCallback) {errorCallback();}
		            Ti.API.info(e.error);
		        } else {
		            Ti.API.info("Unknown result");
		        }
		    }
		    return;
		});
	}


	
	function hasLinkedFBAccount() {
		var acs = require('lib/acs'),
			fb = require('facebook'),
			currentUser = acs.currentUser(),
			extAccounts = currentUser.external_accounts,
			extAccount = null,
			numAccounts = extAccounts.length, i;
		for (i= 0; i < numAccounts ; i = i + 1) {
			extAccount = extAccounts[i];
			if (extAccount.external_type === "facebook") {
				return true;
			}
		}			
		return false;			
	}

	function linktoFBAccount(successCallback, errorCallback) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			fb = require('facebook'),
			token = fb.accessToken;
		Cloud.SocialIntegrations.externalAccountLink({
		    type: 'facebook',
		    token: token
		}, function (e) {
		    if (e.success) {
		        var user = e.users[0];
		        Ti.API.info('Success. Linked current user to facebook account:\\n' +
		            'id: ' + user.id + '\\n' +
		            'email: ' + user.email +
		            'first name: ' + user.first_name + '\\n' +
		            'last name: ' + user.last_name);
		        acs.setCurrentUser(user);
			    if (successCallback) {
					Ti.API.info(" Calling linktoFBAccount successCallback");
					successCallback(e);
			    }		            
            } else {
				if (e.code === 400) {
					alert(((e.error && e.message) || JSON.stringify(e)));	
				}
				else {
					Ti.API.info(((e.error && e.message) || JSON.stringify(e)));
				}
		        Flurry.logEvent('externalAccountLinkError', {'message': e.message, 'error': e.error});
	            if (errorCallback) {
					Ti.API.info(" Calling linktoFBAccount errorCallback");
					errorCallback();
				}
		    }
		});
	}


	
	function logout() {
		var fb = require('facebook');
		if (fb.getLoggedIn()) {
			fb.logout();
			Ti.API.info("Logged out of facebook");
		}
		else {
			Ti.API.info("not logged into facebook");
		}
	}
	
	function setAuthAction(actionCB) {
		authAction = actionCB;
	}
	
	
	function unlinkFBAccount(callback) {
		var acs = require('lib/acs'),
			fb = require('facebook'),
			currentUser = acs.currentUser(),
			externalAcct = currentUser.external_accounts[0];
		Cloud.SocialIntegrations.externalAccountUnlink({
		    id: externalAcct.external_id,
		    type: 'facebook'
		}, function (e) {
		    if (e.success) {
		        var user = e.users[0];
		        Ti.API.info('Success. Unlinked current user from facebook account:\\n' +
		            'id: ' + user.id + '\\n' +
		            'first name: ' + user.first_name + '\\n' +
		            'last name: ' + user.last_name);
		    } else {
		        Ti.API.info('Error. Failed to unlink to Facebook account: ' + fb.uid +  ' \\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
	        if (callback) {
				Ti.API.info("Calling unlinkFBAccount Callback");
				callback();
	        }
		});
	}
	


	// FB account integration
	function populateNameAndPicFromFB(fbData) {
		var acs = require('lib/acs'),
			fb = require('facebook'),
			currentUser = acs.currentUser();
			// if first name or last name is missing, get them from facebook
		if (!currentUser.first_name || !currentUser.last_name || !currentUser.email) {
			acs.updateUser({first_name: currentUser.first_name||fbData.first_name, 
							last_name: currentUser.last_name||fbData.last_name,
							email: currentUser.email||fbData.email});			
		}				
	}
	
	
	function initFBIntegration(actionCB, cleanupCB) {
		var fb = require('facebook');
		// configure facebook options
		fb.appid = '355242507898610';
		fb.permissions = ['email'];   //'publish_stream', 'offline_access', 'xmpp_login']; // Permissions your app needs
		// set to false to use SSO on device if facebook app is present. defaults to true
		fb.forceDialogAuth = false;
		
		authAction = actionCB;
		// cleanup after ourselves to make sure we can call initFBIntegration several times without problems
		if (loginListener) {
			fb.removeEventListener('login', loginListener);
		}
		loginListener = function(e) {
		    if (e.success) {
		        Ti.API.info('Logged In to Facebook ' + fb.getLoggedIn() + ". fb access token " + fb.getAccessToken());
				if (!hasLinkedFBAccount()) {
					Ti.API.info("current user doesn't have a linked facebook account.");
			        linktoFBAccount(function () { authAction(e.data); }, function () { fb.logout(); });
				}
				else {
					Ti.API.info("user has a facebook external account linked, call authAction directly");
					if (authAction) { 
						authAction(e.data); 
					}
				}
	            // e.data: { link, id, name, first_name, last_name, gender, timezone, locale, updated_time, username}
	            // updating user photo seems to be broken
	            populateNameAndPicFromFB(e.data);		              
		    } else if (e.error) {
		        Ti.API.info("Facebook login listener. Error result from authorize " + e.error);
		        // log out of Facebook to reset all cached info
		        if (hasLinkedFBAccount()) {
					unlinkFBAccount(function () { fb.logout(); });
				}
				else {
					fb.logout();					
				}	
		        fb.authorize();
		        Ti.API.info("Trying facebook authorize again");
		    } else if (e.cancelled) {
		        Ti.API.info("Facebook login cancelled");
		    }
	        if (cleanupCB) {
				cleanupCB();
			}
		};
		fb.addEventListener('login', loginListener);
		if (logoutListener) {
			fb.removeEventListener('logout', logoutListener);
		}		
		logoutListener = function(e) {
		    Ti.API.info('Logged out of facebook ' + Titanium.Facebook.getLoggedIn + ' access token ' + fb.getAccessToken());
		};
		fb.addEventListener('logout', logoutListener);
	}
	

	// make sure user is authorized for facebook before executing action
	// if the current user has a linked fb account already, logging into Fashionist will have already updated fb.accessToken
	function authorize(actionCB, cleanupCB) {
		var acs = require('lib/acs'),
			fb = require('facebook'),
			currentUser = acs.currentUser(),
			facebookUID = getLinkedFBId(currentUser);

		if (!currentUser) {
			alert("No currentUser while trying to authorize with Facebook. Please send your system console log to the Fashionist team!");
			return;
		}
		if (!Ti.App.facebookInitialized) {
			Ti.API.info("in lib/facebook.js, authorize: Ti.App.facebookInitialized is false. Calling initFBIntegration");
			initFBIntegration(actionCB, cleanupCB);
			Ti.App.facebookInitialized = true;
		}
		else {
			authAction = actionCB;
		}
		
		Ti.API.info("Facebook login status " + fb.loggedIn + " FB access token " + fb.accessToken);
		// if user is not logged in to Facebook, call authorize
		if (!fb.getAccessToken() || !facebookUID) {
			Ti.API.info("Calling facebook authorize with loginListener " + authAction);
			fb.authorize();	
		}
		else {
			Ti.API.info("Current user already authorized Fashionist to access their facebook public profile and friends. Calling actionCB directly");
			authAction();
		}
	}


	
	
	exports.initFBIntegration = initFBIntegration;
	exports.logout = logout;
	exports.authorize = authorize;
	exports.linktoFBAccount = linktoFBAccount;
	exports.unlinkFBAccount = unlinkFBAccount;
	exports.postToWall = postToWall;
	exports.getAllFBFriends = getAllFBFriends;
	exports.hasLinkedFBAccount = hasLinkedFBAccount;
	exports.getLinkedFBId = getLinkedFBId;

} ());
