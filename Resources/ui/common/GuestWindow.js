/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */



function createGuestWindow() {
	'use strict';
	var acs = require('lib/acs'),
		Flurry = require('sg.flurry'),
		LoginToolbar = require('ui/common/LoginToolbar'),
		ThumbnailsWindow,
		ApplicationTabGroup,
		LoginWindow,
		navGroup,  
		toolbar,
		ok,
		label,
		dialog,
		thumbnailsWindow,
		guestTabGroup,
		tab1;
	
	ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	LoginWindow = require('ui/common/LoginWindow');

	ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
	thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow();
	ThumbnailsWindow.refreshThumbnails();
	Flurry.logEvent('GuestPageThumbnailsVisible');
	//  crate a tab group with a single tab to hold the thubnail window stack
	guestTabGroup = Ti.UI.createTabGroup();
	Ti.App.guestTabGroup = guestTabGroup;
	
	tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: thumbnailsWindow
	});
	thumbnailsWindow.containingTab = tab1;
	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	thumbnailsWindow.setTabBarHidden(true);
	guestTabGroup.addTab(tab1);
	guestTabGroup.setActiveTab(0);
	guestTabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});

	// create fixed toolbar at bottom   
    toolbar = LoginToolbar.createLoginToolbar(tab1); 
    thumbnailsWindow.add(toolbar);
	   
	//FIXME do we need to return this?
	return thumbnailsWindow;
}

exports.createGuestWindow = createGuestWindow;