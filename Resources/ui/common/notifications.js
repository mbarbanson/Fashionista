/**
 * @author MONIQUE BARBANSON
 */


(function () {
	'use strict';
	
	
	
	function initSubscriptions() {
		var acs = require('lib/acs'),
			FeedWindow = require('ui/common/FeedWindow');
		Ti.API.info("calling initSubscriptions to setup event handlers");				
		// handle new friend request notifications. Define event listener before the event is ever fired
		Ti.API.info("Adding newFriendPost handler");
		Ti.App.addEventListener('newFriendPost', function (e) {
			var feedWin = FeedWindow.currentFeedWindow();
			Ti.API.info("new post handler. Need to update feed window " + feedWin);
			if (feedWin) {
				//FeedWindow.clearFeed(feedWin);
				FeedWindow.showFriendsFeed(feedWin);				
			}			
		});
	
		// handle new post notifications. Define event listener before the event is ever fired
		// just received a notification that current user was added as a friend by requester
		// if requester is already a friend of current user, stop there
		// otherwise, current user approves requester as a friend and both become mutual friends
		Ti.API.info("Adding approveFriendRequest handler");
		Ti.App.addEventListener('approveFriendRequest', function (e) {
			Ti.API.info("executing approveFriendRequest handler");
			var requesters = [],
				currentUser = acs.currentUser(),
				requesterId = e.user_id;
			requesters.push(requesterId);
			if (currentUser && currentUser.id !== requesterId) {
				acs.approveFriendRequests(requesters, acs.approvedRequestNotification);				
			}
			else {
				Ti.API.info("got a request to add self as a friend. do nothing currentUser is " + currentUser);
			}
			
		});
		
		// subscribe to notifications
		acs.subscribeNotifications('test');	
	}
	
	
		// should be called after we have a logged in user
	function initNotifications () {
		var acs = require('lib/acs');
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
		        Ti.API.warn("failed to register push notifications: " + e);
		    },
		    // called when app receives a push notification
		    callback : function(e) {
				Ti.API.info('PUSH NOTIFICATION: Fashionista received a push notification ');
				var customPayload = e.data.custom,
					notificationType = customPayload.type,
					senderId = customPayload.user_id,
					message = e.data.alert,
					currentUser = acs.currentUser();
				Ti.API.info(notificationType + " \n time " + Date.now());
				
				if (acs.currentUser() && acs.currentUser().id === senderId) {
					Ti.API.info("PUSH Notification was sent by current user. No further action");
					return;
				}
				
				switch (notificationType) {
					case 'newPost':
						Ti.API.info("FIRE EVENT: NEW POST from " + senderId);
						Ti.App.fireEvent('newFriendPost');
					break;
					case 'friend_request':
						Ti.API.info("Notification Type: FRIEND REQUEST from " + senderId + " to " + currentUser);
						Ti.App.fireEvent('approveFriendRequest', {"user_id": senderId});
					break;
					case 'friend_approved':
					Ti.API.info("Notification Type: FRIEND APPROVED from " + senderId + " to " + currentUser);
					break;
					default:
					Ti.API.info('Unknown Notification Type: ' +  notificationType + ' from ' + senderId + " to " + currentUser);
				}
				// FIXME: bring up a temporary overlay instead of an alert which looks too much like the os alert for push notifications
		        Ti.UI.createAlertDialog({
		            title : 'From ' + senderId + " via Fashionista",
		            message : JSON.stringify(message)  //if you want to access additional custom data in the payload
		        }).show();
				
		    }
		});
	}

	
	exports.initSubscriptions = initSubscriptions;
	exports.initNotifications = initNotifications;
	
} ());
