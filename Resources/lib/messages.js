/**
 * @author MONIQUE BARBANSON
 */

( function (){
	'use strict';
	var Cloud = require('ti.cloud');
		
	function createMessage(toIds, messageBody, messageSubject, successCallback, errorCallback) {
		Cloud.Messages.create({
		    to_ids: toIds,
		    body: escape(messageBody),
		    subject: messageSubject
		}, function (e) {
		    if (e.success) {
		        var message = e.messages[0];
		        /*
		        Ti.API.info('Success:\n' +
		            'id: ' + message.id + '\n' +
		            'subject: ' + message.subject + '\n' +
		            'body: ' + message.body + '\n' +
		            'updated_at: ' + message.updated_at);
		            */
				if (successCallback) {
					successCallback(e.messages);
				}
		    } else {
		        Ti.API.error('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				if (errorCallback) {
					errorCallback();
				} 
		    }
		});	
	}
	
	
	function SendMessageToAllFriends(messageBody, messageSubject, successCallback, errorCallback) {
		var acs = require('lib/acs'),
			Flurry = require('sg.Flurry'),
			currentUserId = acs.currentUserId();
		acs.getFriendsList(function (friends) {
					var toIds,
						excludeSelf = function (id) { return id !== currentUserId;},
						getUserId = function(user) { return user.id;};
					if (friends) {
						if (friends.length === 1) {
							toIds = friends[0].id;	
						}
						else if (friends.length > 1) {
							friends = friends.map(getUserId);
							friends = friends.filter(excludeSelf);
							toIds = friends.join(',');	
						}
						else {
							// no ids to send a message to, bail
							Ti.API.info("no ids to send a message to, bail");
							return;
						}
						createMessage(toIds, messageBody, messageSubject, successCallback, errorCallback);
					}
		}, 
		function () {
			Ti.API.error("not calling createMessage since getFriendsList got an error");
			Flurry.logEvent('SendMessageToAllFriendsError');	
		});	
	}
	

	function showInbox(successCallback, errorCallback) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			currentUser = acs.currentUser(),
			i = 0, message = null;
		Flurry.logEvent('calling Cloud.Messages.showInbox', {'username': currentUser.username, 'email': currentUser.email});
		Cloud.Messages.showInbox(function (e) {
		    if (e.success) {
		        Ti.API.info ('Success:\n' +
		            'Count: ' + e.messages.length);
		        for (i = 0; i < e.messages.length; i+=1) {
		            message = e.messages[i];
		            /*
		            Ti.API.info('Success:\n' +
		                'id: ' + message.id + '\n' +
		                'subject: ' + message.subject + '\n' +
		                'body: ' + message.body + '\n' +
		                'updated_at: ' + message.updated_at);
		                */
		        }
				if (successCallback) {
					successCallback(e.messages);
				}
		    } else {
		        Ti.API.error('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				if (errorCallback) {
					errorCallback();
				} 
		    }
		});
}

	exports.createMessage = createMessage;
	exports.SendMessageToAllFriends = SendMessageToAllFriends;
	exports.showInbox = showInbox;	
}());
