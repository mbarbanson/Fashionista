/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
	var privFeedWindow = null;
	
		
	function currentFeedWindow() {
		return privFeedWindow;
	}	


	function displayPostInFeed(post, insertAtTop) {
		var PostView = require('ui/common/PostView'),
			acs = require('lib/acs'),
			currentUser = acs.currentUser(),
			row = PostView.displayPostSummaryView(post),
			tableView = privFeedWindow.table,
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


	function clearFeed() {
		Ti.API.info('Calling clear feed');
		
		if (privFeedWindow.table) {
			privFeedWindow.table.setData([]);
		}	
	}
	
	
	

	/*
	 * showFriendsFeed
	 */
	function showFriendsFeed() {
		Ti.API.info('Calling show feed');
		var DetailWindow = require('ui/common/DetailWindow'),
			PostView = require('ui/common/PostView'),
			acs = require('lib/acs'),
			showPostDetails,
			showPost,
			friendsListCallback,
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle}),
			tableView = privFeedWindow ? privFeedWindow.table : null,
			cleanupAction;
							
		if (tableView) {
			//clear table view
			clearFeed();			
			cleanupAction = function() {
								var dialog;
								if (!tableView.flipped) {
									Ti.App.mainTabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
									tableView.flipped = true;
								}
								if (!tableView.data || tableView.data.length === 0) {
									dialog = Ti.UI.createAlertDialog({cancel: -1, title: Ti.Locale.getString('nophotostitle'), message: Ti.Locale.getString('nophotosmessage')});
									dialog.show();																		
								}
								activityIndicator.hide(); 
								privFeedWindow.rightNavButton = null;
							};
			tableView.displayComments = false;	
			Ti.API.info("showFriendFeed. Refreshing Feed window");
			showPost = function (post) { 
							displayPostInFeed(post, false);
						};
			friendsListCallback = function (friends, cleanupAction) { acs.getFriendsPosts(friends, showPost, cleanupAction);};
			
			privFeedWindow.rightNavButton = activityIndicator;
			activityIndicator.show(); 

			acs.getFriendsList(friendsListCallback, cleanupAction);
	
		}
		else {
			Ti.API.info("FeedWindow doesn't have a tableView");
		}
	}
	
	Ti.App.addEventListener('refreshFeedWindow', function (e) { showFriendsFeed(); Ti.UI.iPhone.setAppBadge(0);});
	
	
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
	
	
	function addFinishingUpRow(postModel) {
		Ti.API.info('Calling addFinishingUpRow');
		var tableView = privFeedWindow.table,
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
	
	
	function removeFinishingUpRow(doDisplayPost, post) {
		Ti.API.info('Calling removeFinishingUpRow');
		var tableView = privFeedWindow.table,
			section, rows, 
			fRow, numRows, i;
		if (tableView && tableView.data) {
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
							displayPostInFeed(post, false); // post is appended and will be row index 1
						}
						else if (numRows > 1){
							Ti.API.info('At least one post besides the finishing up row. Insert new post at top');
							displayPostInFeed(post, true); // post is inserted at top with index 0
						}
						//showFriendsFeed(); // refresh whole feed to avoid race conditions for now					
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
	

	function beforeSharePost(postModel, successCallback, errorCallback) {
		
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
		// crop the dimension that's larger than the screen if any						
		if (imgH > newSize[1]) { imgH = newSize[1]; }
		if (imgW > newSize[0]) { imgW = newSize[0]; }					
		image = image.imageAsResized(imgW, imgH);
		addFinishingUpRow(postModel);
		acs.addPost(postModel, image, addPostSuccess, addPostError);		
	}
	
	
	function afterSharePost (post) {
		removeFinishingUpRow(true, post);		
	}
	
	
		
	/*
	 * createFeedWindow
	 */
	function createFeedWindow() {
		privFeedWindow = Ti.UI.createWindow({
				title: "Fashionist",
		        barColor: '#5D3879'				
		});
		
		var tableView =  Ti.UI.createTableView ({
				objname: 'PostSummary'
		});
		tableView.flipped = false;
		privFeedWindow.add(tableView);
		privFeedWindow.table = tableView;
														
		return privFeedWindow;
	}
		
	
	
	exports.createFeedWindow = createFeedWindow;
	exports.currentFeedWindow = currentFeedWindow;
	exports.clearFeed = clearFeed;
	exports.showFriendsFeed = showFriendsFeed;
	exports.beforeSharePost = beforeSharePost;
	exports.afterSharePost = afterSharePost;
	exports.displayPostInFeed = displayPostInFeed;
	exports.removeFinishingUpRow = removeFinishingUpRow;

} ());
