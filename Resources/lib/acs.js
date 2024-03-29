/**
 * Library to wrap app-specific functionality around the ACS APIs
 * Copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 * @author: Monique Barbanson
 */


(function () {
	'use strict';


	// a couple local variables to save state
	//FIXME define a userModel with additional properties like hasRequestedFriends etc...
	var privCurrentUser = null,
		cachedFriendIds = null,
		Cloud = require('ti.cloud');

	function checkInternetConnection (e) {
		if (e.message.indexOf("'null' is not an object (evaluating 'n.trim')") > -1) {
			alert("Sorry - Fashionist requires an internet connection. Your device is offline. Please make sure you are connected to the internet.");
		}			
	}
	
	function currentUser () {
		return privCurrentUser;
	}
	
	function currentUserId () {
		return (privCurrentUser? privCurrentUser.id : null);
	}
	
	function getSavedFriendIds () {
		return cachedFriendIds;
	}

	function setSavedFriendIds (value) {
		cachedFriendIds = value;
	}
		
	function setCurrentUser (cu) {
		privCurrentUser = cu;
	}
	
	function setHasRequestedFriends(val) {
		privCurrentUser.hasRequestedFriends = val;
	}
	
	function getHasRequestedFriends() {
		return privCurrentUser.hasRequestedFriends;
	}
	
	function getPhotoCollectionId(user) {
		if (user && user.custom_fields) {
			return user.custom_fields.photoCollectionId;
		}
		return null;
	}
	

	function subscribeNotifications (channelName, successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		
		Ti.API.info("remoteDeviceUUID " + Ti.Network.remoteDeviceUUID);
		Cloud.PushNotifications.subscribe({
		    channel: channelName,
		    device_token: Ti.Network.remoteDeviceUUID,
		    type: 'ios'
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Successfully subscribed current user to push notifications for channel ' + channelName);
				Flurry.logEvent('Cloud.PushNotifications.subscribe', {'channel': channelName, 'device_token': Ti.Network.remoteDeviceUUID, 'result': 'success'});
		        if (successCallback) {
					successCallback();
		        }
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('subscribeNotifications', {'message': e.message, 'error': e.error});			            
	            checkInternetConnection(e);
	            if (errorCallback) {
					errorCallback();
	            }
		    }
		});
	}
	
	function unsubscribeNotifications (channelName, callback) {
		var Flurry = require('sg.flurry');
		
		//if (!Ti.Network.remoteNotificationsEnabled || !Ti.Network.remoteDeviceUUID) { return; }
		Ti.API.info("remoteDeviceUUID " + Ti.Network.remoteDeviceUUID);
		
		Cloud.PushNotifications.unsubscribe({
		    //channel: channelName,
		    device_token: Ti.Network.remoteDeviceUUID
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('unsusbcribe Notifications Success');
				Flurry.logEvent('Cloud.PushNotifications.unsubscribe', {'channel': channelName, 'device_token': Ti.Network.remoteDeviceUUID, 'result': 'success'});
		        
		    } else {
		        Ti.API.info('Error:  unsubscribeNotifications \\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('unsubscribeNotifications', {'message': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
		    // always execute callback, whether or not we successfully unregistered
		    if (callback) { callback(); }
		});		
	}	

	// login, logout
	function login(username, password, successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		
		Cloud.Users.login({
		    login: username,
		    password: password
		}, function (e) {
		    if (e.success) {
				var Notifications = require('ui/common/notifications');

				privCurrentUser = e.users[0];
				setHasRequestedFriends(false);
				if (!privCurrentUser.custom_fields) {
					privCurrentUser.custom_fields = {};
				}
				Cloud.sessionId = e.meta.session_id;
				// save the new session id
				Ti.App.Properties.setString('sessionId', Cloud.sessionId);			
				Ti.API.info("Successfully Logged in " + privCurrentUser.username + " saved sessionId " + Cloud.sessionId);
				// once we have a logged in user, setup Notifications	
				Notifications.initNotifications();	
				successCallback(e);
				
				Flurry.logEvent('login', {'username': username, 'result': 'success'});			            
				
		    } else {
		        Ti.API.info('Error: acs.login e.success ' + e.success + '\n' + (e && ((e.error && e.message) || JSON.stringify(e))));
		        alert(e.message);
				Flurry.logEvent('login', {'errorMessage': e.message, 'error': e.error});			            
		        
	            checkInternetConnection(e);
		        privCurrentUser = null;
				errorCallback(e.message);
		    }
		});	
	}
	
	// logout user and cancel all subscriptions so APS can stop sending notifications to this user
	function logout(callback) {
		var Facebook = require('/lib/facebook'),
			fb = require('facebook'),
			Flurry = require('sg.flurry'),
			doLogout = function () {
							Cloud.Users.logout(
								function (e) {
									    if (e.success) {
											Ti.API.info("Logged out of Fashionist and unsubscribed from fashionist channel");
									        privCurrentUser = null;
									        // clear session id
											Ti.App.Properties.setString('sessionId', null);
											// invoke UI callback
									        if (callback) { callback(e); }
									        
											Flurry.logEvent('logout', {'result': 'success'});			            
									        
									    }
									    else {
											Ti.API.info("Logout call returned " + e.success + " logoutCallback will not be executed.");
											Flurry.logEvent('logout', {'errorMessage': e.message, 'error': e.error});			            
											
								            checkInternetConnection(e);
									    }
									    cachedFriendIds = null;
								}
							);				
					};
		// do not log out of facebook to clear fb.loggedIn etc...Next time user logs in Fashionist should remember that it was authroized already	
		//if (fb.getLoggedIn()) { fb.logout(); fb.setUid(null);}			
		unsubscribeNotifications("fashionist", doLogout);
	}	
	
	
	function updateUser(dict) {
		var Flurry = require('sg.flurry');
		Cloud.Users.update(dict, 
				function (e) {
			    if (e.success) {
			        var user = e.users[0];
			        // update our current user
			        privCurrentUser = user;
			        Ti.API.info('Success: updated current user \\n' + dict);
					Flurry.logEvent('updateUser', {'username': user.username, 'email': user.email, 'result': 'success'});
			    } else {
			        alert('Error:\\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
					Flurry.logEvent('updateUser', {'errorMessage': e.message, 'error': e.error});			            
			    }
			});
	}
	
	
	function setPhotoCollectionId(user, collectionId) {
		if (user && user.custom_fields) {
			user.custom_fields.photoCollectionId = collectionId;
			if (collectionId) {
				updateUser({custom_fields: {photoCollectionId: collectionId}});
			}
		}
	}
	
		
	
	function createUser (username, email, password, successCallback, errorCallback, doNotRepeat) {
		var Flurry = require('sg.flurry'); 
		// ACS API requires password & confirm, but we do the checking elsewhere so use the same for both here
		Cloud.Users.create({
			username: username,
			template: 'welcome',
			email: email,
			password: password,
			password_confirmation: password,
			custom_fields: {likes: null, comments: null}
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('user = ' + JSON.stringify(e.users[0]));
				var Notifications = require('ui/common/notifications');
				//FIXME call createUserModel to initialize all properties including hasRequestedFriends etc...
		        privCurrentUser = e.users[0];
				Flurry.logEvent('createUser', {'username': privCurrentUser.username, 'email': privCurrentUser.email, 'result': 'success'});

		        // Cloud.sessionId is associated with currentUser. Save it and retrieve current user info from it
				Ti.App.Properties.setString('sessionId', Cloud.sessionId);			
				Ti.API.info("Logged in " + privCurrentUser.username + " saved sessionId " + Ti.App.Properties.getString('sessionId'));
				
				// once we have a logged in user, setup Notifications	
				Notifications.initNotifications();	
				
		        successCallback(e);
		    } else if (e.code === 400 && Ti.App.sessionId && !doNotRepeat) {
				logout();
				createUser(username, email, password, successCallback, errorCallback, true);	
		    }
		    else
		    {
				Ti.API.error('Error create User failed' + e.message);
				alert(e.message);
	            checkInternetConnection(e);
				privCurrentUser = null;
				Flurry.logEvent('createUser', {'errorMessage': e.message, 'error': e.error});			            
				
				errorCallback(e);
		    }
		});
	}
	
	
	// get user details 
	function getCurrentUserDetails(successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		Cloud.Users.showMe(function (e) {
	        if (e.success) {
	            var user = e.users[0],
					Notifications = require("ui/common/notifications");
	            Ti.API.info('Retrieved current user:\\n' +
	                'id: ' + user.id + '\\n' +
	                'username: ' + user.username + '\\n' +
	                'email: ' + user.email + '\\n');
	            setCurrentUser(user);
	            Flurry.setUserID(user.username);
				setHasRequestedFriends(false);
				if (!Ti.Network.getRemoteNotificationsEnabled()) {
					Ti.API.info("remote notifications not enabled, alling initNotifications");
					Notifications.initNotifications();										
				}
				if (successCallback) { successCallback();}
				Flurry.logEvent('Cloud.Users.showMe', {'username': user.username, 'email': user.email, 'result': 'success'});
				
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)) + " Please exit and start up again");
				Flurry.logEvent('showUser', {'errorMessage': e.message, 'error': e.error});			            
	                
	            checkInternetConnection(e);
	            Ti.App.Properties.setString('sessionId', null);
	    
	            if (errorCallback) { errorCallback(); }
	        }
		});		
	}
	
	
	function getUserDetails(userId, successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		Cloud.Users.show({user_id: userId}, function (e) {
	        if (e.success) {
	            var user = e.users[0],
					Notifications = require("ui/common/notifications");
	            Ti.API.info('Retrieved user:\\n' + 'id: ' + userId + '\\n');				
				if (successCallback) { successCallback(user);}
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)) + " Please exit and start up again");
				Flurry.logEvent('showUserError', {'errorMessage': e.message, 'error': e.error});			                        
	            checkInternetConnection(e);
	            if (errorCallback) { errorCallback(); }
	        }
		});		
	}
	
	
	function queryUsers (query, successCallback, errorCallback, pageNum) {
		var i, user, 
			Flurry = require('sg.flurry');
		Cloud.Users.query({
		    page: pageNum,
		    per_page: 20,
		    where: query
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('queryUsers Success:\n' +
		            'Count: ' + e.users.length);
                successCallback(e.users, query);
				Flurry.logEvent('Cloud.Users.query', {'result': 'success'});
                
		    } else {
		        Ti.API.info('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('queryUser', {'message': e.message, 'error': e.error});			            
		            
	            errorCallback(e);
		    }
		});		
	}
	
	
	
	// may want to pass in a callback from caller later on
	function createUserPhotoCollection(user, name) {
		// create a photo collection and add it to the current user's properties
		var Flurry = require('sg.flurry');		
	    Cloud.PhotoCollections.create({
	        name: name
	    }, function (e) {
	        if (e.success) {
	            var collection = e.collections[0];
	            setPhotoCollectionId(user, collection.id);
	            Ti.API.info('Created photo collection for user:\\n' +
	                'id: ' + collection.id + '\\n' +
	                'name: ' + collection.name + '\\n' +
	                'count: ' + collection.counts.total_photos + '\\n' +
	                'updated_at: ' + collection.updated_at);
				Flurry.logEvent('Cloud.PhotoCollections.create', {'username': user.username, 'email': user.email, 'result': 'success'});
	                
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('createUserPhotoCollection', {'message': e.message, 'error': e.error});			            
	                
	            checkInternetConnection(e);
	        }
	    });
	}
	
	// may want to pass in a callback from caller later on
	function getUserPhotoCollection() {
		var Flurry = require('sg.flurry');
		
		// create a photo collection and add it to the current user's properties
	    Cloud.PhotoCollections.search({
	        user_id: currentUserId()
	    }, function (e) {
	        if (e.success) {
	            var collection = e.collections[0];
	            setPhotoCollectionId(privCurrentUser, collection.id);
	            Ti.API.info('Found photo collection for user:\\n' +
	                'id: ' + collection.id + '\\n' +
	                'name: ' + collection.name + '\\n' +
	                'count: ' + collection.counts.total_photos + '\\n' +
	                'updated_at: ' + collection.updated_at);
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('getUserPhotoCollection', {'message': e.message, 'error': e.error});			            
	                
	            checkInternetConnection(e);
	        }
	    });
	}
	
	
	function getUserCollectionIdPhotos(collectionId, callback) {
		var Flurry = require('sg.flurry');
		try {
		    Cloud.PhotoCollections.showPhotos({
		        page: 1,
		        per_page: 20,
		        collection_id: collectionId
		    }, function (e) {
		        if (e.success) {
		            if (!e.photos) {
		                Ti.API.info('No photos');
		            } else {
						var photos = e.photos,
							i, ilen, photo;
						privCurrentUser.custom_fields.photos = photos;
		                Ti.API.info('Got user photos:\\n' +
		                    'Count: ' + photos.length);
		                /*  
		                for (i = 0, ilen = photos.length; i < ilen; i = i + 1) {
		                    photo = photos[i];
		                    Ti.API.info('photo:\\n' +
		                        'id: ' + photo.id + '\\n' +
		                        'name: ' + photo.filename + '\\n' +
		                        'updated_at: ' + photo.updated_at);
		                }
		                */
		                callback(photos);
		            }
		        } else {
		            Ti.API.info('Error:\\n' +
		                ((e.error && e.message) || JSON.stringify(e)));
					Flurry.logEvent('getUserCollectionIdPhotos', {'message': e.message, 'error': e.error});			            
		                
		            checkInternetConnection(e);
		        }
		    });
		}
		catch (ex) {
			Ti.API.info("Cloud.PhotoCollections.showPhotos threw an exception " + ex.message);
		}
	}
	
	
