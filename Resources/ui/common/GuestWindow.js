/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */



function createGuestWindow(rootWindow) {
	'use strict';
	var ThumbnailsWindow,
		thumbnailsWindow,
		guestTabGroup,
		tab1,
		cleanup = function() {
			tab1 = null;
			Ti.App.guestTabGroup = null;
		};

	ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
	thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow();

	//  crate a tab group with a single tab to hold the thumbnail window stack
	guestTabGroup = Ti.UI.createTabGroup();
	Ti.App.guestTabGroup = guestTabGroup;	
	tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: thumbnailsWindow
	});

	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	//thumbnailsWindow.setTabBarHidden(true);
	guestTabGroup.addTab(tab1);
	guestTabGroup.setActiveTab(0);
	guestTabGroup.open();  //{transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});    
    guestTabGroup.addEventListener('close', cleanup);
	   
	//FIXME do we need to return this?
	return thumbnailsWindow;
}

exports.createGuestWindow = createGuestWindow;