/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	
	function createInboxView () {
		var inboxView = Ti.UI.createTableView({
			top: 0,
			height : '100%',
			//rowHeight : Ti.UI.SIZE,
			width : '100%',
			left : 0,
			//borderRadius : 5,
			separatorColor: '#DDD',
			backgroundColor: 'grey'			
		});
		return inboxView;	
	}


	function displayMessage(containingTab, parentWin, row, message) {
		/*jslint regexp: true */	
		if (!message || !message.subject || !message.body) {
			Ti.API.error("bad message");
			return;
		}
		var	acs = require('lib/acs'),
			Flurry = require ('sg.flurry'),
			PostView = require('ui/common/PostView'),
			ProfileView = require('ui/common/ProfileView'),		
			fromUser = message && message.from,
			user = acs.currentUser(),
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
			avatar, avatarView, clickHandler, pid, uid, payload, type,
			preSpaces = "", i, numSpaces = 0,
			label = Ti.UI.createTextArea({
				        autoLink: Ti.UI.AUTOLINK_URLS,
				        editable: false,
				        scrollable: false,
				        font:{fontFamily:'Arial', fontSize:defaultFontSize, fontWeight:'normal'},
						textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
						wordWrap : true,
						top: 0,
						left: 50,
						height: Ti.UI.SIZE,
						width: Ti.UI.FILL,
						color: 'black',
						ellipsize: true,
						visible: true
						//borderWidth: 1,
						//borderColor: 'black'	
			}),
			authorBtn = null,
			addApproveBtn, activityIndicator = null,
			successCallback = function () { 
				addApproveBtn.title = Ti.Locale.getString('mutualFriend');
				addApproveBtn.setEnabled(false);
				activityIndicator.hide();
				parentWin.setRightNavButton(null);
			},
			errorCallback = function () { 
				addApproveBtn.title = Ti.Locale.getString('addFriend');
				addApproveBtn.removeEventListener('click', clickHandler);
				clickHandler = function (e) {
					Flurry.logEvent('addFriend', {'username': user.username, 'email': user.email}); 
					acs.addFriends([user.id]);
					activityIndicator.hide();
					parentWin.setRightNavButton(null);										
				};
			},
			cachedFriendIdsList,
			messageBody = unescape(message.body), commentStart;

			payload = message && message.subject;
			payload = payload ? JSON.parse(payload) : null;
			type = payload && payload.type;
			pid = payload && payload.pid;
			uid = payload && payload.uid;

			if (fromUser) {
				avatar = acs.getUserAvatar(fromUser);
				avatarView = Ti.UI.createImageView({
					image: avatar, 
					left: 5, top: 5,
					height: 40, width: 40,
					borderRadius: 0,
					borderWidth: 1,
					borderColor: 'blue'
				});			
				row.add(avatarView);
				
				numSpaces = Math.ceil(fromUser.username.length * 1.6) + 4;
				for (i = 0; i < numSpaces; i = i + 1) {
					preSpaces += " ";
				}				
				authorBtn = Ti.UI.createButton({
								color: 'blue',
								style: 'Titanium.UI.iPhone.SystemButtonStyle.PLAIN',
								font:{fontFamily:'Arial', fontSize:defaultFontSize, fontWeight:'normal'},
								ellipsize: false,
								title: fromUser.username,
								left: 0, 
								top: (defaultFontSize + 2)/8,
								width:Ti.UI.SIZE, 
								height: Ti.UI.SIZE
								});
				authorBtn.addEventListener('singletap', function (e) {
															e.cancelBubble = true;
															e.bubbles = false;
															ProfileView.displayUserProfile(containingTab, fromUser);
															});
				avatarView.addEventListener('click', function (e) {
															e.cancelBubble = true;
															e.bubbles = false;					
															ProfileView.displayUserProfile(containingTab, fromUser);
															});	
																									
				label.add(authorBtn);
				label.value = preSpaces + messageBody;
				if (type === 'friend_request') {
					addApproveBtn = Ti.UI.createButton({
						title: Ti.Locale.getString('approveFriend'),
						left: '75%', 
						width: '23%',
						height: 30,
						font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'bold'},
						//backgroundColor: Ti.Locale.getString('complementaryColor'),
						style: 'Titanium.UI.iPhone.SystemButtonStyle.BORDERED',
						color: Ti.Locale.getString('themeColor'),
						borderRadius: 0,
						borderWidth: 1,
						borderColor: Ti.Locale.getString('themeColor')						
					});
					label.width = '55%';
					label.text = preSpaces + Ti.Locale.getString('friendRequestMessage');
					row.add(addApproveBtn);
					cachedFriendIdsList = acs.getSavedFriendIds();
					if (cachedFriendIdsList && cachedFriendIdsList.indexOf(uid) >= 0) {
						addApproveBtn.title = Ti.Locale.getString('mutualFriend');
						addApproveBtn.setEnabled(false);
					}
					else {
						clickHandler = function (e) {							
								if (!activityIndicator) {
									activityIndicator = Ti.UI.createActivityIndicator();
								}
								parentWin.setRightNavButton(activityIndicator);
								activityIndicator.show();								
								acs.approveFriendRequests([uid.toString()], successCallback, errorCallback);	
						};
						addApproveBtn.addEventListener('click', clickHandler);						
					}	
				} else {
					clickHandler = function (e) {
							Ti.API.info("selected message to display");
							e.cancelBubble = true;
							e.bubbles = false;
							if (!activityIndicator) {
								activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle, left:'90%'});
							}
							parentWin.setRightNavButton(activityIndicator);
							activityIndicator.show();													
							acs.showPost(pid, function (p) { 
								PostView.displayPostDetailsView(containingTab, p);
								activityIndicator.hide();
								parentWin.setRightNavButton(null);
								});	
					};
					row.addEventListener('singletap', clickHandler);
					label.addEventListener('singletap', clickHandler);										
				}												
			}
			row.add(label);	
											
	}


	
	function displayInbox (containingTab, parentWin) {
		var messages = require('lib/messages'),
			PostView = require('ui/common/PostView'),
			inboxView = createInboxView(),
			//friendRequestView = createInboxView(),
			doDisplayInbox = function (messages) {
				var numMessages = (messages && messages.length) || 0,
					i, row, message,					
					fromUser;
					for (i = 0; i < numMessages ; i += 1) {
						message = messages[i];
						fromUser = (message && message.from);						
						row = Ti.UI.createTableViewRow({
							className: 'messageRow',
							indentationLevel: 4,
							height: Ti.UI.SIZE
						});
						displayMessage(containingTab, parentWin, row, message);						
						inboxView.appendRow(row);
					}	
			},
			errorCallback = function () { 
				alert("Fashionist cannot access your Inbox. Please retry in a little while.");
			},
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle});
		if (parentWin) {parentWin.setRightNavButton(activityIndicator);} 
		activityIndicator.show();
		messages.showInbox(doDisplayInbox, errorCallback);
		activityIndicator.hide();
		if (parentWin) {parentWin.setRightNavButton(null);}
		return inboxView;
		}



	
	function createInboxWindow(containingTab, parentWin) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			currentUser = acs.currentUser(),
			inboxWin = Ti.UI.createWindow({
				//title: currentUser.username + "\'s Inbox", 
				backgroundColor: "grey",
		        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
		        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT]				
				}),
			inboxView = displayInbox(containingTab, parentWin),
			notifyAddedFriends, notificationSuccess;
		inboxWin.add(inboxView);
		inboxWin.parentWin = parentWin; 
		return inboxWin;
	}
	
		
	function displayUserInbox(containingTab) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			InboxView = require('ui/common/ProfileView'),
			inboxWin,
			currentUser = acs.currentUser();
		Ti.API.info('showing user inbox outside of settings window context');
		Flurry.logEvent('displayUserProfile', {'username': currentUser.username, 'email': currentUser.email});
		inboxWin = createInboxWindow(containingTab, containingTab.window);
		containingTab.open(inboxWin);			
		
	}

	exports.displayUserInbox = displayUserInbox;
	exports.createInboxView = createInboxView;	
	exports.displayInbox= displayInbox;
	
} ());
