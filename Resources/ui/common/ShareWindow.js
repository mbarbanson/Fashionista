/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 * 
 **/

function parseHashTags(postModel, caption) {
	'use strict';
	
	/*jslint regexp: true */
	var hashTagIdx = -1, endHashIdx = -1, text = caption, hashStr = '', re = /[^\w]/;
	while ((hashTagIdx = text.indexOf('#')) > -1) {
		text = text.slice(hashTagIdx);
		if (text.length > 1) {
			text = text.slice(1);
			endHashIdx = text.search(re);  // match word end after a hash char
			if (endHashIdx > -1) {
				hashStr = '#' + text.slice(0, endHashIdx);
				Ti.API.info("found new hashtag " + hashStr);
				if (postModel.tags.indexOf(hashStr) === -1) {
					postModel.tags.push(hashStr.toLowerCase());	
				}				
				text = text.slice(endHashIdx);	
			}
			else {
				hashStr = '#' + text;
				Ti.API.info("found new hashtag " + hashStr);
				if (postModel.tags.indexOf(hashStr) === -1) {
					postModel.tags.push(hashStr.toLowerCase());	
				}	
				break;			
			}
			if (hashStr.toLowerCase() === Ti.Locale.getString('friendsOnlyHashTag').toLowerCase())	{
				Ti.App.newPublicPost = false;
			}		
		}	
	}
}

