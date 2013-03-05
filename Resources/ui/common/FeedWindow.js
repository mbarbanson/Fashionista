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
			row = PostView.displayPostSummaryView(post),
			tableView = privFeedWindow.table,
			tabGroup;
			
		if (tableView) {
			if (insertAtTop)	   {
				tableView.insertRowBefore(0, row, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});
			}
			else {
				tableView.appendRow(row);				
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
		if (tableView && tableView.data && tableView.data.length !== 0) {			
			tableView.insertRowBefore(0, fRow);			
			tableView.scrollToTop(0);
		}
		else {
			Ti.API.info("FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
			alert("Cannot add finishing up row. FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
		}				
	}
	
	
	function removeFinishingUpRow() {
		Ti.API.info('Calling removeFinishingUpRow');
		var tableView = privFeedWindow.table,
			section, rows, fRow;
		if (tableView && tableView.data && tableView.data.length !== 0) {
			section = tableView.data[0];
			rows = section.getRows();
			fRow = rows[0];			
			if (fRow.className === 'finishingUp') {
				tableView.deleteRow(0, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.LEFT}); 
			}
			else {
				Ti.API.error("Expected first row to be a finishing up row. Found " + fRow.content);
				alert("Cannot remove finishing up row. FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
			}
		}
		else {
			Ti.API.info("FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
			alert("FeedWindow tableView is corrupted tableView " + tableView + " data " + tableView.data);
		}				
	}	
	

	function beforeSharePost(postModel, callback) {
		
		var acs = require('lib/acs'),
			style = Ti.App.spinnerStyle,
			image = postModel.photo,
			imgH = image.height,
			imgW = image.width,
			newSize = Ti.App.photoSizes[Ti.Platform.osname],
			addPostSuccess = function (post) {
									Ti.API.info("successfully added post " + post.content);
									callback(post);												
								},
			addPostError = function () {
									Ti.API.info("Calling addPostError callback. Removing finishing up row");
								};
		// crop the dimension that's larger than the screen if any						
		if (imgH > newSize[1]) { imgH = newSize[1]; }
		if (imgW > newSize[0]) { imgW = newSize[0]; }					
		image = image.imageAsResized(imgW, imgH);
		acs.addPost("", postModel.caption, image, addPostSuccess, addPostError);
		addFinishingUpRow(postModel);		
	}
	
	
	function afterSharePost (post) {

		removeFinishingUpRow();
		displayPostInFeed(post, true); 
		
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
			cleanupAction = function() {
								activityIndicator.hide(); 
								privFeedWindow.rightNavButton = null;
							};
							
		//clear table view
		clearFeed();
		if (privFeedWindow.table) {
			privFeedWindow.table.displayComments = false;	
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
	
		
	/*
	 * createFeedWindow
	 */
	function createFeedWindow() {
		privFeedWindow = Ti.UI.createWindow({
				title: "Fashionist",
		        barColor: '#5D3879'				
		});
		privFeedWindow.table =  Ti.UI.createTableView ({
				objname: 'PostSummary'
		});
		privFeedWindow.table.flipped = false;
		privFeedWindow.add(privFeedWindow.table);
				
		// create table view click event listener
		// tableView.addEventListener('click', feedWindowClickHandler);
														
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
