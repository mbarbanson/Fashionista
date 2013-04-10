/*
 * Create a default user and initial photoCollection to bootstrap the app
 */

"use strict";

// add your ACS keys here:
var Cloud = require('ti.cloud');
Cloud.debug = true;
var acs = require('lib/acs');
var fashionistaPhoto = null;

/*
try {
	acs.createUser(
	'fashionista',
	'password',
	function() { Titanium.API.info("Created user successfully"); }
	);

	if (acs.currentUser()) {
		Titanium.API.info(acs.currentUser.username + " is logged in" );
	}
	else {
		Titanium.API.info(" No logged in user");	
	}

	var photoFile = Ti.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, '/images/IMG_0001.jpg');
	
	if (photoFile.exists) {
		Ti.API.info(photoFile + " exists");
	}
	else {
		photoFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, '/images/IMG_0001.jpg');
		if (photoFile.exists) {Ti.API.info(photoFile + " exists");}
		else {
			photoFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationSupportDirectory, '/images/IMG_0001.jpg');
			if (photoFile.exists) {Ti.API.info(photoFile + " exists");}
		}
	}

	var blob = photoFile.toBlob();
	
	Cloud.Photos.create({
    	photo: blob
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
catch (e){
	alert('Exception ' + e.message);
}
*/

Cloud.Users.update({
    custom_fields: {
    	photoCollectionId: "50300675b68553247b018655",
    	photoCollection: "",
    	photos: "",
        favorite_color: 'aubergine',
        age: 13
    }
}, function (e) {
    if (e.success) {
        var user = e.users[0];
        Ti.API.info('User has been updated:\\n' +
            'photoCollectionId: ' + user.custom_fields.photoCollectionId + '\\n' +
            'photoCollection: ' + user.custom_fields.photoCollection + '\\n' +
            'photos: ' + user.custom_fields.photos);
    } else {
        Ti.API.info('Error while updating current user:\\n' +
            ((e.error && e.message) || JSON.stringify(e)));
    }
});

/*

try {
	acs.createUserPhotoCollection(acs.currentUser(), acs.currentUser().username + ' Gallery');
	var photoFile = Ti.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, '/images/IMG_0001.jpg');
	
	if (photoFile.exists) {
		Ti.API.info(photoFile + " exists");
	}
	else {
		photoFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, '/images/IMG_0001.jpg');
		if (photoFile.exists) {Ti.API.info(photoFile + " exists");}
		else {
			photoFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationSupportDirectory, '/images/IMG_0001.jpg');
			if (photoFile.exists) {Ti.API.info(photoFile + " exists");}
		}
	}

	var blob = photoFile.toBlob();
	
	Cloud.Photos.create({
    	photo: blob,
    	collection_id: acs.getPhotoCollectionId(acs.currentUser)
	}, function (e) {
	    if (e.success) {
	        var photo = e.photos[0];
	        fashionistaPhoto = photo;
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
catch (e){
	alert('Exception ' + e.message);
}
*/


