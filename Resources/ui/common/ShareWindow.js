/*
 * @author MONIQUE BARBANSON
 */

function createShareWindow(postModel, shareAction) {
	'use strict';
	var ApplicationTabGroup, 
		ListWindow, 
		social, 
		acs,
		FeedWindow, 
		shareBtn, 
		cancelBtn, 
		shareWindow, 
		shareTabGroup,
		thumbnail, 
		tab, 
		caption,
		captionHintText = 'Add a caption or tags',
		defaultCaption = 'How does this look?', 
		shareLabel, 
		shareTable, 
		tableData, 
		shareToFBFriends, 
		shareToAddressBook, 
		inviteFBFriends, inviteContacts, selectFBFriend, addSelectedFBFriends, 
		fashionistaFriends = [],
		photoBlob = postModel.photo,
		activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle});
			
	ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	ListWindow = require('ui/common/ListWindow');
	social = require('lib/social');
	acs = require('lib/acs');
	FeedWindow = require('ui/common/FeedWindow');
	
	// right nav button is Share
	shareBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title : L('shareButton')
	});
	cancelBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title : L('cancel')
	});

	// share window
	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	shareWindow = Ti.UI.createWindow({
		backgroundColor : '#ddd',
		color : 'black',
		barColor : '#5D3879',
		tabBarHidden: 'true',
		leftNavButton : cancelBtn,
		title : L('shareWindow')
	});
	
	shareBtn.addEventListener('click', function(e) {
		Ti.API.info("calling sharePhoto. photoBlob width " + photoBlob.width + " height " + photoBlob.height);
		var captionValue = caption.getValue(),
			senderId = acs.currentUserId(),
			message = "Your new post has been published",
			newPostNotify, addPostError;
						
		newPostNotify = function (post) {
				// newPostNotification
				Ti.API.info("Notifying friends of new post");
				social.newPostNotification(post);
				//update feed window with local info after caption has been updated in the cloud
				Ti.API.info("update local feed window with new post");
				Ti.API.info("FIRE EVENT: NEW POST from " + senderId);
				Ti.App.fireEvent('newPost', {"user_id": senderId, "post_id": post.id, "message": message});						
		};
			
		// go back to feed page
		shareTabGroup.close();
		// add post
		if (captionValue === captionHintText || captionValue === "") {
			postModel.caption = defaultCaption;			
		} else {
			postModel.caption = captionValue;			
		}

		FeedWindow.beforeSharePost(postModel, newPostNotify);
								
	});
	
	cancelBtn.addEventListener('click', function(e) {
		shareTabGroup.close();
	});
	//  crate a tab group with a single tab to hold the share window stack
	shareTabGroup = Ti.UI.createTabGroup();
	tab = Ti.UI.createTab({
		icon : '/icons/light_grid.png',
		window : shareWindow
	});
	shareWindow.containingTab = tab;
	
	shareTabGroup.addTab(tab);
	shareTabGroup.setActiveTab(0);
	
	Ti.API.info("open shareTabGroup with spinner");
	shareWindow.setRightNavButton(activityIndicator);
	activityIndicator.show();
	shareTabGroup.open();
	
	// create share window elements
	caption = Ti.UI.createTextArea({
        value: captionHintText,
        color: '#aaa',
		autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
		top : 10,
		left : '30%',
		width : '65%',
		height : 75,
		font : {
			fontWeight : 'normal',
			fontSize : '17'
		},
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		borderRadius : 5,
		paddingLeft : 2,
		paddingRight : 2,
		backgroundColor : 'white'
		//borderColor: 'black',
		//borderWidth: 1
	});
	caption.privHintText = caption.value;
	// define eveng listeners before events are fired the first time
	caption.addEventListener('focus', function(e) {
		if (e.source.value === e.source.privHintText) {
			e.source.value = "";
			e.source.color = 'black';
		}
	});
	caption.addEventListener('blur', function(e) {
		if (e.source.value === "") {
			e.source.value = e.source.privHintText;
			e.source.color = '#aaa';
		}
	});
	
	shareWindow.add(caption);
	
	// add remaining of the objects on the page
	shareLabel = Ti.UI.createLabel({
		text : 'Add friends to share with',
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		wordWrap : true,
		color : 'black',
//		top : 120,
		bottom: 140,
		left : '5%',
		height : 40,
		width : '90%',
		paddingLeft : 2,
		paddingRight : 2,
		font : {
			fontWeight : 'bold',
			fontSize : '20'
		}
	});
	shareWindow.add(shareLabel);

	shareTable = Ti.UI.createTableView({
//		top : 170,
		bottom: 40,
		height : Ti.UI.SIZE,
		rowHeight : 50,
		width : '90%',
		left : '5%',
		borderRadius : 5,
		backgroundColor : 'transparent',
		//borderColor: 'black',
		//borderWidth: 1,
		paddingLeft : 0,
		paddingRight : 2
	});

	shareToFBFriends = Ti.UI.createTableViewRow({
		className : 'shareSource',
		title : 'from facebook',
		color : 'black',
		backgroundColor : '#fff',
		height : 40,
		left : 0,
		//leftImage: '/images/f_logo.png',
		hasChild : true
	});

	selectFBFriend = function(friendId) {
		Ti.API.info("selectFBFriend id: " + friendId);
		fashionistaFriends.push(friendId);
	};

	addSelectedFBFriends = function() {
		var acs = require('lib/acs'),
			notifyAddedFriends = function (userIdList) {
		        acs.newFriendNotification(userIdList);
			};
		Ti.API.info("Adding selected FB Friends " + fashionistaFriends);
		acs.addFriends(fashionistaFriends, notifyAddedFriends);
		fashionistaFriends = [];
	};

	shareToFBFriends.addEventListener('click', function(e) {
		var callback = function(friends, fashionBuddies) {
							var listWin;
							if (friends && friends.length > 0) {
								Ti.API.info("create and populate list of friends window");
								listWin = ListWindow.createListWindow(addSelectedFBFriends);
								// this is where we check which FB friends are already the current user's Fashionista friends
								ListWindow.populateList(listWin, friends, fashionBuddies, selectFBFriend);
								listWin.containingTab = tab;
								tab.open(listWin);
							} else {
								alert('You are the first of your facebook to use Fashionist. Kudos! Invite your fashion buddies to Fashionist now.');
							}
						},
			fashionBuddiesFilter = function (fbFriends) {acs.getFriendsList(function (fashionBuddies) {callback(fbFriends, fashionBuddies);});},
			//facebook integration
			FB = require('lib/facebook'), 
			authCB = function() {
				Ti.API.info("facebook authorize callback");
				social.findFBFriends(fashionBuddiesFilter);
			};
		FB.authorize(authCB);
	});

	shareToAddressBook = Ti.UI.createTableViewRow({
		className : 'shareSource',
		title : 'from your contacts',
		color : 'black',
		backgroundColor : '#fff',
		top : 50,
		height : 40,
		left : 0,
		//borderWidth: 1,
		//borderColor: 'black',
		//leftImage: '/images/contacts-medium.png',
		hasChild : true
	});

