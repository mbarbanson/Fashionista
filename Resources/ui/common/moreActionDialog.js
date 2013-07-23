(function () {
	'use strict';

	function flagPost(post) {
		alert("This post has inappropriate content that violates app store policy");
	}

	function saveToCameraRoll(photoBlob) {
		var successCallback = function (e) { alert("Successfully saved to camera roll");},
			errorCallback = function (e) {alert("Couldn't save photo to camera roll. Please check your connection and try again later.");};
		Ti.Media.saveToPhotoGallery(photoBlob, {success: successCallback, error: errorCallback});
	}

    function deletePost(post) {
		var acs = require('lib/acs'),
			FeedWindow = require('ui/common/FeedWindow'),
			dialog = Ti.UI.createAlertDialog({
					    cancel: 1,
					    buttonNames: ['Ok', 'Cancel'],
					    message: 'Delete this post?',
					    title: 'Confirm'
					    });
		    dialog.addEventListener('click', function(e) {
						if (e.index === e.source.cancel) {
							Ti.API.info('The cancel button was clicked');
					    }
						else {
							acs.removePost(post.id, function (e) {FeedWindow.showFriendsFeed();});							
						}
					});
			dialog.show();
}


	function createMoreDialog(post, imgView) {
	
		var acs = require('lib/acs'),
			Flurry = require('ti.flurry'),
			isAndroid = Ti.Platform.osname === 'android',
			currentUser = acs.currentUser(),
			ownsPost = (post.user.id === currentUser.id),
			ownerActionDialogOpts, actionDialogOpts,
			dialog;
			
		
		//
		// BASIC OPTIONS DIALOG
		//
        if (ownsPost) {
			ownerActionDialogOpts = {
				options:['Delete Post', 'Save to Camera Roll', 'Flag As Inappropriate', 'Cancel'],
				destructive:2,
				cancel:3,
				selectedIndex: 3,
				title:'Other Actions'
			}; 
			dialog = Titanium.UI.createOptionDialog(ownerActionDialogOpts);
			// add event listener
			dialog.addEventListener('click',function(e)
			{
				var optionLabel = ownerActionDialogOpts.options[e.index],
				    currentUser = acs.currentUser();
				Ti.API.info ('You selected ' + optionLabel);
				Flurry.logEvent(optionLabel, {'username': currentUser.username, 'email': currentUser.email});
				switch (e.index) {
					case 0:
						deletePost(post);
						break;
					case 1:
						saveToCameraRoll(imgView.toBlob());
						break;
					case 2:
						flagPost(post);
						break; 
				}
			});
		}
        else {
			actionDialogOpts = { 
				options:['Save to Camera Roll', 'Flag As Inappropriate', 'Cancel'],
				destructive:1,
				cancel:2,
				selectedIndex: 2,
				title:'Other Actions'
				}; 
			dialog = Titanium.UI.createOptionDialog(actionDialogOpts);
			// add event listener
			dialog.addEventListener('click',function(e)
			{
				var optionLabel = actionDialogOpts.options[e.index],
				    currentUser = acs.currentUser();
				Ti.API.info ('You selected ' + optionLabel);
				Flurry.logEvent(optionLabel, {'username': currentUser.username, 'email': currentUser.email});
				switch (e.index) {
					case 0:
						saveToCameraRoll(post);
						break;
					case 1:
						flagPost(post);
						break; 
				}
			});
        }		

		dialog.show();
				
		return dialog;
	}
	
	exports.createMoreDialog = createMoreDialog;
	
} ());