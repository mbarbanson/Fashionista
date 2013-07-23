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
		Cloud = require('ti.cloud'),
		Flurry = require('ti.flurry');

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
	
	
	function updateUser(dict) {
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
	
		
	
	function createUser (username, email, password, successCallback, errorCallback) { 
		// ACS API requires password & confirm, but we do the checking elsewhere so use the same for both here
		Cloud.Users.create({
			username: username,
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
		    } else {
				Ti.API.info('Error create User failed' + e.message);
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
		Cloud.Users.showMe(function (e) {
	        if (e.success) {
	            var user = e.users[0],
					Notifications = require("ui/common/notifications");
	            Ti.API.info('Retrieved current user:\\n' +
	                'id: ' + user.id + '\\n' +
	                'username: ' + user.username + '\\n' +
	                'email: ' + user.email + '\\n');
	            setCurrentUser(user);
				setHasRequestedFriends(false);
				Notifications.initNotifications();					
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
	
	
	function queryUsers (query, successCallback, errorCallback, pageNum) {
		var i, user;
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
	
	
	
	function uploadPhoto (image, collectionId, callback) {
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
	
	function subscribeNotifications (channelName) {
		Ti.API.info("remoteDeviceUUID " + Ti.Network.remoteDeviceUUID);
		Cloud.PushNotifications.subscribe({
		    channel: channelName,
		    device_token: Ti.Network.remoteDeviceUUID,
		    type: 'ios'
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Successfully subscribed current user to push notifications for channel ' + channelName);
				Flurry.logEvent('Cloud.PushNotifications.subscribe', {'channel': channelName, 'device_token': Ti.Network.remoteDeviceUUID, 'result': 'success'});
		        
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('subscribeNotifications', {'message': e.message, 'error': e.error});			            
	            checkInternetConnection(e);
		    }
		});
	}
	
	function unsubscribeNotifications (channelName, callback) {
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
	

	function notifyUsers (channel, message, userIds, customPayload, successCallback) {
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
							};
		notifyUsers('fashionist', msg, userIds, customPayload, successCallback);
		Flurry.logEvent('newNotification', {'message': msg, 'to': userId, 'type': 'friend_request', 'result': 'success'});
		
	}
	
	
	function newNotification (post, notificationType, notificationContent, notifyAllFriends, user_ids) {
		// if device is not registered for push notifications
		// or running on simulator, bail
		Ti.API.info("sending push notification " + notificationContent + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
		//always send notification from current user
		var username = '@' + privCurrentUser.username, //post.user.username,
			message = username + notificationContent,
			userId = currentUserId(),
			badge = 1, //Ti.UI.iPhone.getAppBadge() + 1,
			paramDict;
			
		if (notifyAllFriends) {
			paramDict = {
			response_json_depth: 2,
		    channel: 'fashionist',
		    friends: true,
		    payload: {
			    "f": {
						"pid": post.id, 
						"uid": userId, //post.user.id, 
						"type": notificationType
						},
				"badge": badge,
				"sound": "default",							
			    "alert" : message.substr(0, 119)
			}};			
		}
		else {
			paramDict = {
			response_json_depth: 2,
		    channel: 'fashionist',
		    to_ids: user_ids || post.user.id,    
		    payload: {
			    "f": {
						"pid": post.id, 
						"uid": userId, //post.user.id, 
						"type": notificationType
						},
				"badge": badge,
				"sound": "default",							
			    "alert" : message.substr(0,119)
			}};			
		}
				
		Cloud.PushNotifications.notify(
			paramDict, function (e) {
		    if (e.success) {
		        Ti.API.info('Successfully notified friends ' + user_ids || post.user.id + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
		        Ti.UI.iPhone.setAppBadge(badge);
				Flurry.logEvent('newNotification', 
									{
										'message': paramDict.payload['alert'],
										'to': userId, 
										'type': paramDict.payload['f']['type'],
										'result': 'success'
									});
		        
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('newNotifications', {'errorMessage': e.message, 'error': e.error});			            
		            
				checkInternetConnection(e);
		    }
		});
	}
	
	
	function newPostNotification (post) {
		var caption = "";
		if (post.content === Ti.Locale.getString('nocaption')) {
			caption = "";
		}
		else {
			caption = unescape(post.content);
		}
		newNotification(post, "newPost", ' posted a new picture ' + caption, true);
	}


	function newCommentNotification (post, commentText) {
		var caption = "",
			atMentions,
			stripLeadingAt = function(s) {return s.replace(/^@/, "");},
			userNameQuery = function(uname) { return {"username": uname}; },
			getUserId = function (user) { return user.id;},
			mentionnedUsers,
			whereClause,
			successCallback = function (users) {
				var userIdList = (users && users.length > 0) ? users.map(getUserId) : null,
					userIds = userIdList ? userIdList.join() : null;
				newNotification(post, "comment", ' commented: ' + unescape(commentText), false, userIds);			
			};
		if (post.content !== Ti.Locale.getString('nocaption')) {
			caption = unescape(post.content);
		}
		atMentions = commentText.match(/[\b@][\w]*/gm);
		mentionnedUsers = atMentions ? atMentions.map(stripLeadingAt) : null;
		whereClause = mentionnedUsers? mentionnedUsers.map(userNameQuery) : null;
		if (whereClause && mentionnedUsers && mentionnedUsers.length > 0) {
			//Flurry.logEvent('notifyMentionnedInComment', {'message': commentText, 'to': atMentions, 'type': 'comment'});
			queryUsers({"$or": whereClause}, successCallback, successCallback, 1);
		}
		else {
			//.logEvent('newCommentNotification', {'message': commentText, 'type': 'comment'});			
			newNotification(post, "comment", ' commented: ' + unescape(commentText), false);		
		}				
	}
	
	
	function newLikeNotification (post) {
		var caption = "";
		if (post.content === Ti.Locale.getString('nocaption')) {
			caption = "";
		}
		else {
			caption = unescape(post.content);
		}
		newNotification(post, "newLike", ' liked your post ' + caption, false);
	}



	// login, logout
	function login(username, password, successCallback, errorCallback) {
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
			doLogout = function () {
							Cloud.Users.logout(
								function (e) {
									    if (e.success) {
											Ti.API.info("Logged out of Fashionist and unsubscribed from fashionist channel");
									        privCurrentUser = null;
									        // clear session id
											Ti.App.Properties.setString('sessionId', null);
											// invoke UI callback
									        callback(e);
									        
											Flurry.logEvent('logout', {'result': 'success'});			            
									        
									    }
									    else {
											Ti.API.info("Logout call returned " + e.success + " logoutCallback will not be executed.");
											Flurry.logEvent('logout', {'errorMessage': e.message, 'error': e.error});			            
											
								            checkInternetConnection(e);
									    }
								}
							);				
					};
		// log out of facebook to clear Ti.Facebook.loggedIn etc...	
		if (Ti.Facebook.getLoggedIn()) { Ti.Facebook.logout(); Ti.Facebook.setUid(null);}			
		unsubscribeNotifications("fashionist", doLogout);
	}

	
	// Friends
	function removeFriends (friends, callback) {
		Ti.API.info('acs.removeFriends');
		var userIdList = friends.join();
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
		var userIdList = friends.join();
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
		var userIdList = friends.join();
		Cloud.Friends.approve({
		    user_ids: userIdList,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Friend(s) approved ' + userIdList);
				Flurry.logEvent('Cloud.Friends.approve', {'friends': userIdList, 'result': 'success'});			                 
				approvedRequestNotification(userIdList);
				Ti.API.info('callback called ' + approvedRequestNotification.toString());
				if (successCallback) { successCallback(e); }
		    } else {
		        Ti.API.info('Error in approveFriends: ' + e.message);
				Flurry.logEvent('approveFriendRequest', {'errorMessage': e.message, 'error': e.error});			            
		        
	            checkInternetConnection(e);
	            if (errorCallback) { errorCallback(e); }
		    }
		});		
	}
	
	
	function getFriendRequests (callback) {
		Ti.API.info('acs.getFriendRequests');
		Cloud.Friends.requests(function (e) {
		    if (e.success) {
				var friendRequests = e.friend_requests;
		        Ti.API.info('Friend(s) requests ' + friendRequests);
				callback(friendRequests);
		    } else {
		        Ti.API.info('Error in getFriendRequests:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('getFriendRequests', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
		});		
	}


	function getFriendsList (successCallback, cleanupAction) {
		var userId = currentUserId();
		Cloud.Friends.search({
		    user_id: userId,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Success:\\n' +
		            'Count: ' + e.users.length);
				Flurry.logEvent('Cloud.Friends.search', {'userId': userId, 'result': 'success'});			            

		       if (successCallback) {
					successCallback(e.users, cleanupAction);
					//privCurrentUser.savedFriends = e.users;		
				}
		    } else {
				if (cleanupAction) { cleanupAction(); }
		        Ti.API.info('getFriendsList Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Friends.search', {'errorMessage': e.message, 'error': e.error});			            
	            checkInternetConnection(e);
		    }
		});
	}
	
			
	// Posts
	function addPost (postModel, pPhoto, successCallback, errorCallback) {

		var sync_sizes = 'iphone', 
		    pBody = postModel.caption,
		    tags_list = postModel.tags.length > 0 ? postModel.tags.join() : null;
		Ti.API.info("Posting..." + pBody + " photo " + pPhoto + " callback " + successCallback);
		Cloud.Posts.create({
		    response_json_depth: 2,
		    content: pBody,
		    photo: pPhoto,
		    tags: tags_list,
		    'photo_sizes[avatar]':'50x50#',
		    'photo_sizes[preview]': '75x75#',
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
		Cloud.Posts.show({
		    post_id: savedPostId,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        var post = e.posts[0];
				Flurry.logEvent('Cloud.Posts.show', {'postId': savedPostId, 'result': 'success'});			            
		        /*
		        Ti.API.info('showPost success:\\n' +
		            'id: ' + post.id + '\\n' +
		            'title: ' + post.title + '\\n' +
		            'content: ' + post.content + '\\n' +
		            'updated_at: ' + post.updated_at);
		            */
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
		var getID = function(user) { return user.id;},
			usersList = friendsList;
		usersList.splice(usersList.length, 0, privCurrentUser);
		Cloud.Posts.query({
		    page: 1,
		    per_page: Ti.App.maxNumPosts,
		    order: '-created_at',
		    response_json_depth: 2,
		    where: {
		        "user_id": { '$in': usersList.map(getID)  }
		    }
		}, function (e) {
			var i,
				post,
				numPosts;
		    if (e.success) {
				numPosts = e.posts.length;
				Flurry.logEvent('Cloud.Posts.query', {'usersList': friendsList, 'type': 'friends'});			            
				
		        Ti.API.info('Success:\\n' +
		            'Count: ' + numPosts);
		         if (numPosts > 0) {
					for (i = 0; i < numPosts ; i = i + 1) {
					    post = e.posts[i];
					    if (postAction) { postAction(post); }
				   }
		         }  
		    } else {
		        Ti.API.info('Error: getFriendsPosts\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.query', {'errorMessage': e.message, 'error': e.error});			            
		            
	            checkInternetConnection(e);
		    }
			if (cleanupAction) { cleanupAction(); }
		});	
	}
	
	
	// query on tags
	function getPublicPosts (postAction, cleanupAction) {
		Ti.API.info('acs.getPublicPosts');

		Cloud.Posts.query({
		    page: 1,
		    per_page: Ti.App.maxNumPosts,
		    order: '-created_at',
		    response_json_depth: 2,
		    where: {
		        "$or": [{"tags_array": Ti.Locale.getString('findExactHashTag')}, 
		                {"tags_array": Ti.Locale.getString('findSimilarHashTag')},
		                {"tags_array": Ti.Locale.getString('publicHashTag')} ]
		    }
		}, function (e) {
			var i,
				post,
				numPosts;
		    if (e.success) {
				numPosts = e.posts.length;
		        Ti.API.info('Success:\\n' +
		            'Count: ' + numPosts);
		         if (numPosts > 0) {
					for (i = 0; i < numPosts ; i = i + 1) {
					    post = e.posts[i];
					    if (postAction) { postAction(post); }
				   }
		         }
				Flurry.logEvent('Cloud.Posts.query', {'type': 'public'});			            
		           
		    } else {
		        Ti.API.info('Error: getPublicPosts\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('Cloud.Posts.query', {'errorMessage': e.message, 'error': e.error});			            
		            
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
	exports.uploadPhoto = uploadPhoto;
	exports.updateUser = updateUser;
	exports.createUser = createUser;
	exports.queryUsers = queryUsers;
	exports.getCurrentUserDetails = getCurrentUserDetails;
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



} ());