/*
	inviteFBFriends = Ti.UI.createTableViewRow({
		className : 'shareSource',
		title : 'invite via facebook',
		color : 'black',
		backgroundColor : '#fff',
		top : 100,
		height : 40,
		left : 0,
		//borderWidth: 1,
		//borderColor: 'black',
		//leftImage: '/images/f_logo.png',
		hasChild : true
	});
	inviteContacts = Ti.UI.createTableViewRow({
		className : 'shareSource',
		title : 'invite via text',
		color : 'black',
		backgroundColor : '#fff',
		top : 150,
		height : 40,
		left : 0,
		//borderWidth: 1,
		//borderColor: 'black',
		//leftImage: '/images/contacts-medium.png',
		hasChild : true
	});
	
	*/
	shareTable.appendRow(shareToFBFriends);
	shareTable.appendRow(shareToAddressBook);
//	shareTable.appendRow(inviteFBFriends);
//	shareTable.appendRow(inviteContacts);
	shareWindow.add(shareTable);

	// show pic thumbnail
	postModel.thumbnail_75 = photoBlob.imageAsThumbnail(75);
	thumbnail = Ti.UI.createImageView({image: postModel.thumbnail_75, top: 10, left: '5%'});	
	shareWindow.add(thumbnail);
	
	activityIndicator.hide();
	shareWindow.setRightNavButton(shareBtn);
	Ti.API.info("Stop spinner, show share button");
	return shareWindow;
}

exports.createShareWindow = createShareWindow;

