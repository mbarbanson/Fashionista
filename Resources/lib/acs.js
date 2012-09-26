/*
	Library to wrap app-specific functionality around the ACS APIs
*/
"use strict";

// a couple local variables to save state
var currentUser = null;
var loggedIn = false;

// add your ACS keys here:
var Cloud = require('ti.cloud');

function isLoggedIn () {
	return loggedIn;
};

function setIsLoggedIn (val) {
	loggedIn = val;
};

exports.currentUser = function() {
	return currentUser;
};

exports.setCurrentUser = function(cu) {
	currentUser = cu;
};

function getPhotoCollectionId(user) {
	if (user && user.custom_fields) {
		return user.custom_fields.photoCollectionId;
	}
	return null;
};

function setPhotoCollectionId(user, collectionId) {
	if (user && user.custom_fields) {
		user.custom_fields.photoCollectionId = collectionId;
		if (collectionId) {
			updateUser({custom_fields: {photoCollectionId: collectionId}});
		}
	}
};

function login(username, password, callback) {
	Cloud.Users.login({
	    login: username,
	    password: password
	}, function (e) {
	    if (e.success) {
	    	currentUser = e.users[0];
	    	if (!currentUser.custom_fields) {
	    		currentUser.custom_fields = {};
	    	}
	    	loggedIn = true;
			callback(loggedIn);
	    } else {
	        Ti.API.info('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
	        loggedIn = false;
	        currentUser = null;
			callback(loggedIn);
	    }
	});	
};


function updateUser(dict) {
	Cloud.Users.update(dict, 
			function (e) {
		    if (e.success) {
		        var user = e.users[0];
		        // update our current user
		        currentUser = user;
		        alert('Success: updated current user \\n' + dict);
		    } else {
		        alert('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
}


function logout(callback) {
	Cloud.Users.logout(function (e) {
	    if (e.success) {
	        currentUser = null;
	        loggedIn = false;
	        callback();
	    }
	});		
};


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
	        alert('user = ' + JSON.stringify(e.users[0]))
	        currentUser = e.users[0];
	        loggedIn = true;
	        callback(currentUser);
	    } else {
	    	alert('Error create User failed' + JSON.stringify(e));
	    	loggedIn = false;
	    	currentUser = null;
	    	callback(false);
	    }
	});
};


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
};

// may want to pass in a callback from caller later on
function getUserPhotoCollection(user) {
	// create a photo collection and add it to the current user's properties
    Cloud.PhotoCollections.search({
        user_id: user.id
    }, function (e) {
        if (e.success) {
            var collection = e.collections[0];
            setPhotoCollectionId(user, collection.id);
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
};


function getUserCollectionIdPhotos(user, collectionId, callback) {
    Cloud.PhotoCollections.showPhotos({
        page: 1,
        per_page: 20,
        collection_id: collectionId
    }, function (e) {
        if (e.success) {
            if (!e.photos) {
                Ti.API.info('No photos');
            } else {
            	var photos = e.photos;
            	user.custom_fields.photos = photos;
                Ti.API.info('Got user photos:\\n' +
                    'Count: ' + photos.length);
                   
                for (var i = 0; i < photos.length; i++) {
                    var photo = photos[i];
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
};



function uploadPhoto (image, collectionId, callback) {
	Cloud.Photos.create({
        photo: image,
        collection_id: collectionId
    }, function (e) {
        if (e.success) {
            var photo = e.photos[0];
            
            alert('Success:\\n' +
                'id: ' + photo.id + '\\n' +
                'filename: ' + photo.filename + '\\n' +
                'size: ' + photo.size,
                'updated_at: ' + photo.updated_at); 
                
             if (callback) callback();
        } else {
            alert('Error:\\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
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
		    user_id: currentUser.id
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

exports.getUserPhotos = function(user, photos) {
	if (user && user.custom_fields) {
		return user.custom_fields.photos;
	}
	return null;
};

exports.setUserPhotos = function(user, photos) {
	if (user && user.custom_fields) {
		user.custom_fields.photos = photos;
	}
};



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
