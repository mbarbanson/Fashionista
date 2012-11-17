//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// CameraView brings up the camera view if the device has a camera or the photo gallery

(function () {
	var acs = require('lib/acs');
	var social = require('lib/social');
	var ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
	var ShareWindow = require('ui/common/ShareWindow');
	
	
	
	function goToShareWindow (image) {
		"use strict";
		alert("takePhoto success callback!");
		var shareWindow = ShareWindow.createShareWindow(image, social.sharePhoto);
	}
	
	function takePhoto () {
		"use strict";
		Ti.API.info("takePhoto");				
		var cancelCallback = function (e) {
			Ti.API.info("calling cancelCallback " + e);
		};
		try {
			createCameraView(cancelCallback, function() {Ti.API.info("takePhoto succeeded!");});		
		}
		catch (ex) {
			Ti.API.info("takePhoto threw an exception. " + ex.message);
		}
	}
	
	 
	function createCameraView (cancelCallback, successCallback) {
		'use strict';
		var user,
			uploadSuccessCallback;
		user = acs.currentUser();
		uploadSuccessCallback = function (imageBlob) {
			Ti.API.info("sharePhoto: refresh the thumbnail window");
			ThumbnailsWindow.refreshThumbnails();
			successCallback(imageBlob);
		};
		if (Ti.Media.isCameraSupported) {
			//FIXME should pop up a menu to let user select camera or photo gallery instead of only offering camera
			Ti.Media.showCamera({
				animated:false,
				success:function(event) {
					var image = event.media;
					Ti.API.info(" about to upload photo for " + user.username + " image " + image + " event " + event);
					acs.uploadPhoto(image, 
									acs.getPhotoCollectionId(user), 
									uploadSuccessCallback);
					Ti.API.info("This is where the user chooses who to share this image with");									
					goToShareWindow(image);
				},
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
				success: function(event) {
					var image = event.media;
					Ti.API.info("selected a photo from photo gallery successfully");
					Ti.API.info(" about to upload photo for " + user.username + " image " + image + " event " + event);
					acs.uploadPhoto(image, 
									acs.getPhotoCollectionId(user), 
									uploadSuccessCallback); 
					Ti.API.info("This is where the user chooses who to share this image with");									
					goToShareWindow(image);
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
	exports.takePhoto = takePhoto;
}) ();
