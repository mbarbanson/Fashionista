//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// CameraView brings up the camera view if the device has a camera or the photo gallery

var acs = require('lib/acs');

exports.createCameraView = function(cancelCallback, successCallback) {
	var user = acs.currentUser();
	if (Ti.Media.isCameraSupported) {
		Ti.Media.showCamera({
			animated:false,
			success:function(event) {
				var image = event.media;
				acs.uploadPhoto(image, acs.getPhotoCollectionId(user), function () {Ti.API.info("photo uploaded for " + user.username);});
				successCallback(image);
			},
			cancel:cancelCallback(),
			error:function(error) {
				cancelCallback();
				var a = Ti.UI.createAlertDialog({title:L('camera_error')});
				if (error.code == Ti.Media.NO_CAMERA) {
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
		//Ti.UI.iPhone.hideStatusBar();
		Ti.Media.openPhotoGallery({
			animated: false,
			success: function(event) {
				var image = event.media;
				acs.uploadPhoto(image, acs.getPhotoCollectionId(user), function () {Ti.API.info("photo uploaded for " + user.username);});
				successCallback(image);
			},
			cancel: cancelCallback,			
			error:function(error) {
				cancelCallback();
				var a = Ti.UI.createAlertDialog({title:L('photo_gallery_error')});
				if (error.code == Ti.Media.NO_CAMERA) {
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
};