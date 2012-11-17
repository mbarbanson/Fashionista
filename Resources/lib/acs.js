/*
	Library to wrap app-specific functionality around the ACS APIs
*/

(function () {
	'use strict';
	// a couple local variables to save state
	var privCurrentUser = null,
		Cloud = require('ti.cloud');
		loggedIn = false;
	
	
	function isLoggedIn () {
		return loggedIn;
	}
	
	function setIsLoggedIn (val) {
		loggedIn = val;
	}
	
	function currentUser () {
		return privCurrentUser;
	}
	
	function setCurrentUser (cu) {
		privCurrentUser = cu;
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
	
	
	function login(username, password, callback) {
		Cloud.Users.login({
		    login: username,
		    password: password
		}, function (e) {
		    if (e.success) {
				privCurrentUser = e.users[0];
				if (!privCurrentUser.custom_fields) {
					privCurrentUser.custom_fields = {};
				}
				loggedIn = true;
				Cloud.sessionId = e.meta.session_id;
				Ti.App.Properties.setString('sessionId', Cloud.sessionId);			
				Ti.API.info("Logged in " + privCurrentUser.username + " saved sessionId " + Ti.App.Properties.getString('sessionId'));
				callback();
		    } else {
		        Ti.API.info('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
		        loggedIn = false;
		        privCurrentUser = null;
				callback();
		    }
		});	
	}
	
	
	function logout(callback) {
		Cloud.Users.logout(function (e) {
		    if (e.success) {
		        privCurrentUser = null;
		        loggedIn = false;
		        // clear session id
				Cloud.sessionId = null;
				Ti.App.Properties.setString('sessionId', null);
		        callback();
		    }
		});		
	}
	
	
	function createUser (username, password, callback) {
		// ACS API requires password & confirm, but we do the checking elsewhere so use the same for both here
		Cloud.Users.create({
			username: username,
			first_name: "test",
		    last_name: "user",
			password: password,
			password_confirmation: password,
			custom_fields: {photos: null, photoCollection: null}
		}, function (e) {
		    if (e.success) {
		        Ti.API.info('user = ' + JSON.stringify(e.users[0]));
		        privCurrentUser = e.users[0];
		        loggedIn = true;
		        
				Cloud.sessionId = e.meta.session_id;
				Ti.App.Properties.setString('sessionId', Cloud.sessionId);			
				Ti.API.info("Logged in " + privCurrentUser.username + " saved sessionId " + Ti.App.Properties.getString('sessionId'));
		        callback();
		    } else {
				alert('Error create User failed' + JSON.stringify(e));
				loggedIn = false;
				privCurrentUser = null;
				callback();
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
	            alert('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
	        }
	    });
	}
	
	// may want to pass in a callback from caller later on
	function getUserPhotoCollection() {
		// create a photo collection and add it to the current user's properties
	    Cloud.PhotoCollections.search({
	        user_id: privCurrentUser.id
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
	            alert('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
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
		                   
		                for (i = 0, ilen = photos.length; i < ilen; i = i + 1) {
		                    photo = photos[i];
		                    Ti.API.info('photo:\\n' +
		                        'id: ' + photo.id + '\\n' +
		                        'name: ' + photo.filename + '\\n' +
		                        'updated_at: ' + photo.updated_at);
		                }
		                callback(photos);
		            }
		        } else {
		            Ti.API.info('Error:\\n' +
		                ((e.error && e.message) || JSON.stringify(e)));
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
	            
	            alert ('Success:\\n' +
	                'id: ' + photo.id + '\\n' +
	                'filename: ' + photo.filename + '\\n' +
	                'size: ' + photo.size,
	                'updated_at: ' + photo.updated_at); 
	                
	             if (callback) {
					callback(image, photo);
	             }
	        } else {
	            alert('Error:\\n' +
	                ((e.error && e.message) || JSON.stringify(e)));
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
	
	
	/*
	exports.postPhoto = function(message, photo, callback) {
		if(loggedIn) {
			Cloud.Statuses.create({
			    message: message,
			    photo: photo
			}, function (e) {
			    if (e.success) {
			        callback(true);
			    } else {
			        Ti.API.info('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
			        callback(false);
			    }
			});	
		} else {
			return false;
		}
	};
	
	exports.getPostList = function(callback) {
		if(loggedIn) {
			Cloud.Statuses.search({
			    user_id: privCurrentUser.id
			}, function (e) {
			    if (e.success) {
					Ti.API.info('statuses = ' + JSON.stringify(e.statuses))
					callback(e.statuses);
			    } else {
			        Ti.API.info('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
			        callback(false);
			    }
			});
		}
	};
	*/
	
	// exports
	
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
	
	
	
	exports.isLoggedIn = isLoggedIn;
	exports.setIsLoggedIn = setIsLoggedIn;
	exports.getPhotoCollectionId = getPhotoCollectionId;
	exports.setPhotoCollectionId = setPhotoCollectionId;
	exports.login = login;
	exports.logout = logout;
	exports.uploadPhoto = uploadPhoto;
	exports.updateUser = updateUser;
	exports.createUser = createUser;
	exports.createUserPhotoCollection = createUserPhotoCollection;
	exports.getUserCollectionIdPhotos = getUserCollectionIdPhotos;
	exports.getUserPhotoCollection = getUserPhotoCollection;
	exports.currentUser = currentUser;
	exports.setCurrentUser = setCurrentUser;
	exports.getUserPhotos = getUserPhotos;
	exports.setUserPhotos = setUserPhotos;

}) ();
