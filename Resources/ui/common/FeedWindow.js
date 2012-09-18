"use strict"

function FeedWindow(user) {

	var acs,
		refresh, 
		title, 
		flexSpace, 
		self;
	    
   // add a refresh button to the navBar 
	refresh = Titanium.UI.createButton({
		systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
		style: Titanium.UI.iPhone.SystemButtonStyle.BAR
	});

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
        barColor: 'black',  //'#5D3879',
        titleControl: title
    });
    self.setRightNavButton(refresh);
    
    var ThumbnailsView = require('ui/common/ThumbnailsView');
	var thumbnailsView = ThumbnailsView.createThumbnailsView(user, self);

	refresh.addEventListener('click', function(e) {thumbnailsView.fireEvent('refreshThumbs');});
	
    return self;
};

module.exports = FeedWindow;