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

	//FIXME when do we have a photoBlob to pass in?
	function displayPostDetails (tab, post, photoBlob) {
		Ti.API.info('show post details');
		var detailWindow = DetailWindow.createDetailWindow(post.user.username);
		DetailWindow.showPostDetails(detailWindow, post, photoBlob);
		tab.open(detailWindow);	
	}
	
	
	// display post retrieved from cloud
	function displayPostSummary (tableView, post, clickHandler) {
		if (tableView) {
			var row = DetailWindow.createRow(post);
			DetailWindow.setRowEventHandlers(row, clickHandler, DetailWindow.updateCommentsCount);
			Ti.API.info('display post summary: adding a row to the feedWindow ');
			DetailWindow.populateRow(tableView, row);	  
			tableView.appendRow(row);
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
			fWin.table = null;
			//force table layout update
			fWin.remove(tableView);
			tableView.setData([]);	
			tableView.displayComments = false;		
			Ti.API.info("showFriendFeed. Refreshing Feed window");
			showPostDetails = function (row, photo) {
											Ti.API.info("Executing click handler callback for row " + row);
											displayPostDetails(fWin.containingTab, row.post, photo);
										};
			showPost = function (post) { 
					displayPostSummary(tableView, post, showPostDetails);
				};
			friendsListCallback = function (friends, cleanupAction) { acs.getFriendsPosts(friends, showPost, cleanupAction);};
			
			fWin.rightNavButton = activityIndicator;
			activityIndicator.show(); 

			acs.getFriendsList(friendsListCallback, cleanupAction);
			
			// add tableView back
			fWin.add(tableView);
			// force update layout to show posts
			fWin.updateLayout();
			fWin.table = tableView;		
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
			Ti.API.info('PUSH NOTIFICATION? Fashionista resumed ' + "\n time " + Date.now());
			//clearFeed(feedWin);
			showFriendsFeed(feedWin);
		}
	}	
	
	function createFeedWindow() {
		var feedWin = Ti.UI.createWindow({
				title: acs.currentUser().username + "'s Feed",
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
	exports.displayPostDetails = displayPostDetails;
	exports.updatePost = updatePost;

} ());
