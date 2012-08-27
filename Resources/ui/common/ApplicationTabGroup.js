"use strict";

var EditorView = require('/ui/common/EditorView');

function ApplicationTabGroup(user, rootWindow) {
	//create module instance
	var self = Ti.UI.createTabGroup({
		backgroundColor: 'purple'
	});
	rootWindow.add(self);
	
	var FeedWindow = require('ui/common/FeedWindow');
	var CameraView = require('/ui/common/CameraView');
	
	//create app tabs
	var feedWindow = new FeedWindow(user),
		win2 = Ti.UI.createWindow({title: user.username}),
		win3 = Ti.UI.createWindow(),
		win4 = Ti.UI.createWindow(),
		win5 = Ti.UI.createWindow();
	
	var tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: feedWindow
	});
	feedWindow.containingTab = tab1;
	
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
		window: win5
	});
	win5.containingTab = tab5;
	
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
	})
	cameraBtn.addEventListener('click', function(e){
		EditorView.createEditorView(self, user);
		CameraView.createCameraView(user, self, editPhoto);
	})
	
	self.add(cameraBtn);	
	self.setActiveTab(0);
	return self;
};

function editPhoto(user, parentWin, image) {
	Ti.API.info("This is where the user chooses who to share this image with");
	var editorView = EditorView.showEditorView(user, parentWin, image);
}

module.exports = ApplicationTabGroup;
