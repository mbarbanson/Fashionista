/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


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
			cropRect = event.cropRect,
			user = acs.currentUser(),
			curWin = FeedWindow.currentFeedWindow(),
			postModel;
		Titanium.API.info('PHOTO SUCCESS cropRect.x ' + cropRect.x + ' cropRect.y ' + cropRect.y  + ' cropRect.height ' + cropRect.height + ' cropRect.width ' + cropRect.width);

		Ti.Media.hideCamera();
		Ti.App.mainTabGroup.setActiveTab(0);	
		postModel = PostModel.createPostModel(user, image);
		goToShareWindow(postModel);
		postModel.photo = FeedWindow.resizeToPlatform(image);
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
					var a = Ti.UI.createAlertDialog({title: Ti.Locale.getString('camera_error')});
					if (error.code === Ti.Media.NO_CAMERA) {
						a.setMessage(Ti.Locale.getString('camera_error_details'));
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
					var a = Ti.UI.createAlertDialog({title:Ti.Locale.getString('photo_gallery_error')});
					if (error.code === Ti.Media.NO_CAMERA) {
						a.setMessage(Ti.Locale.getString('camera_error_details'));
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
