/**
 * Copyright 2012 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
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


	function showPostDetails (tab, post, photoBlob) {
		Ti.API.info('show post details');
		var detailWindow = DetailWindow.createDetailWindow(post.user.username);	
		DetailWindow.showPostDetails(detailWindow, post, photoBlob);
		tab.open(detailWindow);	
	}
	
	
	// display post retrieved from cloud
	function displayPostSummary (tableView, post, clickHandler) {
		var row;
		if (tableView) {
			Ti.API.info('display post summary: adding a row to the feedWindow ');
			row = DetailWindow.populateRow(post, clickHandler);	  
			tableView.appendRow(row);
		}
	}
	

	function updatePost(postId, title, caption, callback) {
		
		var updatePostCallback = function (post) {
			Ti.API.info("successfully updated post " + post.content);
			callback(post);												
		};
							
		acs.updatePost(postId, title, caption, updatePostCallback);		
	}	


	
	function showFriendsFeed(fWin) {
		Ti.API.info('Calling show feed');
		
		var tableView = fWin.table,
			showPostDetailsCallback,
			displayPostCallback,
			friendsListCallback;

		if (tableView) {
			fWin.table = null;
			fWin.remove(tableView);
			tableView.setData([]);			
			Ti.API.info("showFriendFeed. Refreshing Feed window");
			showPostDetailsCallback = function (post, photo) {
											Ti.API.info("Executing click handler callback for post " + post);
											showPostDetails(fWin.containingTab, post, photo);
										};
			displayPostCallback = function (post) { displayPostSummary(tableView, post, showPostDetailsCallback);};
			friendsListCallback = function (friends) { acs.getFriendsPosts(friends, displayPostCallback);};
			
			acs.getFriendsList(friendsListCallback);
			
			fWin.add(tableView);
			fWin.updateLayout();
			fWin.table = tableView;			
		}
		else {
			Ti.API.info("FeedWindow doesn't have a tableView");
		}
	}

	function feedWindowClickHandler(e) {
		Ti.API.info("feedWindow table click handler " + e.rowData);
		var handler = e.rowData.action;
		if (handler) {
			handler(e.rowData.post);
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
				title: 'Friends Page',
		        backgroundColor: 'white',
		        barColor: '#5D3879'				
			}),
			tableView = Ti.UI.createTableView ({
				objname: 'PostSummary',
				backgroundColor: 'white',
				color: 'black',
				data: [],
				visible: true
			});	
		privFeedWindow = feedWin;
		feedWin.add(tableView);
		feedWin.table = tableView;
		
		// create table view click event listener
		tableView.addEventListener('click', feedWindowClickHandler);
		// listen for resume events until we find a better criteria for when to proactively update the feed
		// need to be able to distinguish between different notifications. Until then, this is not helping.
		//Ti.App.addEventListener('resumed', appResumedHandler);	
														
		return feedWin;
	}
		
	
	
	exports.createFeedWindow = createFeedWindow;
	exports.currentFeedWindow = currentFeedWindow;
	exports.clearFeed = clearFeed;
	exports.showFriendsFeed = showFriendsFeed;
	exports.showPostDetails = showPostDetails;
	exports.updatePost = updatePost;

}) ();
