/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	

	var acs = require('lib/acs'),
		Flurry = require('sg.flurry'),	
		SettingsWindow = require('/ui/common/SettingsWindow'),
		FeedWindow = require('ui/common/FeedWindow');

	// no need to add the tab group to the rootwindow
	// just create and return the tabgroup
	// open it later on	
	function createApplicationTabGroup() {
		var tabGroup =	Ti.UI.createTabGroup({tabsTintColor: Ti.Locale.getString('themeColor')});
		Ti.App.mainTabGroup = tabGroup;	
		tabGroup.addEventListener('newLoggedInUser', 
			function () {
							Ti.API.info("Received newLoggedInUser event. Rebuilding feedWindow");
							FeedWindow.showFriendsFeed(false, null, null);					
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
		Ti.API.info("populating tabs");
		var	friendFeedWindow = FeedWindow.createFeedWindow('friendFeed'),
			findFeedWindow = FeedWindow.createFeedWindow('findFeed'),
			win3 = Ti.UI.createWindow({
										backgroundColor: 'white',
										statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
								        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT]
								        }),
			win4 = Ti.UI.createWindow({
										backgroundColor: 'white',
										statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
								        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT]
								        }),
			settingsWindow,
			currentUser = acs.currentUser(),
			tab1, tab2, tab3, tab4, tab5, 
			cameraBtn, galleryBtn,
			cleanup = function (e) {
				friendFeedWindow.containingTab = null;
				findFeedWindow.containingTab = null;
				win3.containingTab = null;
				win4.containingTab = null;
				settingsWindow.containingTab = null;
				tab1 = tab2 = tab3 = tab4 = tab5 = null;
			},
			blurHandler = function(e) {
								if (FeedWindow.dismissGettingStartedOverlay(findFeedWindow)) {
									tab2.removeEventHandler('blur', blurHandler);
								}
							};
	
		// tabgroup containing main Fashionist Tabs ie: feed, featured, camera, gallery, settings
		
		tabGroup.addEventListener('close', cleanup);																
		// left most tab is the feed
		FeedWindow.setCurrentFriendFeedWindow(friendFeedWindow);
		tab1 = Ti.UI.createTab({
								title: Ti.Locale.getString('friendsFeed'),			
								icon: '/icons/53-house.png',
								height: Ti.UI.FILL,	
								width: '20%',	
								window: friendFeedWindow
							});

		tabGroup.addTab(tab1);
		friendFeedWindow.containingTab = tab1;
		
		// this tab requires a logged in user
		tab1.addEventListener('focus', function (e) {
			if (currentUser) {
				Ti.API.info("Friend Feed tab received a focus event");
				Flurry.logEvent('focusTab', {'tab': 'friendsFeed', 'username': currentUser.username, 'email': currentUser.email});
				FeedWindow.handleEmptyFriendsFeed();																										
			}
			else {
				alert('Please log in or sign up first');
			}
		});
		
		FeedWindow.showFriendsFeed(false, null, null);
		friendFeedWindow.initialized = true;

				
		// find feed
		FeedWindow.setCurrentFindFeedWindow(findFeedWindow);
		tab2 = Ti.UI.createTab({
			title: Ti.Locale.getString('publicFeed'),			
			icon: '/icons/60-signpost.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: findFeedWindow
		});

		findFeedWindow.containingTab = tab2;
		tabGroup.addTab(tab2);
		
		tab2.addEventListener('focus', function(e){
			Ti.API.info("Explore tab received a focus event");
			Flurry.logEvent('focusTab', {'tab': 'publicFeed', 'username': currentUser.username, 'email': currentUser.email});
			if (!findFeedWindow.initialized) {
				FeedWindow.showFindFeed(true, null, null); // do not force refresh every time we switch to explore tab	
			}																		
			findFeedWindow.initialized = true;
		});
		
		// camera tab
		tab3 = Ti.UI.createTab({
			title: Ti.Locale.getString('camera'),			
			icon: '/icons/86-camera.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: win3
		});
		win3.containingTab = tab3;
		//tab3.tabGroup = tabGroup;
		tabGroup.addTab(tab3);
		
		tab3.addEventListener('focus', function(e){
			Ti.API.info("cameraBtn click handler");
			var CameraView = require('/ui/common/CameraView'),
				cancelCallback = function () {
									Ti.API.info("Take photo cancel callback");
									Flurry.logEvent('takePhotoCancel', {'username': currentUser.username, 'email': currentUser.email});																											
									Ti.Media.hideCamera();
									tabGroup.setActiveTab(0); 
							},
				successCallback = function (e) {
									Ti.API.info("Take Photo success callback");
									Flurry.logEvent('takePhotoSuccess', {'username': currentUser.username, 'email': currentUser.email});																		
									CameraView.photoSuccessCallback(e);
									//tabGroup.setActiveTab(0);
							};
			if (currentUser) {
				CameraView.takePhoto(successCallback, cancelCallback);
				Flurry.logEvent('focusTab', {'tab': 'camera', 'username': currentUser.username, 'email': currentUser.email});									
				
				// switch over to feed window and open camera or photo gallery on top so we know what will be visible when we close the camera/photo gallery				
				tabGroup.setActiveTab(0);		
			}			
			else {
				alert("Please log in or sign up first");
			}
		});
		
		// gallery tab
		tab4 = Ti.UI.createTab({
			title: Ti.Locale.getString('gallery'),			
			icon: '/icons/42-photos.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: win4
			});
		win4.containingTab = tab4;
		//tab4.tabGroup = tabGroup;
		tabGroup.addTab(tab4);
		
		tab4.addEventListener('focus', function(e){
			Ti.API.info("Gallery click handler");
			var CameraView = require('/ui/common/CameraView'),
				cancelCallback = function () {
									Ti.API.info("Pick photo cancel callback");
									Flurry.logEvent('cancelPickPhoto', {'username': currentUser.username, 'email': currentUser.email});									
									Ti.Media.hideCamera();									
									tabGroup.setActiveTab(0);
							},
				successCallback = function (e) {
									Ti.API.info("Pick Photo success callback");
									Flurry.logEvent('PickPhotoSuccess', {'username': currentUser.username, 'email': currentUser.email});																		
									CameraView.photoSuccessCallback(e);
									//tabGroup.setActiveTab(0);
							};
			if (currentUser) {
				Flurry.logEvent('focusTab', {'tab': 'photoGallery', 'username': currentUser.username, 'email': currentUser.email});
				CameraView.pickPhoto(successCallback, cancelCallback);
				// switch over to feed window and open camera or photo gallery on top so we know what will be visible when we close the camera/photo gallery
				tabGroup.setActiveTab(0);
			}			
			else {
				alert("Please log in or sign up first");
			}
		});

		// settings tab
		settingsWindow = SettingsWindow.createSettingsWindow();	
		tab5 = Ti.UI.createTab({
			title: Ti.Locale.getString('userProfile'),
			icon: '/icons/111-user.png',
			height: Ti.UI.FILL,	
			width: '20%',				
			window: settingsWindow
		});
		settingsWindow.containingTab = tab5;
		tab5.tabGroup = tabGroup;
		
		tabGroup.addTab(tab5);
		tab5.addEventListener('focus', function (e) {
			Flurry.logEvent('focusTab', {'tab': 'settings', 'username': currentUser.username, 'email': currentUser.email});
			SettingsWindow.showSettingsWindow();
			Ti.API.info("handle focus on settings page");
		});
		
		FeedWindow.addFeedEventListeners(friendFeedWindow);
		FeedWindow.addFeedEventListeners(findFeedWindow);
			
	}
	
	// Called once we've established a logged in user
	function initAppUI () {
		Ti.API.info("init application UI");
		var tabGroup = createApplicationTabGroup(),
		    currentUser = acs.currentUser();
		Flurry.logEvent('initAppUIforCurrentUser', {'username': currentUser.username, 'email': currentUser.email});
		addFashionistTabs(tabGroup);	
	}
	
	exports.createApplicationTabGroup = createApplicationTabGroup;
	exports.setDefaultActiveTab = setDefaultActiveTab;
	exports.initAppUI = initAppUI;

} ());
