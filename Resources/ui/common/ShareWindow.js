/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 * 
 **/

function createShareWindow(postModel, shareAction) {
	'use strict';
	var ApplicationTabGroup = require('ui/common/ApplicationTabGroup'), 
		FeedWindow = require('ui/common/FeedWindow'),
		InviteView = require('ui/common/InviteView'), 
		shareBtn, cancelBtn,
		findExactBtn, findSimilarBtn,
		tagsLabel, 
		shareWindow, 
		shareTabGroup,
		thumbnail, 
		tab, 
		caption,
		captionHintText = 'Add a caption or tag your photo e.g.: #findexact, #findsimilar',
		defaultCaption = Ti.Locale.getString('nocaption'), 
		shareLabel, 
		inviteTable, 
		tableData, 
		inviteFBFriends, inviteContacts, selectFBFriend, addSelectedFBFriends, 
		fashionistaFriends = [],
		newSize = Ti.App.photoSizes[Ti.Platform.osname],
		photoBlob = postModel.photo,
		activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle});

	
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
		barColor : '#5D3879',
		tabBarHidden: 'true',
		leftNavButton : cancelBtn,
		title : Ti.Locale.getString('shareWindow')
	});
	
	
	shareBtn.addEventListener('click', function(e) {
		shareBtn.hide();
		shareWindow.setRightNavButton(activityIndicator);	
		activityIndicator.show();	
				
		Ti.API.info("calling sharePhoto. photoBlob width " + photoBlob.width + " height " + photoBlob.height);
		var acs = require('lib/acs'),
			social = require('lib/social'),
			captionValue = caption.getValue(),
			senderId = acs.currentUserId(),
			message = "Your new post has been published",
			newPostNotify, 
			doShare;
						
		newPostNotify = function (post) {
				// newPostNotification
				Ti.API.info("Notifying friends of new post");
				social.newPostNotification(post, true);
				//update feed window with local info after caption has been updated in the cloud
				Ti.API.info("update local feed window with new post");
				Ti.API.info("FIRE EVENT: NEW POST from " + senderId);
				Ti.App.fireEvent('newPost', {"user_id": senderId, "post_id": post.id, "message": message});						
		};
			
		doShare = function () {
			// go back to feed page
			shareTabGroup.close();
			// add post
			if (captionValue === captionHintText || captionValue === "") {
				postModel.caption = defaultCaption;			
			} else {
				postModel.caption = escape(captionValue);			
			}
	
			FeedWindow.beforeSharePost(postModel, newPostNotify, FeedWindow.afterSharePost);
			
		};
				
				
		activityIndicator.hide();
		shareWindow.setRightNavButton(shareBtn);
		shareBtn.show();				
				
		InviteView.inviteFBFriendsPromptBeforeAction(shareWindow, doShare);
		
		
			
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
		borderRadius : 3,
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
	
	// add #find tag
	
	tagsLabel = Ti.UI.createLabel({
		text : Ti.Locale.getString('findTags'),
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		color : 'black',
		top : 100,
		left : '5%',
		height : 20,
		width : '90%',
		paddingLeft : 2,
		paddingRight : 2,
		font : {
			fontWeight : 'bold',
			fontSize : '18'
		}
	});
	shareWindow.add(tagsLabel);
	
	findExactBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		title : Ti.Locale.getString('findExactHashTag'),
		color: 'black',
		backgroundColor: '#AAA',
		borderRadius: 3,
		borderWidth: 1,		
		top: 130, left: '5%',
		height: 20, width: '30%'
	});
	findSimilarBtn = Titanium.UI.createButton({
		style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		title : Ti.Locale.getString('findSimilarHashTag'),
		color: 'black',
		backgroundColor: '#AAA',
		borderRadius: 3,
		borderWidth: 1,				
		top: 130, left: '40%',
		height: 20, width: '30%'
	});
	
	shareWindow.add(findExactBtn);
	shareWindow.add(findSimilarBtn);
	
	findExactBtn.addEventListener('click', function(e) {
		var hashTag = Ti.Locale.getString('findExactHashTag');
		if (caption.value === captionHintText) {
			caption.value = hashTag;
			caption.color = 'black';
		}
		else {
			caption.value = caption.value + ' ' + hashTag;			
		}
		postModel.tags.push(hashTag);	
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
		postModel.tags.push(hashTag);
	});
	
/*	
	// Find friends who are already using Fashionist and invite friends to start using it
	shareLabel = Ti.UI.createLabel({
		text : Ti.Locale.getString('findFriendsOnFashionist'),
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		wordWrap : true,
		color : 'black',
		top : 180,
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
	shareWindow.add(shareLabel);

	inviteTable = InviteView.createInviteView(shareWindow, 220);
	shareWindow.add(inviteTable);
*/
	// show pic thumbnail
	postModel.thumbnail_75 = photoBlob.imageAsThumbnail(75);
	thumbnail = Ti.UI.createImageView({image: postModel.thumbnail_75, top: 10, left: '5%'});	
	shareWindow.add(thumbnail);
	
	activityIndicator.hide();
	shareWindow.setRightNavButton(shareBtn);
	Ti.API.info("Stop spinner, show share button");
	
	postModel.photo = FeedWindow.resizeToPlatform(photoBlob);
	return shareWindow;
}

exports.createShareWindow = createShareWindow;

