/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';	
	var savedTabIndex = -1, 
		privSettingsWindow = null;
		
	
	function logoutCallback () {
		var acs = require('lib/acs'),
			GuestWindow = require('ui/common/GuestWindow');
			
		Ti.API.info('Congratulations, you successfully logged out');
		if (Ti.App.mainTabGroup) {
			Ti.App.mainTabGroup.close();
			Ti.App.mainTabGoup = null;			
		}

		GuestWindow.createGuestWindow(Ti.App.rootWindow);
	}

		
	function displayNews (win) {
		var //acs = require('lib/acs'),
			InboxView = require('ui/common/InboxView'),
			//currentUser = acs.currentUser(),
			inboxView;

		Ti.API.info("displaying all notifications received by current user");
		// do the work after we've set up the spinner
		inboxView = InboxView.displayInbox(win.containingTab, win);		
		win.add(inboxView);	
		win.inboxView = inboxView;
	}

	
	function hideNews (win) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			currentUser = acs.currentUser(),
			inboxView = win.inboxView;
		Ti.API.info("hiding messages received by current user");
		if (inboxView) {
			win.remove(inboxView);			
			inboxView.visible = false;
			inboxView.hide(); 
		}		
		Flurry.logEvent('hideNews', {'username': currentUser.username, 'email': currentUser.email});
		win.inboxView = null;	
	}

	
	function hideMe(win) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			currentUser = acs.currentUser();		
		if (win.profileView) {
			win.profileView.visible = false;
			win.profileView.hide(); 
			win.remove(win.profileView);
		}
		Flurry.logEvent('hideUserProfile', {'username': currentUser.username, 'email': currentUser.email});						
		win.profileView = null;	
	}

	
	function displayMe (win) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			ProfileView = require('ui/common/ProfileView'),
			currentUser = acs.currentUser(),
		    profileView,
		    activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle}),
			logoutBtn = Ti.UI.createButton({
							        title: Ti.Locale.getString('logout') + " " + acs.currentUser().username,
							        bottom: '5%',
							        left: 7,
									width: Ti.App.SCREEN_WIDTH*0.96,
									height: 40,
									font: {
										fontWeight: 'normal',
										fontSize: '17'
									},
									textAlign: 'center',
									borderRadius: 0,
									color: 'blue',
									style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
									//backgroundColor: '#FFF'
							    });
		
		win.setRightNavButton(activityIndicator); 
		activityIndicator.show();
					    
		// event listeners
		logoutBtn.addEventListener('click', function() {
			acs.logout(logoutCallback);
			//do not logout of FB. Should only have to relink accounts if accessToken expires
		});
								    
	    profileView = ProfileView.createProfileView(currentUser);
		profileView.add(logoutBtn);	

		win.add(profileView);
		win.profileView = profileView;
		
		win.setRightNavButton(null); 
		activityIndicator.hide();

		Flurry.logEvent('displayProfile', {'username': currentUser.username, 'email': currentUser.email});	
	}

	
	function hideFriends(win) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),		
			currentUser = acs.currentUser(),
			friendsView = win.friendsView;		

		if (friendsView) {
			win.friendsView.visible = false;
			friendsView.hide();
			win.remove(friendsView);				
		}
		Flurry.logEvent('hideFriends', {'username': currentUser.username, 'email': currentUser.email});								
		win.friendsView = null;		
	}
	
	
	function displayFriends (win) {
		Ti.API.info("displaying current user settings");		
		var acs = require('lib/acs'), 
			FB = require('lib/facebook'), 
			ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			InviteView = require('ui/common/InviteView'),
			friendsView,
			Flurry = require('sg.flurry'),
			currentUser = acs.currentUser(),			
		    findFriendsLabel, 
		    inviteTable,
		    privacyLabel;
		    
	    friendsView = Ti.UI.createView({backgroundColor: '#DDD', width: Ti.UI.FILL, height: Ti.UI.FILL});
	
		// add remaining of the objects on the page
		findFriendsLabel = Ti.UI.createLabel({
			text : Ti.Locale.getString('findFriendsOnFashionist'),
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			wordWrap : true,
			color : 'black',
			top : '5%',
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
		friendsView.add(findFriendsLabel);
		friendsView.findFriendsLabel = findFriendsLabel;
	
		inviteTable = InviteView.createInviteView(win, '15%');
		friendsView.add(inviteTable);
		friendsView.inviteTable = inviteTable;
	
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
		friendsView.add(privacyLabel);
		friendsView.privacyLabel = privacyLabel;
		
		win.add(friendsView);
		win.friendsView = friendsView;
		
		Flurry.logEvent('displayFriendsTab', {'username': currentUser.username, 'email': currentUser.email});	
	}

	
	
	function showSettingsWindow(index) {
		var ProfileView = require('ui/common/ProfileView'),
			Flurry = require('sg.flurry'),
			acs = require('lib/acs'),
			currentUser = acs.currentUser(),
			settingsWin = privSettingsWindow,
		    titleTabBar = settingsWin.titleControl,
		    newIndex = index || titleTabBar.index;
		
	    if (savedTabIndex === 2 && newIndex !== 2) {
			ProfileView.saveProfileChanges(currentUser);
			hideMe(settingsWin);					
	    }
	    else if (savedTabIndex === 0 && newIndex !== 0) {
			hideNews(settingsWin);
	    }
	    else if (savedTabIndex === 1 && newIndex !== 1) {
			hideFriends(settingsWin);
	    }			
		if (newIndex === 0) {
			Flurry.logEvent('selectNewsTab', {'username': currentUser.username, 'email': currentUser.email});			
			displayNews(settingsWin);
		}
		else if (newIndex === 1){
			Flurry.logEvent('selectFriendsTab', {'username': currentUser.username, 'email': currentUser.email});			
			displayFriends(settingsWin);
		}
		else if (newIndex === 2) {
			Flurry.logEvent('selectMeTab', {'username': currentUser.username, 'email': currentUser.email});			
			displayMe(settingsWin);	
		}
		else {
			alert("Unknown Settings Window Tab selection");
			return;
		}
		savedTabIndex = newIndex;			
	}	

	
	
	function createSettingsWindow() {
		// title control
		var acs = require('lib/acs'),
			//Flurry = require('sg.flurry'),
			ProfileView = require('ui/common/ProfileView'),
			//currentUser = acs.currentUser(),
			newsTitle = Ti.Locale.getString('news'),
		    friendsTitle = Ti.Locale.getString('friends'),
			meTitle = Ti.Locale.getString('profileSettings'),
			settingsWin = Ti.UI.createWindow({
								backgroundColor: 'grey',
						        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
								extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT]
								}),
			titleTabBar = Titanium.UI.iOS.createTabbedBar({
								labels:[newsTitle, friendsTitle, meTitle],
								index: 0,
								style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
								borderRadius: 0,
								//borderWidth: 1,
								//borderColor: '#333',
								top: 7,
								height: 30
								//backgroundColor: Ti.Locale.getString('themeColor')
							}),
			newIndex = titleTabBar.index;
		    //activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle});
			
		privSettingsWindow = settingsWin;
		settingsWin.setTitleControl(titleTabBar);
		//settingsWin.activityIndicator = activityIndicator;
		// defaults to showing the current user profile
		titleTabBar.setIndex(2);
		titleTabBar.addEventListener('click', function(e)
		{
		    showSettingsWindow(e.index);
		});
		
		settingsWin.addEventListener('blur', function (e) {
			var user = acs.currentUser(),
				hasChangedVisibly = false;
			if (titleTabBar.getIndex() === 2) {
				hasChangedVisibly = ProfileView.saveProfileChanges(user);
			}
		});
	
		return settingsWin;	
	}
	

	function getSettingsWindow() {
		var win = null;
		if (privSettingsWindow) {
			win = privSettingsWindow;
		}
		else {
			win = createSettingsWindow();
		}
		return win;
	}
	

	
		
	
	exports.createSettingsWindow = createSettingsWindow;
	exports.getSettingsWindow = getSettingsWindow;
	exports.showSettingsWindow = showSettingsWindow;
	exports.displayMe = displayMe;
	exports.displayFriends = displayFriends;
	exports.displayNews = displayNews;	
} ());
