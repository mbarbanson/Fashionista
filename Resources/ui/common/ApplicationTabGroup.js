"use strict";

var CameraView = require('/ui/common/CameraView');
var LogoutWindow = require('/ui/common/LogoutWindow');
var ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
//var FeedWindow = require('ui/common/FeedWindow');
	
function createApplicationTabGroup(rootWindow) {
	//create module instance
	var self = Ti.UI.createTabGroup({
		backgroundColor: 'yellow'
	});
	
	rootWindow.add(self);
	
	//alert("about to create FeedWindow");
	//create app tabs

	var thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow(),
		win2 = Ti.UI.createWindow(),
		win3 = Ti.UI.createWindow(),
		win4 = Ti.UI.createWindow(),
		logoutWindow = new LogoutWindow();
	
	var tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: thumbnailsWindow
	});
	thumbnailsWindow.containingTab = tab1;
	tab1.addEventListener('click', function (e) {self.setActiveTab(0);});
	
	var tab2 = Ti.UI.createTab({
		icon: '/icons/light_heart.png',
		window: win2
	});
	win2.containingTab = tab2;
	
	tab2.addEventListener('click', function(e){
		Ti.UI.fireEvent('openCamera');
	})
	
	var tab3 = Ti.UI.createTab({
		icon: '/images/KS_nav_views.png',
		window: win3
	});
	win3.containingTab = tab3;
		
	var tab4 = Ti.UI.createTab({
		icon: '/icons/light_search.png',
		window: win4
	});
	win4.containingTab = tab4;
	
	var tab5 = Ti.UI.createTab({
		icon: '/icons/light_gears.png',
		window: logoutWindow
	});
	logoutWindow.containingTab = tab5;
	tab5.addEventListener('click', function (e) {self.setActiveTab(4);});
	
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	self.addTab(tab4);
	self.addTab(tab5);
	
	var cameraBtn = Ti.UI.createButton({
		left: 128,
		bottom: 0,
		width: 64,
		height: 55,
		backgroundColor: 'purple',  // '#5D3879',
		image: '/icons/light_camera.png',
		borderRadius: 5,
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	cameraBtn.addEventListener('click', 
		function() {
			Ti.API.info("cameraBtn click handler");
			takePhoto();
		}
	);

	self.add(cameraBtn);	
	self.setActiveTab(0);
	
	return self;
};

function takePhoto () {
	Ti.API.info("takePhoto");				
	var cancelCallback = function (cancel) {
		Ti.API.info("calling cancelCallback" + cancel);
	}
	CameraView.createCameraView(cancelCallback, sharePhoto);		
}
	
function sharePhoto(image) {
	Ti.API.info("refresh the thumbnail window");
	ThumbnailsWindow.refreshThumbnails(true);
	Ti.API.info("This is where the user chooses who to share this image with");
}

exports.createApplicationTabGroup = createApplicationTabGroup;
