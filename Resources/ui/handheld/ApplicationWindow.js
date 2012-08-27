"use strict";

function OnFocusHandler(self, user) {
	if (Ti.Media.isCameraSupported) {
			Ti.Media.showCamera({
				animated:false,
				success:function(event) {
					var image = event.media;
					//save for future use
					var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'photo'+ user.username +'.jpg');
					f.write(image);
					var DetailWindow = require('/ui/common/DetailWindow');
					self.containingTab.open(new DetailWindow(f), {modal: true});
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
			Ti.Media.openPhotoGallery({
				animated: false,
				success:function(event) {
					var image = event.media;
					//save for future use
					var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'photo' + user.username + '.jpg');
					f.write(image);
					var DetailWindow = require('/ui/common/DetailWindow');
					self.containingTab.open(new DetailWindow(f), {modal: true});
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
	}

exports.createApplicationWindow = function (user) {
	var self = Ti.UI.createWindow({
		title: (user ? user.username : L('Fashionista')),
		backgroundColor: 'black',
		barColor: '#5D3879',
		tabBarHidden: true
	});
	//self.addEventListener('open', function () { OnFocusHandler(self, user);});	
	self.addEventListener('openCamera', function () { 
		Ti.API.info("received an openCamera event");
		OnFocusHandler(self, user);});
	return self;
};
