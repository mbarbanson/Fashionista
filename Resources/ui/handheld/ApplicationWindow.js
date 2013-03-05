/*
 * Copyright 2013 by Monique Barbanson. All rights reserved.
 * @author Monique Barbanson
 */

exports.createApplicationWindow = function (title) {
	"use strict";
	var self = Ti.UI.createWindow({
		title: title,
		barColor: '#5D3879',
		tabBarHidden: true,
		visible:true,
		exitOnClose: true
	});
	return self;
};
