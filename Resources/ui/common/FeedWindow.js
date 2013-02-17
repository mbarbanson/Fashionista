/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
	var acs = require('lib/acs'),
		DetailWindow = require('ui/common/DetailWindow'),
		social = require('lib/social'),
		privFeedWindow = null;
		
	function currentFeedWindow() {
		return privFeedWindow;
	}	
	
	
	function createFinishingUpRow(postModel) {
		var row = Ti.UI.createTableViewRow({
					title: "            Finishing Up...",
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
		var fWin = currentFeedWindow(),
			tableView = fWin.table,
			fRow = createFinishingUpRow(postModel);
		if (tableView) {			
			tableView.insertRowBefore(0, fRow);			
			tableView.scrollToTop(0);
		}	
				
	}	

	function updatePost(postId, title, caption, callback) {
		
		var style = privFeedWindow.spinnerStyle,
			activityIndicator = Ti.UI.createActivityIndicator({style: style}),
			updatePostCallback = function (post) {
									Ti.API.info("successfully updated post " + post.content);
									activityIndicator.hide();
									privFeedWindow.setRightNavButton(null);
									callback(post);												
								};
	
		privFeedWindow.setRightNavButton(activityIndicator); 
		activityIndicator.show(); 
		acs.updatePost(postId, title, caption, updatePostCallback);		
	}	

	function addPost(postModel, callback) {
		
		var style = privFeedWindow.spinnerStyle,
			image = postModel.photo,
			imgH = image.height,
			imgW = image.width,
			newSize = Ti.App.photoSizes[Ti.Platform.osname],
			//activityIndicator = Ti.UI.createActivityIndicator({style: style}),
			addPostCallback = function (post) {
									Ti.API.info("successfully added post " + post.content);
									//activityIndicator.hide();
									//privFeedWindow.setRightNavButton(null);
									callback(post);												
								};
		// crop the dimension that's larger than the screen if any						
		if (imgH > newSize[1]) { imgH = newSize[1]; }
		if (imgW > newSize[0]) { imgW = newSize[0]; }					
		image = image.imageAsResized(imgW, imgH);
		//privFeedWindow.setRightNavButton(activityIndicator); 
		//activityIndicator.show(); 
		acs.addPost("", postModel.caption, image, addPostCallback);
		addFinishingUpRow(postModel);		
	}
	
	function showFriendsFeed(fWin) {
		Ti.API.info('Calling show feed');
		var tableView = fWin.table,
			showPostDetails,
			showPost,
			friendsListCallback,
			style = fWin.spinnerStyle,
			activityIndicator = Ti.UI.createActivityIndicator({style: style}),
			cleanupAction = function() {
								activityIndicator.hide(); fWin.rightNavButton = null;
							};

		if (tableView) {
			// FIXME is this refresh hack really needed?
			//reset table property
			//fWin.table = null;
			//force table layout update
			//fWin.remove(tableView);
			//tableView.setData([]);	
			tableView.displayComments = false;		
			Ti.API.info("showFriendFeed. Refreshing Feed window");
			showPost = function (post) { 
					DetailWindow.displayPostSummary(tableView, post);
				};
			friendsListCallback = function (friends, cleanupAction) { acs.getFriendsPosts(friends, showPost, cleanupAction);};
			
			fWin.rightNavButton = activityIndicator;
			activityIndicator.show(); 

			acs.getFriendsList(friendsListCallback, cleanupAction);
			
			// add tableView back
			//fWin.add(tableView);
			//fWin.table = tableView;		
			tableView.parentWin = fWin;	
		}
		else {
			Ti.API.info("FeedWindow doesn't have a tableView");
		}
	}
	

	function clearFeed(fWin) {
		Ti.API.info('Calling clear feed');
		var oldTable = fWin.table;
		
		if (oldTable) {
			fWin.remove(oldTable);
			oldTable.setData([]);
			fWin.add(oldTable);
			fWin.updateLayout();
		}	
	}
	
	//refresh the feedWindow when the app comes back to the foreground in case posts have been added	
	function appResumedHandler(event) {
		var feedWin = currentFeedWindow(),
			containingTab;
		if (!acs.currentUser || !feedWin) {
			return;
		}
		containingTab = feedWin.containingTab;
		if (containingTab && containingTab.getActive()) {
			Ti.API.info('PUSH NOTIFICATION? Fashionist resumed ' + "\n time " + Date.now());
			//clearFeed(feedWin);
			showFriendsFeed(feedWin);
		}
	}	
	
	function createFeedWindow() {
		var feedWin = Ti.UI.createWindow({
				title: "Fashionist",
		        backgroundColor: 'white',
		        barColor: '#5D3879'				
			}),
			tableView = Ti.UI.createTableView ({
				objname: 'PostSummary',
				backgroundColor: 'white',
				color: 'black',
				data: [],
				visible: true
			}),
			style,
			activityIndicator;	
		privFeedWindow = feedWin;
		feedWin.add(tableView);
		feedWin.table = tableView;
		
		//setup spinny activity indicator
		if (Ti.Platform.name === 'iPhone OS'){
			style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
		}
		else {
			style = Ti.UI.ActivityIndicatorStyle.BIG_DARK;				
		}
		feedWin.spinnerStyle = style;
		
		// create table view click event listener
		// tableView.addEventListener('click', feedWindowClickHandler);
		// listen for resume events until we find a better criteria for when to proactively update the feed
		// need to be able to distinguish between different notifications. Until then, this is not helping.
		//Ti.App.addEventListener('resumed', appResumedHandler);	
														
		return feedWin;
	}
		
	
	
	exports.createFeedWindow = createFeedWindow;
	exports.currentFeedWindow = currentFeedWindow;
	exports.clearFeed = clearFeed;
	exports.showFriendsFeed = showFriendsFeed;
	exports.addPost = addPost;
	exports.updatePost = updatePost;

} ());
