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

	// no need to add the tab group to the rootwindow
	// just create and return the tabgroup
	// open it later on	
	function createApplicationTabGroup() {
		var tabGroup =	Ti.UI.createTabGroup();	
		tabGroup.addEventListener('newLoggedInUser', function () {
																	Ti.API.info("Received newLoggedInUser event. Rebuilding feedWindow");
																	FeedWindow.showFriendsFeed();					
																});										
		return tabGroup;
	}	
	
	function setDefaultActiveTab(tabGroup) {
		if (tabGroup) {
			tabGroup.setActiveTab(0);			
		}	
	}
	
	
	function addFashionistTabs(tabGroup) {
		//create app tabs
		var	feedWindow = FeedWindow.createFeedWindow(),
			win2 = Ti.UI.createWindow(),
			win3 = Ti.UI.createWindow(),
			win4 = Ti.UI.createWindow(),
			logoutWindow,
			tab1, tab2, tab3, tab4, tab5, 
			cameraBtn, galleryBtn;
	
		// tabgroup containing main Fashionist Tabs ie: feed, featured, camera, gallery, settings
		Ti.App.mainTabGroup = tabGroup;		
																		
		// left most tab is the feed
		tab1 = Ti.UI.createTab({
								icon:	Ti.UI.iPhone.SystemIcon.MOST_RECENT,
								height: Ti.UI.FILL,	
								width: '20%',	
								window: feedWindow 
							});
		tab1.tabGroup = tabGroup;
		tabGroup.addTab(tab1);
		feedWindow.containingTab = tab1;
		Ti.App.getFeedTab = function () { return tab1;};
		
		// this tab requires a logged in user
		tab1.addEventListener('focus', function (e) {
			if (acs.currentUser()) {
				Ti.API.info("Feed page");
			}
			else {
				alert('Please log in or sign up first');
			}
		});
		
		
		FeedWindow.showFriendsFeed();

				
		// favorites feed
		tab2 = Ti.UI.createTab({
			//icon: '/icons/light_star.png',
			icon: Ti.UI.iPhone.SystemIcon.FEATURED,
			height: Ti.UI.FILL,	
			width: '20%',				
			window: win2
		});
		tab2.tabGroup = tabGroup;
		win2.containingTab = tab2;
		tabGroup.addTab(tab2);
		
		tab2.addEventListener('focus', function(e){
			Ti.API.info("Featured page. ");
			tabGroup.setActiveTab(0); // go back to feed for now
		});
		
		// camera tab
		tab3 = Ti.UI.createTab({
			icon: '/icons/light_camera.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: win3
		});
		win3.containingTab = tab3;
		tab3.tabGroup = tabGroup;
		tabGroup.addTab(tab3);
		
		tab3.addEventListener('focus', function(e){
			Ti.API.info("cameraBtn click handler");
			var win,
				cancelCallback = function () {
									Ti.API.info("Take photo cancel callback");
									Ti.Media.hideCamera(); 
							},
				successCallback = function (e) {
									Ti.API.info("Take Photo success callback");
									CameraView.photoSuccessCallback(e);
							};
			if (acs.currentUser()) {
				CameraView.takePhoto(successCallback, cancelCallback);
				// switch over to feed window and open camera or photo gallery on top so we know what will be visible when we close the camera/photo gallery				
				tabGroup.setActiveTab(0);		
			}			
			else {
				alert("Please log in or sign up first");
			}
		});
		
		// gallery tab
		tab4 = Ti.UI.createTab({
			icon: '/icons/light_pictures.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: win4
		});
		win4.containingTab = tab4;
		tab4.tabGroup = tabGroup;
		tabGroup.addTab(tab4);
		
		tab4.addEventListener('focus', function(e){
			Ti.API.info("Gallery click handler");
			var win,
				cancelCallback = function () {
									Ti.API.info("Pick photo cancel callback");
									Ti.Media.hideCamera();
							},
				successCallback = function (e) {
									Ti.API.info("Pick Photo success callback");
									CameraView.photoSuccessCallback(e);
							};
			if (acs.currentUser()) {
				CameraView.pickPhoto(successCallback, cancelCallback);
				// switch over to feed window and open camera or photo gallery on top so we know what will be visible when we close the camera/photo gallery
				tabGroup.setActiveTab(0);
			}			
			else {
				alert("Please log in or sign up first");
			}
		});

		// settings tab
		logoutWindow = LogoutWindow.createLogoutWindow();	
		tab5 = Ti.UI.createTab({
			icon: '/icons/light_gears.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: logoutWindow
		});
		logoutWindow.containingTab = tab5;
		tab5.tabGroup = tabGroup;
		LogoutWindow.initLogoutWindow(logoutWindow, tab5);
		
		tabGroup.addTab(tab5);
		tab5.addEventListener('focus', function (e) {
			Ti.API.info("settings page");
		});
		
		// default to Feed
		tabGroup.setActiveTab(0);
	}
	
	// Called once we've established a logged in user
	function initAppUI () {
		var tabGroup = createApplicationTabGroup();
		addFashionistTabs(tabGroup);	
	}
	
	exports.createApplicationTabGroup = createApplicationTabGroup;
	exports.setDefaultActiveTab = setDefaultActiveTab;
	exports.initAppUI = initAppUI;

} ());
