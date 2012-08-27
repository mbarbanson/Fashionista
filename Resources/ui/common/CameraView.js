//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// CameraView brings up the camera view if the device has a camera or the photo gallery

exports.createCameraView = function(user, parentWin, callback) {
	if (Ti.Media.isCameraSupported) {
		Ti.Media.showCamera({
			animated:false,
			success:function(event) {
				var image = event.media;
				//save for future use
				//var imgPath = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'photo'+ user.username +'.jpg');
				//imgPath.write(image);
				callback(user, parentWin, image);
			},
			cancel:function() {},
			error:function(error) {
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
			animated: true,
			success:function(event) {
				var image = event.media;
				//save for future use
				//var imgPath = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'photo' + user.username + '.jpg');
				//imgPath.write(image);
				callback(user, parentWin, image);
			},
			cancel:function() {},
			error:function(error) {
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