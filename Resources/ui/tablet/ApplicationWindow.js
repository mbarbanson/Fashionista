/*
 * Copyright 2013 by Monique Barbanson. All rights reserved.
 * @author Monique Barbanson
 */

exports.createApplicationWindow = function (title) {
	'use strict';
	var self = Ti.UI.createWindow({
		title:title,
		barColor: '#5D3879',
		visible: false,
		exitOnclose: true
	});
	
	return self;
};