/*	
	function uploadPhoto (image, collectionId, callback) {
		var Flurry = require('sg.flurry');
		
		Cloud.Photos.create({
	        photo: image,
	        collection_id: collectionId,
	        'photo_sync_sizes[]': 'thumb_100'
	    }, function (e) {
	        if (e.success) {
	            var photo = e.photos[0];
				Flurry.logEvent('Cloud.Photos.create', {'result': 'success'});
	            
	            Ti.API.info ('Success:\\n' +
	                'id: ' + photo.id + '\\n' +
	                'filename: ' + photo.filename + '\\n' +
	                'size: ' + photo.size,
	                'updated_at: ' + photo.updated_at); 
	                
	             if (callback) {
					callback(image, photo);
	             }
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('uploadPhoto', {'message': e.message, 'error': e.error});			            
	                
	            checkInternetConnection(e);
	        }
	    });
	}
*/	
	
	function getUrlForPhotoId(photoId, callback) {
		Cloud.Photos.show({
			photo_id: photoId
			},
			function(data) {
				var photo = null, 
					originalImgUrl = null;
				if (data.response && data.response.photos && data.response.photos.length > 0) {
					photo = data.response.photos[0];
					originalImgUrl = photo.urls.original;
					Ti.API.info("photo details for " + photoId + " url " + originalImgUrl);
				}
				return callback(originalImgUrl);
			} 
		);
	}
	
	
	
	function getUserPhotos (user, photos) {
		if (user && user.custom_fields) {
			return user.custom_fields.photos;
		}
		return null;
	}
	
	function setUserPhotos (user, photos) {
		if (user && user.custom_fields) {
			user.custom_fields.photos = photos;
		}
	}
	



	
