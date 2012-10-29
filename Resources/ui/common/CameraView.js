//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// CameraView brings up the camera view if the device has a camera or the photo gallery

var acs = require('lib/acs');

function createCameraView (cancelCallback, successCallback) {
	'use strict';
	var user = acs.currentUser();
	if (Ti.Media.isCameraSupported) {
		//FIXME should pop up a menu to let user select camera or photo gallery instead of only offering camera
		Ti.Media.showCamera({
			animated:false,
			success:function(event) {
				var image = event.media;
				Ti.API.info(" about to upload photo for " + user.username + " image " + image + " event " + event);
				acs.uploadPhoto(image, 
								acs.getPhotoCollectionId(user), 
								function () { 
									Ti.API.info("photo uploaded for " + user.username + " image " + image + " event " + event);
									successCallback(image);
									});
			},
			cancel:cancelCallback(),
			error:function(error) {
				cancelCallback();
				var a = Ti.UI.createAlertDialog({title:L('camera_error')});
				if (error.code === Ti.Media.NO_CAMERA) {
					a.setMessage(L('camera_error_details'));
				}
				else {
					a.setMessage('Unexpected error: ' + error.code);
				}
				a.show();
			},
			saveToPhotoGallery:true,
			allowEditing:true,
			mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
			showControls: true
		});
	} else {
		Ti.Media.openPhotoGallery({
			animated: false,
			success: function(event) {
				var image = event.media;
				Ti.API.info("selected a photo from photo gallery successfully");
				Ti.API.info(" about to upload photo for " + user.username + " image " + image + " event " + event);
				acs.uploadPhoto(image, 
								acs.getPhotoCollectionId(user), 
								function (photo) {
									var photoUrl = photo.urls.original;
									successCallback(photoUrl);
									Ti.API.info("photo uploaded for " + user.username + " imageUrl " + photoUrl);
								});
			},
			cancel: cancelCallback,			
			error:function(error) {
				Ti.API.info("selected a photo from photo gallery. returned an error");
				cancelCallback();
				var a = Ti.UI.createAlertDialog({title:L('photo_gallery_error')});
				if (error.code === Ti.Media.NO_CAMERA) {
					a.setMessage(L('camera_error_details'));
				}
				else {
					a.setMessage('Unexpected error: ' + error.code);
				}
				a.show();
			},
			saveToPhotoGallery:true,
			allowEditing:true,
			mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
		});
	}
}

exports.createCameraView = createCameraView;