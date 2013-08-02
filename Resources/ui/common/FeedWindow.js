/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
	var privFeedWindow = null,
		privFindFeedWindow = null,
		inShowFeedWindow = false,
		needsUpdate = false;
	
		
	function currentFeedWindow() {
		return privFeedWindow;
	}
	
	function currentFindFeedWindow() {
		return privFindFeedWindow;
	}
	
	function setNeedsUpdate(value) {
		needsUpdate = value;
	}
	
	function getNeedsUpdate() {
		return needsUpdate;
	}
	
	
	function setCurrentFriendFeedWindow(fWin) {
		privFeedWindow = fWin;
	}
	
	function setCurrentFindFeedWindow(fWin) {
		privFindFeedWindow = fWin;
	}	


	function displayPostInFeedWin(fWin, post, insertAtTop) {
		var PostView = require('ui/common/PostView'),
			acs = require('lib/acs'),
			currentUser = acs.currentUser(),
			row = PostView.displayPostSummaryView(fWin.containingTab, post),
			tableView = fWin.table,
			tabGroup;
			
		if (tableView) {
			if (insertAtTop) {
				Ti.API.info("insert row at top of feed window");
				if (tableView.data && tableView.data.length > 0) {
					Ti.API.info("There's at least one post in the feed window. Insert Before 0");
					tableView.insertRowBefore(0, row, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});	
				}
				else {
					Ti.API.info("No post in the feed window. Append");
					tableView.appendRow(row, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});
				}
			}
			else {
				tableView.appendRow(row, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});				
			}
			// this code can be executed twice with no problems in case we have a race condition
			if (!tableView.flipped) {
				tableView.flipped = true;
				tabGroup = Ti.App.mainTabGroup;
				tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
				Ti.API.info("Flipped tabgroup open");
			}
		}
	}
	
	
	
	function displayPostInFeed(post, insertAtTop) {
		displayPostInFeedWin(privFeedWindow, post, insertAtTop);
	}
	
	
	function displayPostInFindFeed(post, insertAtTop) {
		displayPostInFeedWin(privFindFeedWindow, post, insertAtTop);
	}


	function clearFeedWin(fWin) {
		Ti.API.info('Calling clear feed');
		
		if (fWin.table) {
			fWin.table.setData([]);
		}	
	}


	function clearFeed() {
		clearFeedWin(privFeedWindow);	
	}
	
	
	

	/*
	 * showFriendsFeed
	 */
	
	
	function friendFeedPostQuery(showPost, cleanupAction) {
		var acs = require('lib/acs'),
			friendsListCallback = function (friends, cleanupAction) {
											acs.getFriendsPosts(friends, showPost, cleanupAction);
										};
		
		return acs.getFriendsList(friendsListCallback, cleanupAction);		
	}
	
	
	function findFeedPostQuery(showPost, cleanupAction) {
		var acs = require('lib/acs');
		
		return acs.getPublicPosts(showPost, cleanupAction);		
	}
	
	
	function showFeedWin(fWin, postQuery, noPhotoTitle, noPhotoMsg) {
		Ti.API.info('Calling show feed window');
		var DetailWindow = require('ui/common/DetailWindow'),
			PostView = require('ui/common/PostView'),
			acs = require('lib/acs'),
			showPostDetails,
			showPost,
			friendsListCallback,
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle}),
			tableView = fWin ? fWin.table : null,
			cleanupAction,
			inShowFeedWindow;
			
		// if we're already in the middle of refreshing the feed window, bail	
		if (inShowFeedWindow) { return; }	
		inShowFeedWindow = true;					
		if (tableView) {
			//clear table view
			clearFeedWin(fWin);			
			cleanupAction = function() {
								var dialog, mainTabGroup = Ti.App.mainTabGroup;
								if (!tableView.flipped) {
									mainTabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
									tableView.flipped = true;
								}
								if (!tableView.data || tableView.data.length === 0) {
									dialog = Ti.UI.createAlertDialog({cancel: -1, title: Ti.Locale.getString(noPhotoTitle), message: Ti.Locale.getString(noPhotoMsg)});
									dialog.show();	
									// no photos in friend feed, show public feed
									mainTabGroup.setActiveTab(1);																										
								}
								activityIndicator.hide(); 
								fWin.rightNavButton = fWin.savedRightNavButton;
								inShowFeedWindow = false;
							};
			tableView.displayComments = false;	
			Ti.API.info("showFeedWin. Refreshing Feed window");
			showPost = function (post) { 
							displayPostInFeedWin(fWin, post, false);
						};
			fWin.savedRightNavButton = fWin.rightNavButton;
			fWin.rightNavButton = activityIndicator;
			activityIndicator.show(); 

			postQuery(showPost, cleanupAction);
		}
		else {
			alert("FeedWindow doesn't have a tableView");
		}
	}
	
	function showFriendsFeed(selectedPostId) {
		showFeedWin(privFeedWindow, friendFeedPostQuery, 'noPhotosTitle', 'noPhotosMsg');
	}
	
	function showFindFeed(selectedPostId) {
		showFeedWin(privFindFeedWindow, findFeedPostQuery, 'noFindPostTitle', 'noFindPostMsg');
	}
	
	
	Ti.App.addEventListener('refreshFeedWindow', function (e) { showFriendsFeed(); Ti.UI.iPhone.setAppBadge(0);});
	
	Ti.App.addEventListener('refreshFindFeedWindow', function (e) { showFeedWin(privFindFeedWindow);});
	
	
	function createFinishingUpRow(postModel) {
		var row = Ti.UI.createTableViewRow({
					title: "            Finishing Up...",
					className:'finishingUp',
					color: 'white',
					backgroundColor:'black',
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					visible: true,
					layout: 'horizontal'
				}),
			photo = postModel.photo,	
			thumbnail;
		postModel.thumbnail_50 = photo.imageAsThumbnail(50);
		thumbnail = Ti.UI.createImageView({image: postModel.thumbnail_50});
		row.add(thumbnail);
		return row;
	}
	
	
	
	function addFinishingUpRowFeedWin(fWin, postModel) {
		Ti.API.info('Calling addFinishingUpRow');
		var tableView = fWin.table,
			fRow = createFinishingUpRow(postModel);
		if (tableView && tableView.data) {		
			if (tableView.data.length > 0) {
				Ti.API.info("Feed Window has at least one post already. Adding finishing up row at top");			
				tableView.insertRowBefore(0, fRow, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});
			}
			else {
				Ti.API.info("Feed Window is empty. Appending finishing up at index 0");			
				tableView.appendRow(fRow, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});
			}		
			tableView.scrollToTop(0);
		}
		else {
			Ti.API.info("FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
			Ti.API.error("Cannot add finishing up row. FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
		}				
	}
	
	
	function addFinishingUpRow(postModel) {
		addFinishingUpRowFeedWin(privFeedWindow, postModel);
	}
	
	
	function findRowIndex(row, tableView) {
		var section, rows, numRows, i;
		section = tableView.data[0];
		rows = section.getRows();
		numRows = section.getRowCount();
		for (i = 0; i < numRows; i = i +1) {
			if (rows[i] === row) {
				return i;
			}
		}
		return -1;
	}
	
	
	function removeFinishingUpRowFeedWin(fWin, doDisplayPost, post) {
		Ti.API.info('Calling removeFinishingUpRow');
		var tableView = fWin.table,
			section, rows, 
			fRow, numRows, i;
		if (tableView && tableView.data && tableView.data.length >= 0) {
			section = tableView.data[0];
			rows = section.getRows();
			numRows = rows.length;
			for (i = 0; i < numRows; i = i + 1) {
				fRow = rows[i];
				if (fRow.className === 'finishingUp') {
					Ti.API.info("Calling deleteRow");
					tableView.deleteRow(i, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.LEFT});
					if (doDisplayPost && post) {	
						if (numRows === 1) {
							Ti.API.info('First post in feed!');
							displayPostInFeedWin(fWin, post, false); // post is appended and will be row index 1
						}
						else if (numRows > 1){
							Ti.API.info('At least one post besides the finishing up row. Insert new post at top');
							displayPostInFeedWin(fWin, post, true); // post is inserted at top with index 0
						}
					}
					return;					
				}
			}
			Ti.API.info("couldn't find finishing up row in tableView");			
		}
		else {
			Ti.API.info("tableView is empty! ");
		}
		//something went wrong, refresh the window to clear it up
		showFriendsFeed();
						
	}
	
	
	function removeFinishingUpRow(doDisplayPost, post) {
		removeFinishingUpRowFeedWin(privFeedWindow, doDisplayPost, post);
	}
	
	
	function resizeToPlatform(image) {
		var imgH = image.height,
			imgW = image.width,
			newSize = Ti.App.photoSizes[Ti.Platform.osname];

			if (imgH > imgW) { 
				image = image.imageAsResized((imgW*newSize[0])/imgH, newSize[1]);	
			}
			else if (imgH < imgW) {
				image = image.imageAsResized(newSize[0], (imgH*newSize[1])/imgW);	
			}
			else {
				image = image.imageAsResized(newSize[0], newSize[1]);
			}			
			return image;	
	}

	function beforeSharePostFeedWin(fWin, postModel, successCallback, errorCallback) {
		
		var acs = require('lib/acs'),
			style = Ti.App.spinnerStyle,
			image = postModel.photo,
			imgH = image.height,
			imgW = image.width,
			newSize = Ti.App.photoSizes[Ti.Platform.osname],
			numFriends = 0,
			addPostSuccess = function (post) {
									Ti.API.info("successfully added post " + post.content);
									if (successCallback) { successCallback(post);}												
								},
			addPostError = function (post) {
									Ti.API.info("Calling addPostError callback. Removing finishing up row");
									if (errorCallback) { errorCallback(post);}
								};
		//resize and fit to screen
		postModel.photo = image; //resizeToPlatform(image);	image has already been scaled down to 640 * 480										
		addFinishingUpRowFeedWin(fWin, postModel);
		acs.addPost(postModel, image, addPostSuccess, addPostError);		
	}
	
	
	function beforeSharePost(postModel, successCallback, errorCallback) {
		beforeSharePostFeedWin(privFeedWindow, postModel, successCallback, errorCallback);
	}
	

	function afterSharePostFeedWin (fWin, post) {
		removeFinishingUpRowFeedWin(fWin, true, post);		
	}

	
	function afterSharePost (post) {
		removeFinishingUpRowFeedWin(privFeedWindow,true, post);		
	}
	
	
		
	/*
	 * createFeedWindow
	 */
	function createFeedWindow(type) {
		var refreshBtn = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
			style: Titanium.UI.iPhone.SystemButtonStyle.BAR
		}),
		fWin = Ti.UI.createWindow({
				title: Ti.Locale.getString('fashionista'),
		        barColor: '#5D3879',
		        navBarHidden: false				
		}),
		tableView =  Ti.UI.createTableView ({
				objname: 'PostSummary'
		});
		if (type === 'friendFeed') {
			fWin.title = Ti.Locale.getString('fashionista') + ' ' + Ti.Locale.getString('friendsFeed');
			refreshBtn.addEventListener('click', function(e) { showFriendsFeed(); });
			fWin.addEventListener('refreshFeedWindow', function(e) {showFriendsFeed(); });		
		}
		else {
			fWin.title = Ti.Locale.getString('publicFeed') + ' ' + Ti.Locale.getString('fashionista');
			refreshBtn.addEventListener('click', function(e) { showFindFeed(); });				
			fWin.addEventListener('refreshFeedWindow', function(e) {showFindFeed(); });		
		}
		tableView.flipped = false;
		fWin.add(tableView);
		fWin.table = tableView;
		fWin.setRightNavButton(refreshBtn);												
		return fWin;
	}
		
	
	
	exports.createFeedWindow = createFeedWindow;
	exports.currentFeedWindow = currentFeedWindow;
	exports.currentFindFeedWindow = currentFindFeedWindow;
	exports.setCurrentFriendFeedWindow = setCurrentFriendFeedWindow;	
	exports.setCurrentFindFeedWindow = setCurrentFindFeedWindow;
	exports.clearFeedWin = clearFeedWin;		
	exports.clearFeed = clearFeed;
	exports.showFindFeed = showFindFeed;	
	exports.showFriendsFeed = showFriendsFeed;
	exports.beforeSharePostFeedWin = beforeSharePostFeedWin;
	exports.afterSharePostFeedWin = afterSharePostFeedWin;
	exports.displayPostInFeedWin = displayPostInFeedWin;
	exports.removeFinishingUpRowFeedWin = removeFinishingUpRowFeedWin;
	exports.beforeSharePost = beforeSharePost;
	exports.afterSharePost = afterSharePost;
	exports.displayPostInFeed = displayPostInFeed;
	exports.removeFinishingUpRow = removeFinishingUpRow;
	exports.friendFeedPostQuery = friendFeedPostQuery;
	exports.findFeedPostQuery = findFeedPostQuery;
	exports.resizeToPlatform = resizeToPlatform;
	exports.getNeedsUpdate = getNeedsUpdate;
	exports.setNeedsUpdate = setNeedsUpdate;

} ());
