// copyright 2012 by Monique Barbanson. All rights reserved.
//
// Detail window for photos
"use strict";

var detailWindow = null;

exports.detailWindow = function () {
	return detailWindow;
};

exports.showPreview = function(thumbView) {
	var imgView = null;
	if (!detailWindow) {
		detailWindow = Ti.UI.createWindow({
						        backgroundColor: 'black',
						        barColor: 'black',
						   		});
		imgView = Ti.UI.createImageView({
			title: 'preview',
			backgroundColor: 'black',
			width: Ti.UI.FILL,
			height: Ti.UI.FILL
		});
		detailWindow.imgView = imgView;
		detailWindow.add(imgView);
	}
	imgView = detailWindow.imgView;
	// use small_240 if present, otherwise use the thumbnail itself or fallback image if neither has a value
	imgView.image = thumbView.urls? thumbView.urls.small_240 : (thumbView.image? thumbView.image : '/photos/IMG_0001.JPG');
	imgView.show();
	
	return detailWindow;
};