// notifications
	function notifyUsers (channel, message, userIds, customPayload, successCallback) {
		var Flurry = require('sg.flurry'),
			messages = require('lib/messages');
		
		// if not device is not registered for push notifications
		// or running on simulator, bail
		Ti.API.info("sending push notification " + message + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
		Cloud.PushNotifications.notify({
		    channel: channel,
		    to_ids: userIds,
		    payload: customPayload
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Successfully notified friends ' + userIds + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
				Flurry.logEvent('Cloud.PushNotifications.notify', {'message': message, 'to': userIds, 'result': 'success'});
				if (successCallback) {
					successCallback(userIds);
				}
		        
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.PushNotifications.notify', {'errorMessage': e.message, 'error': e.error});			              
				checkInternetConnection(e);
		    }
		});
		messages.createMessage(userIds, message, JSON.stringify(customPayload.f));
	}


	function approvedRequestNotification(userIds) {
		Ti.API.info("approvedRequestNotification " + userIds);		
		var msg = "Your friend request to " + currentUser().username + " has been approved. You are mutual friends!",
			badge = 1,   //Ti.UI.iPhone.getAppBadge() + 1,
			customPayload = {
								"f": {
											"uid": currentUser().id, 
											"type": 'friend_approved'
										},
								"badge": badge,
								"sound": "default",
								"alert": msg
							};
		Ti.API.info(msg + " to " + userIds);
		notifyUsers('fashionist', msg, userIds, customPayload);		
	}
	
	
	function newFriendNotification(userIds, successCallback) {
		var msg = "You have a new friend request from " + privCurrentUser.username + " !",
			badge = 1, //Ti.UI.iPhone.getAppBadge() + 1,
			userId = currentUserId(),
			customPayload = {
								"f": {
											"uid": userId, 
											"type": 'friend_request'
										},
								"badge": badge,
								"sound": "default",
								"alert": msg
							},
			Flurry = require('sg.flurry');

		notifyUsers('fashionist', msg, userIds, customPayload, successCallback);
		Flurry.logEvent('newNotification', {'message': msg, 'to': userId, 'type': 'friend_request', 'result': 'success'});
		
	}
	
	
	function newNotification (post, notificationType, notificationContent, notifyAllFriends, user_ids) {
		// if device is not registered for push notifications
		// or running on simulator, bail
		Ti.API.info("sending push notification " + notificationContent + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
		//always send notification from current user
		var Flurry = require('sg.flurry'),
			messages= require('lib/messages'),
			username = '@' + privCurrentUser.username, //post.user.username,
			messageBody = String.format(Ti.Locale.getString('commentNotificationBody'), notificationContent),
			alertBody,
			userId = currentUserId(),
			badge = 1, //Ti.UI.iPhone.getAppBadge() + 1,
			fPayload = {
						"pid": post.id, 
						"uid": userId, //post.user.id, 
						"type": notificationType
					},
			customPayload,
			notifyCallback = function (e) {
			    if (e.success) {
			        Ti.API.debug('Successfully notified friends ' + (notifyAllFriends ? 'all' : user_ids || userId) + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
			        Ti.UI.iPhone.setAppBadge(badge);			        
			    } else {
			        Ti.API.error('Error:\\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
					Flurry.logEvent('newNotification', {'errorMessage': e.message, 'error': e.error});			             
					checkInternetConnection(e);
			    }
			},
			paramDict;
		
		if (notificationType === 'newLike') {
			messageBody = String.format(Ti.Locale.getString('likeNotificationBody'), notificationContent);		
		}
		else if (notificationType === 'newPost') {
			messageBody = String.format(Ti.Locale.getString('newPostNotificationBody'), notificationContent);					
		}
		alertBody = (username + " " + messageBody).substr(0,119); // limit notification to 120 chars due to IOS push notification limitation to 255 chars
		customPayload = {
		    "f": fPayload,
			"badge": badge,
			"sound": "default",							
		    "alert" : alertBody
		};
			
		if (!fPayload) {
			alert("noPayload");
		}			
		if (notifyAllFriends) {
			paramDict = {
					response_json_depth: 2,
				    channel: 'fashionist',
				    friends: true,
				    payload: customPayload
			    };
		    messages.SendMessageToAllFriends(messageBody, JSON.stringify(fPayload));			
		}
		else {
			paramDict = {
				response_json_depth: 2,
			    channel: 'fashionist',
			    to_ids: user_ids || userId,    
			    payload: customPayload
		    };
		    messages.createMessage(user_ids || userId, messageBody, JSON.stringify(fPayload));			
		}
		Ti.API.info('calling Cloud.PushNotifications.notify, notificationType: ' + notificationType);		
		Cloud.PushNotifications.notify(paramDict, notifyCallback);
	}
	
	
	function newPostNotification (post) {
		var caption = "";
		if (post.content === Ti.Locale.getString('nocaption')) {
			caption = ""; 
		}
		else {
			caption = unescape(post.content);
		}
		newNotification(post, "newPost", caption, true);
	}


	function newCommentNotification (post, commentText, otherComments) {
		var emails = require('lib/emails'),
			caption = "",
			poster = post && post.user,
			posterId = post && post.user && post.user.id,
			selfId = currentUserId(),
			otherCommenters = [],
			getUser = function(comment) { return comment.user;},
			atMentions,
			stripLeadingAt = function(s) {return s.replace(/^@/, "");},
			userNameQuery = function(uname) { return {"username": uname}; },
			getUserId = function (user) { return user ? user.id: null;},
			excludeSelf = function (user) { if (user && user.id !== selfId) { return user;}},			
			mentionnedUsers,
			whereClause,
			successCallback = function (users) {
				var allRecipients = users.concat(otherCommenters),					
					userIdList,
					userIds;
					
				allRecipients = allRecipients.filter(excludeSelf);
				allRecipients.push(poster);
				userIdList = (allRecipients && allRecipients.length > 0) ? allRecipients.map(getUserId) : null;	
				userIds = userIdList ? userIdList.join() : null;
					
				newNotification(post, "comment", unescape(commentText), false, userIds);
				//emails.sendNewActivityEmail('newComment', allRecipients, caption);			
			};
		if (post.content !== Ti.Locale.getString('nocaption')) {
			caption = unescape(post.content);
		}
		
		otherCommenters = otherComments.map(getUser);
		otherCommenters = otherCommenters.filter (function (user) { return user;});  //remove null users if any
		atMentions = commentText.match(/[\b@][\w]*/gm);
		mentionnedUsers = atMentions ? atMentions.map(stripLeadingAt) : null;
		whereClause = mentionnedUsers? mentionnedUsers.map(userNameQuery) : null;
		if (whereClause && mentionnedUsers && mentionnedUsers.length > 0) {
			//Flurry.logEvent('notifyMentionnedInComment', {'message': commentText, 'to': atMentions, 'type': 'comment'});
			queryUsers({"$or": whereClause}, successCallback, successCallback, 1);
		}
		else if (otherCommenters && otherCommenters.length > 0) {
			successCallback([]);	
		}
		else {			
			newNotification(post, "comment", unescape(commentText), false, posterId ? posterId.toString() : null);
			//emails.sendNewActivityEmail('newComment', [poster], caption);				
		}				
	}
	
	
	function newLikeNotification (post) {
		var emails = require('lib/emails'),
			caption = "",
			author = post && post.user,
			authorId = post && post.user && post.user.id;
		if (post.content === Ti.Locale.getString('nocaption')) {
			caption = "";
		}
		else {
			caption = unescape(post.content);
		}
		newNotification(post, "newLike", caption, false, authorId ? authorId.toString() : null);
		//emails.sendNewActivityEmail('new', [author], caption);				
	}




	
	// Friends
	function removeFriends (friends, callback) {
		Ti.API.info('acs.removeFriends');
		var userIdList = friends.join(),
			Flurry = require('sg.flurry');

		Cloud.Friends.remove({
		    user_ids: userIdList,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Friend(s) removed ' + userIdList);
				Flurry.logEvent('Cloud.Friends.remove', {'friends': userIdList, 'result': 'success'});			            
		        
				callback(userIdList);
		    } else {
		        Ti.API.info('Error in removeFriends:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('removeFriends', {'errorMessage': e.message, 'error': e.error});  
	            checkInternetConnection(e);
		    }
		});		
	}	
	
	function addFriends (friends, callback) {
		Ti.API.info('acs.addFriends');
		var userIdList = friends.join(),
			Flurry = require('sg.flurry');
		Cloud.Friends.add({
		    user_ids: userIdList,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Friend(s) added ' + friends);
				Flurry.logEvent('Cloud.Friends.add', {'friends': userIdList, 'result': 'success'});			            
		        
				callback(userIdList);
		    } else {
		        Ti.API.info('Error in addFriends:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('addFriends', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
		});		
	}
	
	// friends: list of user ids to approve as friends
	function approveFriendRequests (friends, successCallback, errorCallback) {
		Ti.API.info('acs.approveFriendRequests ' + friends.toString());
		var userIdList = friends.join(),
			Flurry = require('sg.flurry');

		Cloud.Friends.approve({
		    user_ids: userIdList,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Friend(s) approved ' + userIdList);
				Flurry.logEvent('Cloud.Friends.approve', {'friends': userIdList, 'result': 'success'});			                 
				approvedRequestNotification(userIdList);
				Ti.API.info('callback called ' + approvedRequestNotification.toString());
				cachedFriendIds = cachedFriendIds.concat(friends);
				if (successCallback) { successCallback(e); }
		    } else {
		        Ti.API.error('Error in approveFriends: ' + e.message);
				Flurry.logEvent('approveFriendRequest', {'errorMessage': e.message, 'error': e.error});			            
		        
	            checkInternetConnection(e);
	            if (errorCallback) { errorCallback(e); }
		    }
		});		
	}
	
	
	function getFriendRequests (callback) {
		Ti.API.info('acs.getFriendRequests');
		var Flurry = require('sg.flurry');
		
		Cloud.Friends.requests(function (e) {
		    if (e.success) {
				var friendRequests = e.friend_requests;
		        Ti.API.info('Friend(s) requests ' + friendRequests);
				callback(friendRequests);
		    } else {
		        Ti.API.error('Error in getFriendRequests:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('getFriendRequests', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
		});		
	}


	function getFriendsList (successCallback, cleanupAction) {
		var userId = currentUserId(),
			Flurry = require('sg.flurry'),
			getUserId = function(user) {return user.id; };		
		Cloud.Friends.search({
		    user_id: userId,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Success:\\n' +
		            'Count: ' + e.users.length);
				Flurry.logEvent('Cloud.Friends.search', {'userId': userId, 'result': 'success'});
				cachedFriendIds = e.users.map(getUserId);			            
				if (successCallback) {
					successCallback(e.users, cleanupAction);	
				}
			} else {
				if (cleanupAction) { cleanupAction(); }
				Ti.API.info('getFriendsList Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Friends.search', {'errorMessage': e.message, 'error': e.error});			            
	            checkInternetConnection(e);
		    }
		});
	}
	
			
	// Posts
	function addPost (postModel, pPhoto, successCallback, errorCallback) {

		var Flurry = require('sg.flurry'),
			sync_sizes = 'iphone', 
		    pBody = postModel.caption,
		    tags_list = postModel.tags.length > 0 ? postModel.tags.join() : null;
		Ti.API.info("Posting..." + pBody + " photo " + pPhoto + " callback " + successCallback);
		Cloud.Posts.create({
		    content: pBody,
		    photo: pPhoto,
			acl_name: Ti.Locale.getString('publicPostACLName'),		    
		    tags: tags_list,
		    //'photo_sizes[avatar]':'50x50#',
		    //'photo_sizes[preview]': '75x75#',
			'photo_sizes[android]': ((pPhoto.width*480)/640).toString() + 'x' + ((pPhoto.height*480)/640).toString(),  //'480x480#',
			'photo_sizes[iphone]':pPhoto.width.toString() + 'x' + pPhoto.height.toString(), //'640x640#',
			'photo_sync_sizes[]': 'iphone',
			'photo_sizes[ipad]': ((pPhoto.width*768)/640).toString() + 'x' + ((pPhoto.height*768)/640).toString()  //'768x768#'
		}, function (e) {
		    if (e.success) {
		        var post = e.posts[0];
				Flurry.logEvent('Cloud.Posts.create', {'content': pBody, 'result': 'success'});			            
		        
		        Ti.API.info('Success:\\n' +
		            'id: ' + post.id + '\\n' +
		            'title: ' + post.title + '\\n' +
		            'content: ' + post.content + '\\n' +
		            'tags: ' + post.tags + '\\n' +
		            'updated_at: ' + post.updated_at);
		        if (successCallback) {successCallback(post);}
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.create', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
	            if (errorCallback) {errorCallback();}
		    }
		});		
	}
	
	
	function showPost(savedPostId, successCallback, errorCallback) {
		Ti.API.info("get updated values for post " + savedPostId);
		var Flurry = require('sg.flurry');
		
		Cloud.Posts.show({
		    post_id: savedPostId
		}, function (e) {
		    if (e.success) {
		        var post = e.posts[0];
				Flurry.logEvent('Cloud.Posts.show', {'postId': savedPostId, 'result': 'success'});			            
				if (successCallback) {successCallback(post);}
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.show', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
	            if (errorCallback) {
					errorCallback();
	            }   
		    }
		});		
	}
	
	
	function updatePost (postId, pTitle, pBody, callback) {
		Ti.API.info("Update post..." + pBody + " callback " + callback);
		var Flurry = require('sg.flurry');
		
		Cloud.Posts.update({
			post_id: postId,
		    content: pBody,
		    title: pTitle
		}, function (e) {
		    if (e.success) {
		        var post = e.posts[0];
		        Ti.API.info('Success:\\n' +
		            'id: ' + post.id + '\\n' +
		            'title: ' + post.title + '\\n' +
		            'content: ' + post.content + '\\n' +
		            'updated_at: ' + post.updated_at);
		        callback(post);
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.update', {'errorMessage': e.message, 'error': e.error});			            
	            checkInternetConnection(e);
		    }
		});		
	}
	
	
	function removePost(savedPostId, successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		
		Cloud.Posts.remove({
		    post_id: savedPostId
		}, function (e) {
		    if (e.success) {
				Flurry.logEvent('Cloud.Friends.remove', {'postId': savedPostId, 'result': 'success'});			            
		        if (successCallback) { successCallback(e); }
		    } else {
		        alert('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.remove', {'errorMessage': e.message, 'error': e.error});			            
		            
		        if (errorCallback) { errorCallback(e); }
		    }
		});		
	}
	
	
	function getFriendsPosts (friendsList, postAction, cleanupAction) {
		Ti.API.info('acs.getFriendsPosts');
		var Flurry = require('sg.flurry'),
			getID = function(user) { return user.id;},
			usersList = friendsList;
		usersList.splice(usersList.length, 0, privCurrentUser);
		Cloud.Posts.query({
		    page: 1,
		    per_page: Ti.App.maxNumPosts,
		    response_json_depth: 2,
		    order: '-created_at',
		    where: {
		        "user_id": { '$in': usersList.map(getID)  }
		    }
		}, function (e) {
		    if (e.success) {
				Flurry.logEvent('Cloud.Posts.query success', {'type': 'friends'});			            
				if (postAction) { postAction (e.posts);}
		    } else {
				if (cleanupAction) { cleanupAction(); }
		        Ti.API.info('Error: getFriendsPosts\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.query error', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
		});	
	}
	
	
	// query on tags
	function getPublicPosts (postAction, cleanupAction) {
		Ti.API.info('acs.getPublicPosts');
		var Flurry = require('sg.flurry');

		Cloud.Posts.query({
		    page: 1,
		    per_page: Ti.App.maxNumPosts,
		    response_json_depth: 2,
		    order: '-created_at',
		    where: {
				"tags_array": {"$nin": [Ti.Locale.getString('friendsOnlyHashTag').toLowerCase()]}
		    }
		}, function (e) {
		    if (e.success) {
				if (postAction) { postAction (e.posts);}
				Flurry.logEvent('Cloud.Posts.query success', {'type': 'public'});
			} else {
		        Ti.API.info('Error: getPublicPosts\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.query error', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
			if (cleanupAction) { cleanupAction(); }
		});	
	}
	
	
	function getUserAvatar(user) {
		var avatar = null, facebookUID,
			FB = require('lib/facebook');
		if (user.photo && user.photo.processed) {
			avatar = user.photo.urls.small_240;
		}
		if (!avatar && user.external_accounts && user.external_accounts.length > 0) {
			facebookUID = FB.getLinkedFBId(user);
			avatar = 'https://graph.facebook.com/' + facebookUID + '/picture' ;
		}
		return avatar;
	}






	exports.getPhotoCollectionId = getPhotoCollectionId;
	exports.setPhotoCollectionId = setPhotoCollectionId;
	exports.login = login;
	exports.logout = logout;
	//exports.uploadPhoto = uploadPhoto;
	exports.updateUser = updateUser;
	exports.createUser = createUser;
	exports.queryUsers = queryUsers;
	exports.getCurrentUserDetails = getCurrentUserDetails;
	exports.getUserDetails = getUserDetails;
	exports.createUserPhotoCollection = createUserPhotoCollection;
	exports.getUserCollectionIdPhotos = getUserCollectionIdPhotos;
	exports.getUserPhotoCollection = getUserPhotoCollection;
	exports.currentUser = currentUser;
	exports.currentUserId = currentUserId;
	exports.setCurrentUser = setCurrentUser;
	exports.getUserPhotos = getUserPhotos;
	exports.setUserPhotos = setUserPhotos;
	exports.setHasRequestedFriends = setHasRequestedFriends;
	exports.getHasRequestedFriends = getHasRequestedFriends;
	exports.subscribeNotifications = subscribeNotifications;
	exports.newPostNotification = newPostNotification;
	exports.newCommentNotification = newCommentNotification;
	exports.newLikeNotification = newLikeNotification;		
	exports.newFriendNotification = newFriendNotification;
	exports.addFriends = addFriends;
	exports.removeFriends = removeFriends;
	exports.approveFriendRequests = approveFriendRequests;
	exports.getFriendRequests = getFriendRequests;
	exports.getFriendsList = getFriendsList;
	exports.addPost = addPost;
	exports.showPost = showPost;	
	exports.updatePost = updatePost;
	exports.removePost = removePost;
	exports.getFriendsPosts = getFriendsPosts;
	exports.getPublicPosts = getPublicPosts;
	exports.getUserAvatar = getUserAvatar;
	exports.getSavedFriendIds = getSavedFriendIds;
	exports.setSavedFriendIds = setSavedFriendIds;


} ());
