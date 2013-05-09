/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

function logoutCallback () {
	'use strict';
	var acs = require('lib/acs'),
		GuestWindow = require('ui/common/GuestWindow');
		
	Ti.API.info('Congratulations, you successfully logged out');
	Ti.App.mainTabGroup.close();
	Ti.App.mainTabGroup = null;
	GuestWindow.createGuestWindow(Ti.App.rootWindow);
}
	
function displayNews () {
	'use strict';
	Ti.API.info("displaying all friends requests");
}

function displayMe (win) {
	'use strict';
	Ti.API.info("displaying current user settings");
		
	var acs = require('lib/acs'), 
		FB = require('lib/facebook'), 
		ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
		InviteView = require('ui/common/InviteView'),
		logoutBtn = Ti.UI.createButton({
	        title: Ti.Locale.getString('logout') + " " + acs.currentUser().username,
	        bottom: '5%',
			width: '90%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'center',
			backgroundColor: 'white'
	    }),
	    findFriendsLabel, 
	    inviteTable,
	    privacyLabel;
    
	// event listeners
	logoutBtn.addEventListener('click', function() {
		acs.logout(logoutCallback);
		//do not logout of FB. Should only have to relink accounts if accessToken expires
	});
	
    win.add(logoutBtn);


	// add remaining of the objects on the page
	findFriendsLabel = Ti.UI.createLabel({
		text : Ti.Locale.getString('findFriendsOnFashionist'),
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		wordWrap : true,
		color : 'black',
		top : '10%',
		left : '5%',
		height : 30,
		width : '90%',
		paddingLeft : 2,
		paddingRight : 2,
		font : {
			fontWeight : 'bold',
			fontSize : '18'
		}
	});
	win.add(findFriendsLabel);

	inviteTable = InviteView.createInviteView(win, '15%');
	win.add(inviteTable);

	privacyLabel = Ti.UI.createLabel({
		text : Ti.Locale.getString('noPostWithoutApproval'),
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		wordWrap : true,
		color : 'black',
		bottom : '15%',
		left : '5%',
		height : 100,
		width : '90%',
		paddingLeft : 2,
		paddingRight : 2,
		font : {
			fontWeight : 'normal',
			fontSize : '12'
		}
	});
	win.add(privacyLabel);
}

function createSettingsWindow() {
	'use strict';

	// title control
	var newsTitle = Ti.Locale.getString('news'),
		meTitle = Ti.Locale.getString('meSettings'),
		settingsWin = Ti.UI.createWindow({
							backgroundColor: '#DDD',
							barColor: '#5D3879'
						}),
		titleTabBar = Titanium.UI.iOS.createTabbedBar({
							labels:[newsTitle, meTitle],
							index: 0,
							style:Titanium.UI.iPhone.SystemButtonStyle.BAR
						});
	settingsWin.setTitleControl(titleTabBar);
	
	titleTabBar.setIndex(1);
	displayMe(settingsWin);
	
	titleTabBar.addEventListener('click', function(e)
	{
		if (titleTabBar.index === 0) {
			displayNews(settingsWin);
		}
		else {
			displayMe(settingsWin);
		}
	});

	return settingsWin;	
}	



exports.createSettingsWindow = createSettingsWindow;