function createShareWindow(postModel, shareAction) {
	'use strict';
	
	var ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
		FeedWindow = require('ui/common/FeedWindow'),
		InviteView = require('ui/common/InviteView'), 
		shareBtn, cancelBtn,
		findExactBtn, findSimilarBtn, friendsOnlyBtn,
		tagsLabel, 
		shareWindow, 
		shareTabGroup,
		thumbnail, 
		tab, 
		caption,
		defaultCaption = Ti.Locale.getString('nocaption'),
		captionHintText = Ti.Locale.getString('captionHint'), 
		shareLabel, 
		inviteTable, 
		tableData, 
		inviteFBFriends, inviteContacts, selectFBFriend, addSelectedFBFriends, 
		fashionistaFriends = [],
		newSize = Ti.App.photoSizes[Ti.Platform.osname],
		photoBlob = postModel.photo,
		activityIndicator;

	
	// right nav button is Share
	shareBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title : Ti.Locale.getString('shareButton')
	});
	cancelBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title : Ti.Locale.getString('cancel')
	});

	// share window
	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	shareWindow = Ti.UI.createWindow({
		backgroundColor : '#ddd',
		color : 'black',
        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT],			
		tabBarHidden: 'true',
		leftNavButton : cancelBtn,
		title : Ti.Locale.getString('shareWindow')
	});
	
	
	shareBtn.addEventListener('click', function(e) {
		shareBtn.setEnabled(false);
		shareWindow.setRightNavButton(activityIndicator);	
		activityIndicator.show();	
				
		Ti.API.info("calling sharePhoto. photoBlob width " + photoBlob.width + " height " + photoBlob.height);
		var acs = require('lib/acs'),
			social = require('lib/social'),
			captionValue = caption.getValue(),
			senderId = acs.currentUserId(),
			message = Ti.Locale.getString("postSuccess"),
			newPostNotify, 
			doShare;
						
		newPostNotify = function (post) {
				// newPostNotification
				Ti.API.info("Notifying friends of new post");
				social.newPostNotification(post, true);
				//update feed window with local info after caption has been updated in the cloud
				Ti.API.info("update local feed window with new post");
				Ti.API.info("FIRE EVENT: NEW POST from " + senderId);
				Ti.App.fireEvent('newPost', {"uid": senderId, "pid": post.id, "message": message});						
		};
			
		doShare = function () {
			// go back to feed page
			shareTabGroup.close();
			Ti.App.newPublicPost = true;
			// add post
			if (captionValue === captionHintText || captionValue === "") {
				postModel.caption = defaultCaption;		
			} else {
				parseHashTags(postModel, captionValue);					
				postModel.caption = escape(captionValue);			
			}

			FeedWindow.beforeSharePost(postModel, newPostNotify, FeedWindow.afterSharePost);
			
		};
		activityIndicator.hide();
		shareWindow.setRightNavButton(shareBtn);
		shareBtn.show();				
				
		InviteView.inviteFriendsBeforeShare(shareWindow.containingTab, doShare);		
	});
	
	cancelBtn.addEventListener('click', function(e) {
		//Ti.App.mainTabGroup.show();
		Ti.App.mainTabGroup.setActiveTab(0);
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
	shareTabGroup.open();
	
	Ti.API.info("open shareTabGroup with spinner");
	activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle});
	shareWindow.setRightNavButton(activityIndicator);
	activityIndicator.show();
		
	// show pic thumbnail
	postModel.thumbnail_75 = photoBlob.imageAsThumbnail(75);
	thumbnail = Ti.UI.createImageView({
		image: postModel.thumbnail_75, 
		top: 10, 
		left: '5%',
		borderWidth: 1,
		borderColor: '#707070',
		//width: 75
		height: 75
	});	
	shareWindow.add(thumbnail);
	
	// create share window elements
	caption = Ti.UI.createTextArea({
		autolink: Ti.UI.AUTOLINK_URLS,
        value: captionHintText,
        color: '#aaa',
		autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
		top : 10,
		left : '30%',
		width : '65%',
		height : 75,
		font : {
			fontWeight : 'normal',
			fontSize : '16'
		},
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		borderWidth : 1,
		borderColor:'#707070',
		paddingLeft : 2,
		paddingRight : 2,
		backgroundColor : 'white'
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
	
	// add #find tag
	
	tagsLabel = Ti.UI.createLabel({
		text : Ti.Locale.getString('findTags'),
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		color : 'black',
		top : 140,
		left : '5%',
		height : 20,
		width : '90%',
		paddingLeft : 2,
		paddingRight : 2,
		font : {
			fontWeight : 'normal',
			fontSize : '18'
		}
	});
	shareWindow.add(tagsLabel);
	
	findExactBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		title : Ti.Locale.getString('findExactHashTag'),
		color: 'blue',
		//backgroundColor: Ti.Locale.getString('themeColor'),
		borderRadius: 1,
		borderWidth: 1,
		borderColor: Ti.Locale.getString('themeColor'),				
		top: 175, left: '5%',
		height: 30, width: '30%'
	});
	findSimilarBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		title : Ti.Locale.getString('findSimilarHashTag'),
		color: 'blue',
		//backgroundColor: Ti.Locale.getString('themeColor'),
		borderRadius: 1,
		borderWidth: 1,
		borderColor: Ti.Locale.getString('themeColor'),						
		top: 175, left: '37%',
		height: 30, width: '33%'
	});
	friendsOnlyBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		title : Ti.Locale.getString('friendsOnlyHashTag'),
		color: 'blue',
		//backgroundColor: Ti.Locale.getString('themeColor'),
		borderRadius: 1,
		borderWidth: 1,
		borderColor: Ti.Locale.getString('themeColor'),				
		top: 100, left: '5%',
		height: 30, width: '35%'
	});	
	
	shareWindow.add(findExactBtn);
	shareWindow.add(findSimilarBtn);
	shareWindow.add(friendsOnlyBtn);
		
	findExactBtn.addEventListener('click', function(e) {
		var hashTag = Ti.Locale.getString('findExactHashTag');
		if (caption.value === captionHintText) {
			caption.value = hashTag;
			caption.color = 'black';
		}
		else {
			caption.value = caption.value + ' ' + hashTag;			
		}
		postModel.tags.push(hashTag.toLowerCase());	
	});
	
	findSimilarBtn.addEventListener('click', function(e) {
		var hashTag = Ti.Locale.getString('findSimilarHashTag');
		if (caption.value === captionHintText) {
			caption.value = hashTag;
			caption.color = 'black';
		}
		else {
			caption.value = caption.value + ' ' + hashTag;			
		}
		postModel.tags.push(hashTag.toLowerCase());
	});
	
    friendsOnlyBtn.addEventListener('click', function(e) {
		var hashTag = Ti.Locale.getString('friendsOnlyHashTag');
		if (caption.value === captionHintText) {
			caption.value = hashTag;
			caption.color = 'black';
		}
		else {
			caption.value = caption.value + ' ' + hashTag;			
		}
		postModel.tags.push(hashTag.toLowerCase());
	});
	
	activityIndicator.hide();
	shareWindow.setRightNavButton(shareBtn);
	Ti.API.info("Stop spinner, show share button");
	return shareWindow;
}

exports.createShareWindow = createShareWindow;

