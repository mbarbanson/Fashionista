"use strict"

exports.getNavigationGroup = function (win) {
	if (win) {
		return win.navigationGroup;
	}
	return null;
}

exports.createFeedWindow = function (parentWin, user) {

	var acs,
		title, 
		flexSpace, 
		self;
/*
	title = Titanium.UI.createButton({
		color: 'white',
		focusable: false,
		enabled: true,
		title: user.username,
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	       	    
    flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
	self = Ti.UI.createWindow({
        backgroundColor: 'black',
        barColor: 'black', 
        titleControl: title,
        navBarHidden: true
    });
    */
    //self.setRightNavButton(refresh);

    var ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
	var thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow(user);
	//alert("about to create navGroup");
	/*
	navGroup = Titanium.UI.iPhone.createNavigationGroup({
   		window: thumbnailsWindow
	});
	thumbnailsWindow.navigationGroup = navGroup;

	self.navigationGroup = navGroup;
	self.add(navGroup);

	self.addEventListener('open', function(e) {
		thumbnailsWindow.open();
	});
*/
	//alert("created FeedWindow");
    //return self;
    return thumbnailsWindow;
};

exports.getNavigationGroup = function (feedWin) {
	if (feedWin) {
		return feedWin.navigationGroup;
	}
	else return null;	
}
