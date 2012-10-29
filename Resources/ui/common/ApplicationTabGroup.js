

var acs = require('lib/acs');
var CameraView = require('/ui/common/CameraView');
var LogoutWindow = require('/ui/common/LogoutWindow');
var ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
var Contacts = require('lib/contacts');
var FB = require('lib/facebook');
//var FeedWindow = require('ui/common/FeedWindow');

//no need to add the tab group to the rootwindow	
function createApplicationTabGroup(rootWindow) {
	"use strict";
	var tabGroup =	Ti.UI.createTabGroup({
			backgroundColor: 'black',
			tabHeight: 40
		});	
	return tabGroup;
}

function setDefaultActiveTab(tabGroup) {
	"use strict";
	tabGroup.setActiveTab(0);	
}
	
function sharePhoto(photoUrl) {
	"use strict";

	Ti.API.info("sharePhoto: refresh the thumbnail window");
	ThumbnailsWindow.refreshThumbnails();
	Ti.API.info("This is where the user chooses who to share this image with");
	//FIXME move this behind a button
	Contacts.testContacts();
	//FIXME move this behind a button
	// log into facebook and link to external account on success
	FB.authorize();
	
	// post to wall
	FB.postToWall(photoUrl);
	// call this to login with facebook instead of having fashionista specific credentials
	//FB.linktoFBAccount();
}


function takePhoto () {
	"use strict";
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

function addMainWindowTabs(rootWindow, tabGroup) {
	"use strict";
	//create app tabs
	var thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow(),
		//win2 = Ti.UI.createWindow(),
		win3 = Ti.UI.createWindow(),
		//win4 = Ti.UI.createWindow(),
		logoutWindow = new LogoutWindow(),
		navigationGroup = thumbnailsWindow.navigationGroup,
		tab1, tab2, tab3, tab4, tab5, 
		cameraBtn;
		
	try {		
		if (navigationGroup) {
			rootWindow.remove(navigationGroup);
			navigationGroup.hide();
		}	
		ThumbnailsWindow.refreshThumbnails();	
	}
	catch (ex) {
		alert("Caught an exception " + ex.message);
	}
	
	tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: thumbnailsWindow
	});
	thumbnailsWindow.containingTab = tab1;
	// this tab requires a logged in user
	tab1.addEventListener('click', function (e) {
		if (acs.currentUser()) {
			tabGroup.setActiveTab(0);
		}
		else {
			alert('Please log in or sign up first');
		}
	});
/*		This will be the friends photo feed. Not implemented yet
		tab2 = Ti.UI.createTab({
			icon: '/icons/light_heart.png',
			window: win2
		});
		win2.containingTab = tab2;
	
		tab2.addEventListener('click', function(e){
			Ti.UI.fireEvent('openCamera');
		})
*/		
	tab3 = Ti.UI.createTab({
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
	tab5 = Ti.UI.createTab({
		icon: '/icons/light_gears.png',
		window: logoutWindow
	});
	logoutWindow.containingTab = tab5;
	tab5.addEventListener('click', function (e) {tabGroup.setActiveTab(tab5);});
	
	tabGroup.addTab(tab1);
	//FIXME implement the friend photo feed
	//applicationTabGroup.addTab(tab2);
	tabGroup.addTab(tab3);
	//FIXME implement the search pane
	//applicationTabGroup.addTab(tab4);
	tabGroup.addTab(tab5);
	
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
			if (acs.currentUser()) {
				takePhoto();
			}			
			else {
				alert("Please log in or sign up first");
			}
		}
	);

	tabGroup.add(cameraBtn);	
	
}

exports.createApplicationTabGroup = createApplicationTabGroup;
exports.addMainWindowTabs = addMainWindowTabs;
exports.setDefaultActiveTab = setDefaultActiveTab;

