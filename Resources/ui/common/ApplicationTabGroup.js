/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
	var acs = require('lib/acs'),
		CameraView = require('/ui/common/CameraView'),
		LogoutWindow = require('/ui/common/LogoutWindow'),
		ThumbnailsWindow = require('ui/common/ThumbnailsWindow'),
		FeedWindow = require('ui/common/FeedWindow');

	//no need to add the tab group to the rootwindow	
	function createApplicationTabGroup() {
		var tabGroup =	Ti.UI.createTabGroup({
				tabHeight: 30
			});	
		return tabGroup;
	}
	
	function setDefaultActiveTab(tabGroup) {
		if (tabGroup) {
			tabGroup.setActiveTab(0);			
		}	
	}
	
	function addMainWindowTabs(tabGroup) {
		//create app tabs
		var	feedWindow = FeedWindow.createFeedWindow(),
			win2 = Ti.UI.createWindow(),
			win3 = Ti.UI.createWindow(),
			win4 = Ti.UI.createWindow(),
			logoutWindow,
			tab1, tab2, tab3, tab4, tab5, 
			cameraBtn, galleryBtn;
	
		tabGroup.addEventListener('newLoggedInUser', function () {
			Ti.API.info("Received newLoggedInUser event. Rebuilding feedWindow");
			FeedWindow.showFriendsFeed(feedWindow);					
		});

		tab1 = Ti.UI.createTab({
			backgroundColor: '#5D3879',
			icon: '/icons/light_home.png',
			height: Ti.UI.FILL,
			window: feedWindow   //thumbnailsWindow
		});
		tab1.tabGroup = tabGroup;

		feedWindow.containingTab = tab1;
		// this tab requires a logged in user
		tab1.addEventListener('click', function (e) {
			if (acs.currentUser()) {
				tabGroup.setActiveTab(0);
			}
			else {
				alert('Please log in or sign up first');
			}
		});
		tabGroup.addTab(tab1);
		
		FeedWindow.showFriendsFeed(feedWindow);		
		
		// favorites feed
		tab2 = Ti.UI.createTab({
			icon: '/icons/light_star.png',
			window: win2
		});
		tab2.tabGroup = tabGroup;
		win2.containingTab = tab2;
		tabGroup.addTab(tab2);
			
		tab2.addEventListener('click', function(e){
			Ti.API.info("Favorites feed. ");
			tabGroup.setActiveTab(tab2);
			Ti.App.fireEvent('newFriendPost');
			tabGroup.setActiveTab(tab1);
		});
		
		tab2.addEventListener('focus', function(e){
			Ti.API.info("Favorites feed. ");
			Ti.App.fireEvent('newFriendPost');
			tabGroup.setActiveTab(tab1);
		});
	
		tab3 = Ti.UI.createTab({
			icon: '/icons/light_camera.png',
			focusable: false,
			touchEnabled: false,
			window: win3
		});
		win3.containingTab = tab3;
		tab3.tabGroup = tabGroup;
		tabGroup.addTab(tab3);
	
		tab4 = Ti.UI.createTab({
			icon: '/icons/light_pictures.png',
			window: win4
		});
		win4.containingTab = tab4;
		tab4.tabGroup = tabGroup;
		tabGroup.addTab(tab4);
		
		logoutWindow = LogoutWindow.createLogoutWindow();	
		tab5 = Ti.UI.createTab({
			icon: '/icons/light_gears.png',
			window: logoutWindow
		});
		logoutWindow.containingTab = tab5;
		tab5.tabGroup = tabGroup;
		LogoutWindow.initLogoutWindow(logoutWindow, tab5);
		
		tabGroup.addTab(tab5);
		tab5.addEventListener('click', function (e) {
			tabGroup.setActiveTab(tab5);
		});
		
		cameraBtn = Ti.UI.createButton({
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
			function (e) {
				Ti.API.info("cameraBtn click handler");
				var win = Titanium.UI.createWindow(),
					cancelCallback = function () {
										Ti.API.info("Take photo cancel callback");
										tab3.close(win); 
										tabGroup.setActiveTab(tab1);
								};
				// switch over to feed window and open camera or photo gallery on top so we know what will be visible when we close the camera/photo gallery
				if (acs.currentUser()) {
					CameraView.takePhoto(cancelCallback);		
					tab3.open(win, {animated: true});
				}			
				else {
					alert("Please log in or sign up first");
				}
			}
		);
		
		galleryBtn = Ti.UI.createButton({
			left: 192,
			bottom: 0,
			width: 64,
			height: 55,
			backgroundColor: 'transparent',  // '#5D3879',
			//image: '/icons/light_camera.png',
			borderRadius: 5,
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
		
		galleryBtn.addEventListener('click', 
			function (e) {
				Ti.API.info("galleryBtn click handler");
				// switch over to feed window and open camera or photo gallery on top so we know what will be visible when we close the camera/photo gallery
				tabGroup.setActiveTab(tab1);
				if (acs.currentUser()) {
					CameraView.pickPhoto(function () {setDefaultActiveTab(tabGroup);});
				}			
				else {
					alert("Please log in or sign up first");
				}
			}
		);
	
		tabGroup.add(cameraBtn);	
		tabGroup.add(galleryBtn);
		tabGroup.open();		
	}
	
	// Called once we've established a logged in user
	function initAppUI () {
		var tabGroup = createApplicationTabGroup();
		addMainWindowTabs(tabGroup);
		tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.NONE});
		setDefaultActiveTab(tabGroup);		
	}
	
	exports.createApplicationTabGroup = createApplicationTabGroup;
	exports.addMainWindowTabs = addMainWindowTabs;
	exports.setDefaultActiveTab = setDefaultActiveTab;
	exports.initAppUI = initAppUI;

} ());
