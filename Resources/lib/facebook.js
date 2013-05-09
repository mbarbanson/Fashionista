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
	function getLinkedFBId(currentUser) {
		var extAccounts = currentUser.external_accounts,
			extAccount = null,
			numAccounts = extAccounts.length, i;
		for (i= 0; i < numAccounts ; i = i + 1) {
			extAccount = extAccounts[i];
			if (extAccount.external_type === "facebook") {
				return extAccount.external_id;
			}
		}			
		return null;			
	}
	
		
	function postToWall(photoUrl, message) {
		var name = Ti.Locale.getString('Fashionist for iPhone'), 
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
		Ti.Facebook.requestWithGraphPath('me/friends', {}, 'GET', function(e) {
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
		Ti.Facebook.requestWithGraphPath('me?fields=picture', {}, 'GET', function(e) {
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
					alert("getFBProfilePic wasn't able to retrieve a profile picture from Facebook " + result);
		        }
		    } else {
		        if (e.error) {
					if (errorCallback) {errorCallback();}
		            alert(e.error);
		        } else {
		            alert("Unknown result");
		        }
		    }
		    return;
		});
	}


	
	function hasLinkedFBAccount() {
		var acs = require('lib/acs'),
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
		var token = Ti.Facebook.accessToken;
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
			    if (successCallback) {
					Ti.API.info(" Calling linktoFBAccount successCallback");
					successCallback(e);
			    }		            
            } else {
		        alert(((e.error && e.message) || JSON.stringify(e)));
	            if (errorCallback) {
					Ti.API.info(" Calling linktoFBAccount errorCallback");
					errorCallback();
				}
		    }
		});
	}


	
	function logout() {
		if (Ti.Facebook.getLoggedIn()) {
			Ti.Facebook.logout();
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
		        Ti.API.info('Error. Failed to unlink to Facebook account: ' + Ti.Facebook.uid +  ' \\n' +
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
			currentUser = acs.currentUser();
			// if first name or last name is missing, get them from facebook
		if (!currentUser.first_name || !currentUser.last_name || !currentUser.email) {
			acs.updateUser({first_name: currentUser.first_name||fbData.first_name, 
							last_name: currentUser.last_name||fbData.last_name,
							email: currentUser.email||fbData.email,
							photo: 'https://graph.facebook.com/' + Ti.Facebook.uid + '/picture'});			
		}				
	}
	
	
	function initFBIntegration(actionCB, cleanupCB) {
		// configure facebook options
		Ti.Facebook.appid = '355242507898610';
		Ti.Facebook.permissions = ['email'];   //'publish_stream', 'offline_access', 'xmpp_login']; // Permissions your app needs
		// set to false to use SSO on device if facebook app is present. defaults to true
		Ti.Facebook.forceDialogAuth = false;
		
		authAction = actionCB;
		// cleanup after ourselves to make sure we can call initFBIntegration several times without problems
		if (loginListener) {
			Ti.Facebook.removeEventListener('login', loginListener);
		}
		loginListener = function(e) {
		    if (e.success) {
		        Ti.API.info('Logged In to Facebook ' + Titanium.Facebook.getLoggedIn() + ". fb access token " + Ti.Facebook.getAccessToken());
				if (!hasLinkedFBAccount()) {
					Ti.API.info("current user doesn't have a linked facebook account.");
			        linktoFBAccount(authAction, function () { Ti.Facebook.logout(); });
				}
				else {
					if (authAction) {authAction();}
				}
	            // e.data: { link, id, name, first_name, last_name, gender, timezone, locale, updated_time, username}
	            // updating user photo seems to be broken
	            populateNameAndPicFromFB(e.data);		              
		    } else if (e.error) {
		        Ti.API.info("Facebook login listener. Error result from authorize " + e.error);
		        // log out of Facebook to reset all cached info
		        if (hasLinkedFBAccount()) {
					unlinkFBAccount(function () { Ti.Facebook.logout(); });
				}
				else {
					Ti.Facebook.logout();					
				}	
		        Ti.Facebook.authorize();
		        Ti.API.info("Trying facebook authorize again");
		    } else if (e.cancelled) {
		        Ti.API.info("Facebook login cancelled");
		    }
	        if (cleanupCB) {cleanupCB();}
		};
		Ti.Facebook.addEventListener('login', loginListener);
		if (logoutListener) {
			Ti.Facebook.removeEventListener('logout', logoutListener);
		}		
		logoutListener = function(e) {
		    Ti.API.info('Logged out of facebook ' + Titanium.Facebook.getLoggedIn + ' access token ' + Ti.Facebook.getAccessToken());
		};
		Ti.Facebook.addEventListener('logout', logoutListener);
	}
	

	// make sure user is authorized for facebook before executing action
	// if the current user has a linked fb account already, logging into Fashionist will have already updated Ti.Facebook.accessToken
	function authorize(actionCB, cleanupCB) {
		var acs = require('lib/acs'),
			currentUser = acs.currentUser();

		if (!currentUser) {
			alert("No currentUser while trying to authorize with Facebook. Please send your system console log to the Fashionist team!");
			return;
		}
		if (!Ti.App.facebookInitialized) {
			initFBIntegration(actionCB, cleanupCB);
			Ti.App.facebookInitialized = true;
		}
		
		Ti.API.info("Facebook login status " + Ti.Facebook.loggedIn + " FB access token " + Ti.Facebook.accessToken);
		// if user is not logged in to Facebook, call authorize
		if (!Ti.Facebook.getLoggedIn()) {
			Ti.API.info("Calling facebook authorize");
			Ti.Facebook.authorize();	
		}
		else {
			Ti.API.info("Current user is already logged in to facebook. calling actionCB directly");
			actionCB();
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
