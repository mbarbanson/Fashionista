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
			        var user = e.users[0],
						hasRequestedFriends = getHasRequestedFriends();
			        // update our current user
			        privCurrentUser = user;
					setHasRequestedFriends(hasRequestedFriends);
			        Ti.API.info('Success: updated current user \\n' + dict);
			    } else {
			        alert('Error:\\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
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
			password_confirmation: password
			//custom_fields: {photos: null, photoCollection: null}
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('user = ' + JSON.stringify(e.users[0]));
				var Notifications = require('ui/common/notifications');
				//FIXME call createUserModel to initialize all properties including hasRequestedFriends etc...
		        privCurrentUser = e.users[0];
		        setHasRequestedFriends (false);
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
				if (successCallback) { successCallback(); }
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)) + " Please exit and start up again");
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
		    } else {
		        Ti.API.info('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
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
	        } else {
	            Ti.API.info('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
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
		// if not device is not registered for oush notifications
		// or running on simulator, bail
		/*
		if (!Ti.Network.remoteNotificationsEnabled || !Ti.Network.remoteDeviceUUID) {
			return;
		}
		*/
		Ti.API.info("remoteDeviceUUID " + Ti.Network.remoteDeviceUUID);
		Cloud.PushNotifications.subscribe({
		    channel: channelName,
		    device_token: Ti.Network.remoteDeviceUUID,
		    type: 'ios'
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Successfully subscribed current user to push notifications for channel ' + channelName);
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
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
		    } else {
		        Ti.API.info('Error:  unsubscribeNotifications \\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
	            checkInternetConnection(e);
		    }
		    // always execute callback, whether or not we successfully unregistered
		    if (callback) { callback(); }
		});		
	}
	

	function notifyUsers (channel, message, userIds, customPayload) {
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
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
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
	
	
	function newFriendNotification(userIds) {
		var msg = "You have a new friend request from " + privCurrentUser.username + " !",
			badge = 1, //Ti.UI.iPhone.getAppBadge() + 1,
			customPayload = {
								"f": {
											"uid": currentUserId(), 
											"type": 'friend_request'
										},
								"badge": badge,
								"sound": "default",
								"alert": msg
							};
		notifyUsers('fashionist', msg, userIds, customPayload);		
	}
	
	
	function newNotification (post, notificationType, notificationContent, notifyAllFriends, user_ids) {
		// if device is not registered for push notifications
		// or running on simulator, bail
		Ti.API.info("sending push notification " + notificationContent + ' remoteUUID ' + Ti.Network.remoteDeviceUUID);
		//always send notification from current user
		var username = '@' + privCurrentUser.username, //post.user.username,
			message = username + notificationContent,
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
						"uid": currentUserId(), //post.user.id, 
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
						"uid": currentUserId(), //post.user.id, 
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
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
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
			queryUsers({"$or": whereClause}, successCallback, successCallback, 1);
		}
		else {
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
	function login(username, password, callback) {
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
				callback(e);
		    } else {
		        Ti.API.info('Error: acs.login e.success ' + e.success + '\n' + (e && ((e.error && e.message) || JSON.stringify(e))));
		        alert(e.message);
	            checkInternetConnection(e);
		        privCurrentUser = null;
				callback(e.message);
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
									    }
									    else {
											Ti.API.info("Logout call returned " + e.success + " logoutCallback will not be executed.");
								            checkInternetConnection(e);
									    }
								}
							);				
					};
		// log out of facebook to clear Ti.Facebook.loggedIn etc...	
		if (Ti.Facebook.getLoggedIn()) { Ti.Facebook.logout(); Ti.Facebook.setUid(null);}			
		if (true) {  //Ti.Network.remoteNotificationsEnabled && Ti.Network.remoteDeviceUUID) {
			unsubscribeNotifications("fashionist", doLogout);
		}
		else {	
			doLogout();					
		}
	}

	
	// Friends
	function addFriends (friends, callback) {
		Ti.API.info('acs.addFriends');
		var userIdList = friends.join();
		Cloud.Friends.add({
		    user_ids: userIdList,
		    response_json_depth: 2
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('Friend(s) added ' + friends);
				callback(userIdList);
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
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
				approvedRequestNotification(userIdList);
				Ti.API.info('callback called ' + approvedRequestNotification.toString());
				if (successCallback) { successCallback(e); }
		    } else {
		        Ti.API.info('Error in approveFriends: ' + e.message);
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
	            checkInternetConnection(e);
		    }
		});		
	}


	function getFriendsList (successCallback, cleanupAction) {
		Cloud.Friends.search({
		    user_id: currentUserId(),
		    response_json_depth: 2
		}, function (e) {
			var i,
				user;
		    if (e.success) {
		        Ti.API.info('Success:\\n' +
		            'Count: ' + e.users.length);

		       if (successCallback) {
					successCallback(e.users, cleanupAction);		
				}
		    } else {
				if (cleanupAction) { cleanupAction(); }
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
	            checkInternetConnection(e);
		    }
		});
	}
	
			
	// Posts
	function addPost (postModel, pPhoto, successCallback, errorCallback) {

		var sync_sizes = 'iphone', pBody = postModel.caption, tags_list = postModel.tags.length > 0 ? postModel.tags.join() : null;
		Ti.API.info("Posting..." + pBody + " photo " + pPhoto + " callback " + successCallback);
		Cloud.Posts.create({
		    response_json_depth: 2,
		    content: pBody,
		    photo: pPhoto,
		    tags: tags_list,
		    // since appcelerator limits photos to being square, use square aspect ratio for now
		    'photo_sizes[avatar]':'50x50#',
		    'photo_sizes[preview]': '75x75#',
			'photo_sizes[android]':'480x480#',
			'photo_sizes[iphone]':'640x640#',
			'photo_sync_sizes[]': 'iphone',
			'photo_sizes[ipad]': '768x768#'
		}, function (e) {
		    if (e.success) {
		        var post = e.posts[0];
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
		        Ti.API.info('showPost success:\\n' +
		            'id: ' + post.id + '\\n' +
		            'title: ' + post.title + '\\n' +
		            'content: ' + post.content + '\\n' +
		            'updated_at: ' + post.updated_at);
				if (successCallback) {successCallback(post);}
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
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
	            checkInternetConnection(e);
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
		    per_page: 20,
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
	            checkInternetConnection(e);
		    }
			if (cleanupAction) { cleanupAction(); }
		});	
	}
	
	
	// query on tags
	function getFindExactPosts (postAction, cleanupAction) {
		Ti.API.info('acs.getFindExactPosts');

		Cloud.Posts.query({
		    page: 1,
		    per_page: 20,
		    order: '-created_at',
		    response_json_depth: 2,
		    where: {
		        "$or": [{"tags_array": Ti.Locale.getString('findExactHashTag')}, {"tags_array": Ti.Locale.getString('findSimilarHashTag')} ]
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
		    } else {
		        Ti.API.info('Error: getFindExactPosts\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
	            checkInternetConnection(e);
		    }
			if (cleanupAction) { cleanupAction(); }
		});	
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
	exports.approveFriendRequests = approveFriendRequests;
	exports.getFriendRequests = getFriendRequests;
	exports.getFriendsList = getFriendsList;
	exports.addPost = addPost;
	exports.showPost = showPost;	
	exports.updatePost = updatePost;
	exports.getFriendsPosts = getFriendsPosts;
	exports.getFindExactPosts = getFindExactPosts;


} ());
