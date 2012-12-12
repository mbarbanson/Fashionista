//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// CameraView brings up the camera view if the device has a camera or the photo gallery

(function () {
	"use strict";
	var acs = require('lib/acs'),
		social = require('lib/social'),
		ThumbnailsWindow = require('ui/common/ThumbnailsWindow'),
		ShareWindow = require('ui/common/ShareWindow');
	
	
	
	function goToShareWindow (image, post) {
		var shareWindow = ShareWindow.createShareWindow(image, post, social.newPostNotification);
	}

	function photoSuccessCallback(event) {
		Ti.API.info("Photo taken");
		var image = event.media,
			newSize = Ti.App.photoSizes[Ti.Platform.osname],
			user = acs.currentUser(),
			photoBlob;
		// resize to platform optimized size before uploading, by default could be up to 2448x2449!
		
		photoBlob = image.imageAsResized(newSize[0], newSize[1]);
		//start uploading now!
		acs.addPost (user.username + " needs your help!", "How does this look?", photoBlob, function(post) {
				Ti.API.info("finisihed uploading post, now share it. photo width " + photoBlob.width + " height " + photoBlob.height);
				goToShareWindow(photoBlob, post);
			});			
	}
	 
	function createCameraView (cancelCallback, mode) {
		if (Ti.Media.isCameraSupported && mode === 'camera') {
			//FIXME should pop up a menu to let user select camera or photo gallery instead of only offering camera
			Ti.Media.showCamera({
				animated:false,
				success: photoSuccessCallback,
				cancel:cancelCallback(),
				error:function(error) {
					cancelCallback();
					var a = Ti.UI.createAlertDialog({title: L('camera_error')});
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
				success: photoSuccessCallback,
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


	
	function takePhoto (cancelCallback) {
		Ti.API.info("takePhoto");				
		try {
			createCameraView(cancelCallback, 'camera');		
		}
		catch (ex) {
			Ti.API.info("takePhoto threw an exception. " + ex.message);
		}
	}
	
	function pickPhoto (cancelCallback) {
		Ti.API.info("pick Photo");				
		try {
			createCameraView(cancelCallback);		
		}
		catch (ex) {
			Ti.API.info("pickPhoto threw an exception. " + ex.message);
		}
	}
		
	exports.createCameraView = createCameraView;
	exports.takePhoto = takePhoto;
	exports.pickPhoto = pickPhoto;
}) ();
