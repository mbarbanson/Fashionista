/**
 * Copyright 2013 by Monique Barbanson. All rights reserved.
 * @author Monique Barbanson
 */

exports.createApplicationWindow = function (title) {
	'use strict';
	var self = Ti.UI.createWindow({
		title:title,
		backgroundImage: '/images/Default.png',		
//		barColor: '#5D3879',
		navBarHidden: true,
		visible: false,
		exitOnclose: true
	});
	self.open();
	return self;
};
