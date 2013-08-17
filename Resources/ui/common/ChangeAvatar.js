(function () {
	'use strict';

	function useFacebookPicture(imgView, refreshCallback) {
		var FB = require('lib/facebook'),
			callback = function(fbData) {
				var acs = require('lib/acs'),
					currentUser = acs.currentUser(),
					facebookUID = fbData? fbData.id : FB.getLinkedFBId(), 
					width = imgView.width, 
					height = imgView.height;
				if (!currentUser.first_name && fbData) {
					currentUser.first_name = fbData.first_name;
				}
				if (!currentUser.last_name && fbData) {
					currentUser.last_name = fbData.last_name;		
				}
				if (facebookUID) {
					imgView.image = 'https://graph.facebook.com/' + facebookUID + '/picture?width=' + 2 * width + '&height=' + 2 * height;					
				}
				if (refreshCallback && fbData && facebookUID) {
					refreshCallback();
				}		
			};
		FB.authorize(callback);
	}
	
	
	
	function photoSuccessCallback(event, imgView) {
		Ti.API.info("Photo taken");
		var image = event.media,
			acs = require('lib/acs'),
			user = acs.currentUser();
			
		user.photo = image.imageAsThumbnail(200);
		imgView.image = user.photo;	
		Ti.Media.hideCamera();
	}
	
	
	
	function takePhoto(imgView, refreshCallback) {
		/*
		var CameraView = require('ui/common/CameraView'),
			successCallback = function (e) {photoSuccessCallback(e, imgView);},
			cancelCallback = function(e) {Ti.Media.hideCamera();};
		try {
			CameraView.createCameraView(successCallback, cancelCallback, 'camera');		
		}
		catch (ex) {
			Ti.API.info("takePhoto threw an exception. " + ex.message);
		}
		*/
		var alert = Ti.UI.createAlertDialog({
			title: Ti.Locale.getString('fashionist'),
			message: "We're working on adding this feature in an upcoming update. Please use your Facebook picture for now",
			buttonNames: ['Not Now', 'Ok'],
			cancel: 0
			}),
			alertHandler = function (e) {
			    if (e.index === e.source.cancel){
			      Ti.API.info('The cancel button was clicked');
			    }
			    else {
					useFacebookPicture(imgView, refreshCallback);	
			    }
			};
			alert.addEventListener('click', alertHandler);
		alert.show();	
	}
	
	
	
	function choosePhoto(imgView, refreshCallback) {
		/*
		var CameraView = require('ui/common/CameraView'),
			successCallback = function (e) {photoSuccessCallback(e, imgView);},
			cancelCallback = function(e) {Ti.Media.hideCamera();};
		try {
			CameraView.createCameraView(successCallback, cancelCallback);		
		}
		catch (ex) {
			Ti.API.info("takePhoto threw an exception. " + ex.message);
		}
		*/		
		var alert = Ti.UI.createAlertDialog({
			title: Ti.Locale.getString('fashionist'),
			message: "We're working on adding this feature in an upcoming update. Please use your Facebook picture for now",
			buttonNames: ['Not Now', 'Ok'],
			cancel: 0
			}),
			alertHandler = function (e) {
			    if (e.index === e.source.cancel){
			      Ti.API.info('The cancel button was clicked');
			    }
			    else {
					useFacebookPicture(imgView, refreshCallback);	
			    }
			};
			alert.addEventListener('click', alertHandler);
		alert.show();
	}
	
	

	function createChangePictureDialog(imgView, callback) {
	
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			isAndroid = Ti.Platform.osname === 'android',
			currentUser = acs.currentUser(),
			actionDialogOpts,
			dialog;
				
		actionDialogOpts = { 
			options:['Use Facebook Photo', 'Take a Photo', 'Choose an Existing Photo', 'Cancel'],
			cancel:3,
			selectedIndex: 0,
			title:'Change Picture'
		}; 
		dialog = Titanium.UI.createOptionDialog(actionDialogOpts);
		// add event listener
		dialog.addEventListener('click',function(e)
		{
			var optionLabel = actionDialogOpts.options[e.index],
			    currentUser = acs.currentUser();
			Ti.API.info ('You selected ' + optionLabel);
			Flurry.logEvent('ChangePicture', {'username': currentUser.username, 'email': currentUser.email});
			switch (e.index) {
				case 0:
					useFacebookPicture(imgView, callback);
					Flurry.logEvent('UseFacebookAvatar', {'username': currentUser.username, 'email': currentUser.email});
					break;
				case 1:
					takePhoto(imgView, callback);
					Flurry.logEvent('TakeAvatarPhoto', {'username': currentUser.username, 'email': currentUser.email});
					break;
				case 2:
					choosePhoto(imgView, callback);
					Flurry.logEvent('ChooseAvatarPhoto', {'username': currentUser.username, 'email': currentUser.email});
					break;
				case 3:
					Flurry.logEvent('CancelChangePicture', {'username': currentUser.username, 'email': currentUser.email});
					break; 
			}
		});

		dialog.show();		
		return dialog;
	}
	
	exports.createChangePictureDialog = createChangePictureDialog;
	
} ());