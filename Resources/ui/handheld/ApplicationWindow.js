/**
 * Copyright 2013 by Monique Barbanson. All rights reserved.
 * @author Monique Barbanson
 */

exports.createApplicationWindow = function (title) {
	"use strict";
	var self = Ti.UI.createWindow({
		title: title,
		//backgroundImage: '/images/Default.png',
		statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
		extendEdges: [Ti.UI.EXTEND_EDGES_ALL],		
		navBarHidden: true,
		visible:true,
		exitOnClose: true
	});
	self.open();
	return self;
};
