/**
 * Copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 */


(function () {
	'use strict';
	
	// call this before initNotification so that the event handlers are defined before the events are fired
	function initNotificationHandlers () {
		var acs = require('lib/acs'),
			FeedWindow = require('ui/common/FeedWindow'),
			PostView = require('ui/common/PostView');
		Ti.API.info("calling initSubscriptions to setup event handlers");
		
		// handle new post notifications. Define event listener before the event is ever fired
		Ti.API.info("Adding newPost handler");
		Ti.App.addEventListener('newPost', function (e) {
			var tab = Ti.App.getFeedTab(), 
				postId = e.pid, message = e.message, senderId = e.uid,
				currentUser = acs.currentUser();
			if (tab) {		
				if (postId && currentUser && acs.currentUserId() === senderId) {
						Ti.API.info(message);
						acs.showPost(postId, function (p) {
													FeedWindow.afterSharePost(p);
												});							
				}
				else {
					Ti.API.info("something went wrong while posting postId " + postId + " message " + message + " tab " + tab);
				}
			}		
		});
						
		// handle new friend post notifications. Define event listener before the event is ever fired
		Ti.API.info("Adding newFriendPost handler");
		Ti.App.addEventListener('newFriendPost', function (e) {
			var tab = Ti.App.getFeedTab(), 
				postId = e.pid, message = e.message, senderId = e.uid,
				appBadge = e.badge;
			if (tab) {
				Ti.API.info("new post. " +  message + " Updating feed window ");				
				// decrement the app badge
				Ti.API.info("appBadge is " + appBadge);
				if (appBadge > 0) {
					Ti.UI.iPhone.setAppBadge(appBadge - 1);
				}
				else {
					Ti.API.info("notification handler called when appbadge is negative " + appBadge);
				}				
				if (postId) {
					if (acs.currentUser() && acs.currentUser().id === senderId) {
						Ti.API.info("your picture " + message + " has been posted");
					}
					else {
						/* race condition can cause this to display a post twice
						acs.showPost(postId, function (p) {
												FeedWindow.displayPostInFeed(p, true); 
												});
												*/
						FeedWindow.showFriendsFeed();													
					}
				}
			}		
		});	
	}


	function approvedFriendRequestHandler (appBadge) {
			Ti.API.info("executing approvedFriendRequestHandler");
			var acs = require('/lib/acs'),
				requesters = [],
				currentUser = acs.currentUser(),
				FeedWindow = require('ui/common/FeedWindow');

			// decrement the app badge
			Ti.API.info("appBadge is " + appBadge);
			if (appBadge > 0) {
				Ti.UI.iPhone.setAppBadge(appBadge - 1);			}
			else {
				Ti.API.info("notification handler called when appbadge is not positive " + appBadge);
			}			
			FeedWindow.showFriendsFeed();
	}
	

	function approveFriendRequest (requesterId, appBadge) {
			Ti.API.info("executing approveFriendRequest handler");
			var acs = require('/lib/acs'),
				requesters = [],
				currentUser = acs.currentUser(),
				FeedWindow = require('ui/common/FeedWindow'),
				approveRequestCallback = function(e) {
					FeedWindow.showFriendsFeed();	
				};
			requesters.push(requesterId);
			// decrement the app badge
			Ti.API.info("appBadge is " + appBadge);
			if (appBadge > 0) {
				Ti.UI.iPhone.setAppBadge(appBadge - 1);			}
			else {
				Ti.API.info("notification handler called when appbadge is not positive " + appBadge);
			}			
			if (currentUser && acs.currentUserId() !== requesterId) {				
				acs.approveFriendRequests(requesters, approveRequestCallback);				
			}
			else {
				Ti.API.info("got a request to add self as a friend. do nothing currentUser is " + currentUser);
			}
	}
	
	
	function newLikeHandler (postId, senderId, message, appBadge) {
			var acs = require('/lib/acs'),
				FeedWindow = require('ui/common/FeedWindow');
			Ti.API.info("handling new like " + message + " Updating likes count ");
			// decrement the app badge
			Ti.API.info("appBadge is " + appBadge);
			if (appBadge > 0) {
				Ti.UI.iPhone.setAppBadge(appBadge - 1);
			}
			else {
				Ti.API.info("notification handler called when appbadge is not positive " + appBadge);
			}			
			if (postId) {
				if (acs.currentUser() && acs.currentUser().id === senderId) {
					Ti.API.info("your like " + message + " has been registered");
				}
				else {
					// update likes count on friends' devices
					Ti.API.info("received a like " + message + " from user " + senderId);
					FeedWindow.showFriendsFeed();
					//FIXME instead of doing a roundtrip to the cloud, we should update the local post instance
					//acs.showPost(postId, function (p) { PostView.displayPostDetailsView(p);});
				}
			}
			else {
		        Ti.UI.createAlertDialog({
		            title : "Fashionist",
		            message : "Ooops...something went wrong with your like: " + message  //if you want to access additional custom data in the payload
		        }).show();					
			}																								
	}

	
	function newCommentHandler (postId, senderId, message, appBadge) {
		var tab = Ti.App.getFeedTab(),
			FeedWindow = require('ui/common/FeedWindow'),
			PostView = require('ui/common/PostView'),
			acs = require('lib/acs');
		Ti.API.info("handling new comment " + message + " Updating feed window postId " + postId );
		if (tab) {
			// decrement the app badge
			Ti.API.info("appBadge is " + appBadge);
			if (appBadge && appBadge > 0) {
				Ti.UI.iPhone.setAppBadge(appBadge - 1);
			}
			else {
				Ti.API.info("notification handler called when appBadge is negative " + appBadge);
			}				
			//refresh comments count on local and friends' device
			FeedWindow.showFriendsFeed();
			if (postId) {
				if (acs.currentUser() && acs.currentUser().id === senderId) {
					Ti.API.info("your comment " + message + " has been posted");
				}
				else {
					Ti.API.info("display post in details window on top of tab " + tab);
					acs.showPost(postId, function (p) { PostView.displayPostDetailsView(p, true);});						
				}
			}
			else {
		        Ti.UI.createAlertDialog({
		            title : "Fashionist",
		            message : "Ooops...something went wrong with this comment: " + message  //if you want to access additional custom data in the payload
		        }).show();					
			}								
		}			
	}

	
	// called when registerForPushNotifications returns successfully
	function initSubscriptions() {
		var acs = require('lib/acs');		
		// subscribe to notifications
		acs.subscribeNotifications('fashionist');	
	}
	
	
	function registerNotificationCallback (e) {
		var acs = require('lib/acs'),
			appBadge = Titanium.UI.iPhone.getAppBadge(),
			badge = e.data.badge,
			message = unescape(e.data.alert),			
			customPayload = e.data.f,
			notificationType = customPayload ? customPayload.type : null,
			senderId = customPayload ? customPayload.uid : null,
			postId = customPayload ? customPayload.pid : null,
			currentUser = acs.currentUser(),
			notificationAlert = Ti.UI.createAlertDialog({
	            title : Ti.Locale.getString('fashionista'),
	            message : message  //if you want to access additional custom data in the payload
	        });
									
			Ti.API.info('\nPUSH NOTIFICATION: Fashionist received a push notification w/ type: ' + notificationType + ' \nmsg:' + message + ' \nappBadge ' + appBadge);
			if (!acs.currentUser()) {
				Ti.API.info("No logged in user. No further action");	
			}
			else if (acs.currentUser() && acs.currentUser().id === senderId) {
				Ti.API.info("PUSH Notification was sent by current user. No further action. Local side effects should not rely on push notification succeeding");
			}	
			else {	
				Ti.API.info(notificationType + " \n time " + Date.now());	
				switch (notificationType) {
					case 'newPost':
						Ti.API.info("FIRE EVENT: NEW POST from " + senderId);
						Ti.App.fireEvent('newFriendPost', {"uid": senderId, "pid": postId, "message": message, "badge": badge});
					break;
					case 'comment':
						Ti.API.info("Handling: NEW COMMENT from " + senderId);
						newCommentHandler(postId, senderId, message, badge);
					break;		
					case 'newLike':
						Ti.API.info("Handling: NEW LIKE from " + senderId);
						newLikeHandler(postId, senderId, message, badge);
					break;								
					case 'friend_request':
						Ti.API.info("Notification Type: FRIEND REQUEST from " + senderId + " to " + currentUser);
						approveFriendRequest (senderId, badge);
					break;
					case 'friend_approved':
						Ti.API.info("Notification Type: FRIEND APPROVED from " + senderId + " to " + currentUser);
						approvedFriendRequestHandler(badge);
					break;
					default:
						Ti.API.info('Unknown Notification Type: ' +  notificationType + ' from ' + senderId + " to " + currentUser);
				}
				// if app is in foreground this is the only way user will find out a notification was received
		        if (Ti.App.isInForeground) { notificationAlert.show(); }
	        }				
	}	
	
	
	
	// should be called after we have a logged in user
	function initNotifications () {
		initNotificationHandlers();
		//register for push notifications every time the app launches, as prescribed by Apple's
		// Local and Push Notifications Programming Guide
		Ti.API.info("calling registerForPushNotifications");		
		Ti.Network.registerForPushNotifications({
		    types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
		    // push notification registration was successful
		    success : function(e) {
		        Ti.API.info('successfully registered for apple device token with ' + e.deviceToken);
				initSubscriptions();
		    },
		    // there was an error during push registration
		    error : function(e) {
		        alert("failed to register push notifications: " + e);
		    },
		    // called when app receives a push notification
		    callback : registerNotificationCallback
		});
	}

	
	exports.initSubscriptions = initSubscriptions;
	exports.initNotifications = initNotifications;
	exports.registerNotificationCallback = registerNotificationCallback;
	exports.newCommentHandler = newCommentHandler;
	
	
} ());
