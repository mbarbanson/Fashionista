"use strict";

var acs = require('lib/acs');
var CameraView = require('/ui/common/CameraView');
var LogoutWindow = require('/ui/common/LogoutWindow');
var ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
//var FeedWindow = require('ui/common/FeedWindow');

var applicationTabGroup = null;
	
function createApplicationTabGroup(rootWindow) {

	if (!applicationTabGroup) {
		applicationTabGroup = Ti.UI.createTabGroup({
			backgroundColor: 'black'
		});
		
		rootWindow.add(applicationTabGroup);
		
		//create app tabs
		var thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow(),
			//win2 = Ti.UI.createWindow(),
			win3 = Ti.UI.createWindow(),
			//win4 = Ti.UI.createWindow(),
			logoutWindow = new LogoutWindow();
			
		ThumbnailsWindow.refreshThumbnails();	
		var tab1 = Ti.UI.createTab({
			icon: '/icons/light_grid.png',
			window: thumbnailsWindow
		});
		thumbnailsWindow.containingTab = tab1;
		// this tab requires a logged in user
		tab1.addEventListener('click', function (e) {
			if (acs.currentUser()) {
				applicationTabGroup.setActiveTab(0);
			}
			else {
				alert('Please log in or sign up first');
			}
		});
/*		This will be the friends photo feed. Not implemented yet
		var tab2 = Ti.UI.createTab({
			icon: '/icons/light_heart.png',
			window: win2
		});
		win2.containingTab = tab2;
	
		tab2.addEventListener('click', function(e){
			Ti.UI.fireEvent('openCamera');
		})
*/		
		var tab3 = Ti.UI.createTab({
			icon: '/icons/light_camera.png',
			focusable: false,
			touchEnabled: false,
			window: win3
		});
		win3.containingTab = tab3;
/*		This will be the search pane. Not implemented yet	
		var tab4 = Ti.UI.createTab({
			icon: '/icons/light_search.png',
			window: win4
		});
		win4.containingTab = tab4;
*/		
		var tab5 = Ti.UI.createTab({
			icon: '/icons/light_gears.png',
			window: logoutWindow
		});
		logoutWindow.containingTab = tab5;
		tab5.addEventListener('click', function (e) {applicationTabGroup.setActiveTab(tab5);});
		
		applicationTabGroup.addTab(tab1);
		//FIXME implement the friend photo feed
		//applicationTabGroup.addTab(tab2);
		applicationTabGroup.addTab(tab3);
		//FIXME implement the search pane
		//applicationTabGroup.addTab(tab4);
		applicationTabGroup.addTab(tab5);
		
		var cameraBtn = Ti.UI.createButton({
			left: 128,
			bottom: 0,
			width: 64,
			height: 55,
			backgroundColor: 'transparent',  // '#5D3879',
			//image: '/icons/light_camera.png',
			borderRadius: 5,
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
		
		cameraBtn.addEventListener('click', 
			function() {
				Ti.API.info("cameraBtn click handler");
				if (acs.currentUser()) {
					takePhoto();
				}			
				else {
					alert("Please log in or sign up first");
				}
			}
		);
	
		applicationTabGroup.add(cameraBtn);	
		
	}
	
	return applicationTabGroup;
};

function setDefaultActiveTab() {
	applicationTabGroup.setActiveTab(0);	
}

function takePhoto () {
	Ti.API.info("takePhoto");				
	var cancelCallback = function () {
		alert("calling cancelCallback ");
	};
	try {
		CameraView.createCameraView(cancelCallback, sharePhoto);		
	}
	catch (ex) {
		Ti.API.info("takePhoto threw an exception. " + ex.message);
	}
}
	
function sharePhoto(image) {
	Ti.API.info("sharePhoto: refresh the thumbnail window");
	ThumbnailsWindow.refreshThumbnails();
	Ti.API.info("This is where the user chooses who to share this image with");
}

exports.createApplicationTabGroup = createApplicationTabGroup;
exports.setDefaultActiveTab = setDefaultActiveTab;

