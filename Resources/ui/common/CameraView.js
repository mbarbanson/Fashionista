//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// CameraView brings up the camera view if the device has a camera or the photo gallery

(function () {
	"use strict";
	var acs = require('lib/acs'),
		social = require('lib/social'),
		ThumbnailsWindow = require('ui/common/ThumbnailsWindow'),
		ShareWindow = require('ui/common/ShareWindow'),
		FeedWindow = require('ui/common/FeedWindow'),
		PostModel = require('models/posts'); 
		//cameraOverlay = Ti.UI.createView({opacity:0.0, width: Ti.UI.FILL, height: Ti.UI.FILL});


	function goToShareWindow (postModel) {
		var shareWindow = ShareWindow.createShareWindow(postModel, social.newPostNotification);
	}


	function photoSuccessCallback(event) {
		Ti.API.info("Photo taken");
		var image = event.media,
			newSize = Ti.App.photoSizes[Ti.Platform.osname],
			user = acs.currentUser(),
			curWin = FeedWindow.currentFeedWindow(),
			photoBlob,
			postModel;
		
		Ti.Media.hideCamera();	
		// resize to platform optimized size before uploading, by default the original could be up to 2448x2449!
		// actually, comment this out for now to speed up synchronous actions		
		photoBlob = image; //image.imageAsResized(newSize[0], newSize[1]);
		postModel = new PostModel(user, photoBlob);
		goToShareWindow(postModel);
	}

	 
	function createCameraView (successCallback, cancelCallback, mode) {
		if (Ti.Media.isCameraSupported && mode === 'camera') {
			//FIXME should pop up a menu to let user select camera or photo gallery instead of only offering camera
			Ti.Media.showCamera({
				animated: false,
				success: successCallback,
				cancel:cancelCallback,
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
				autohide: false,
				showControls: true,				
				mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
				//overlay: cameraOverlay
			});
		} else {
			Ti.Media.openPhotoGallery({
				animated: false,
				success: successCallback,
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
				saveToPhotoGallery:false,
				allowEditing:true,
				autohide: false,
				mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
				//overlay: cameraOverlay
			});
		}
	}


	
	function takePhoto (successCallback, cancelCallback) {
		Ti.API.info("takePhoto");				
		try {
			createCameraView(successCallback, cancelCallback, 'camera');		
		}
		catch (ex) {
			Ti.API.info("takePhoto threw an exception. " + ex.message);
		}
	}
	
	
	function pickPhoto (successCallback, cancelCallback) {
		Ti.API.info("pick Photo");				
		try {
			createCameraView(successCallback, cancelCallback);		
		}
		catch (ex) {
			Ti.API.info("pickPhoto threw an exception. " + ex.message);
		}
	}
		
		
	
	exports.createCameraView = createCameraView;
	exports.photoSuccessCallback = photoSuccessCallback;
	exports.takePhoto = takePhoto;
	exports.pickPhoto = pickPhoto;
} ());
