"use strict";

exports.createApplicationWindow = function (title) {
	var self = Ti.UI.createWindow({
		title: title,
		backgroundColor: 'black',
		barColor: '#5D3879',
		tabBarHidden: true,
		visible:true,
		exitOnClose: true
	});
	return self;
};
