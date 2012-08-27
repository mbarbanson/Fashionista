/*
	Library to wrap app-specific functionality around the ACS APIs
*/
//"use strict";

// a couple local variables to save state
var currentUser = null;
var loggedIn = false;

// add your ACS keys here:
var Cloud = require('ti.cloud');

exports.isLoggedIn = function() {
	return loggedIn;
};

exports.setIsLoggedIn = function(val) {
	loggedIn = val;
};

exports.currentUser = function() {
	return currentUser;
};

exports.setCurrentUser = function(cu) {
	currentUser = cu;
};

exports.getPhotoCollectionId = function(user) {
	return user.custom_fields.photoCollectionId;
};

exports.setPhotoCollectionId = function(user, collectionId) {
	user.custom_fields.photoCollectionId = collectionId;
};

exports.getPhotoCollection = function(user, collection) {
	return user.custom_fields.photoCollection;
};

exports.setPhotoCollection = function(user, collection) {
	user.custom_fields.photoCollection = collection;
};

exports.getUserPhotos = function(user, photos) {
	return user.custom_fields.photos;
};

exports.setUserPhotos = function(user, photos) {
	user.custom_fields.photos = photos;
};


exports.login = function(username, password, callback) {
	Cloud.Users.login({
	    login: username,
	    password: password
	}, function (e) {
	    if (e.success) {
	    	currentUser = e.users[0];
	    	loggedIn = true;
	    	Ti.App.Properties.setString('currentFashionista', username);
			Ti.App.Properties.setString('fashionistaPassword', password);
			callback(loggedIn);
	    } else {
	        Ti.API.info('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
	        loggedIn = false;
	        currentUser = null;
			callback(loggedIn);
	    }
	});	
};

exports.silentLogin = function(username, password) {
	Cloud.Users.login({
	    login: username,
	    password: password
	}, function (e) {
	    if (e.success) {
	    	currentUser = e.users[0];
	    	loggedIn = true;
	    	Ti.API.info('Logged in: ' + username + ' successfully from saved credentials');
	    } else {
	        Ti.API.info('Error: login failed\\n' + ((e.error && e.message) || JSON.stringify(e)));
	        loggedIn = false;
	        currentUser = null;
	    }
	});	
};

exports.logout = function() {
	Cloud.Users.logout(function (e) {
	    if (e.success) {
	        currentUser = null;
	        loggedIn = false;
	    }
	});		
};

exports.createUser = function(username, password, callback) {
	// ACS API requires password & confirm, but we do the checking elsewhere so use the same for both here
	Cloud.Users.create({
		username: username,
		//first_name: firstName,
	    //last_name: lastName,
		password: password,
		password_confirmation: password
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
exports.createUserPhotoCollection = function(user, name) {
	// create a photo collection and add it to the current user's properties
    Cloud.PhotoCollections.create({
        name: name
    }, function (e) {
        if (e.success) {
            var collection = e.collections[0];
            user.custom_fields.photoCollectionId = collection.id;
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

exports.getPhotoCollectionFromId = function (collectionId, callback) {
    Cloud.PhotoCollections.show({
        collection_id: collectionId
    }, function (e) {
        if (e.success) {
            var collection = e.collections[0];
            Ti.API.info('Found Photo Collection from id:\\n' +
                'id: ' + collection.id + '\\n' +
                'name: ' + collection.name + '\\n' +
                'count: ' + collection.counts.total_photos + '\\n' +
                'updated_at: ' + collection.updated_at);
            callback(collection);
        } else {
            alert('Error:\\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });	
};


exports.getUserCollectionIdPhotos = function(user, collectionId, callback) {
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



exports.uploadPhoto = function(image, collectionId) {
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