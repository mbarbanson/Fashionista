/*
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
			
		if (tableView && row) {
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
		else {
			Ti.API.info("failed to display new post! Likely because of corrupted data on the backend");
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
	
	
	// gettingStartedOverlay	
	
	// check that the overlays are around
	function dismissGettingStartedOverlay (parentWin) {
		var transparentOverlay = parentWin.transparentOverlay,
			translucentOverlay = parentWin.translucentOverlay;
		if (transparentOverlay && transparentOverlay.getParent() === parentWin) {
			parentWin.remove(transparentOverlay);
			parentWin.transparentOverlay = null;	
		}
		if (translucentOverlay && translucentOverlay.getParent() === parentWin) {
			parentWin.remove(translucentOverlay);
			parentWin.translucentOverlay = null;	
		}		
	}
	
	
	function showGettingStartedOverlay(parentWin) {
		var translucentOverlay = Ti.UI.createView({
			backgroundColor: '#444444',
			opacity: 0.60,
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			navBarHidden: true
			}),
			transparentOverlay = Ti.UI.createView({
			backgroundColor: 'transparent',
			opacity: 1,
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			navBarHidden: true
			}),			
			welcomeText = Ti.UI.createLabel({
				text: Ti.Locale.getString('welcome_message'),
				textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
				font: {
					fontWeight: 'bold',
					fontSize: '30'
				},					
				backgroundColor: 'transparent', //'#5D3879',
				shadowColor: '#5D3879',
				shadowOffset: {x:2, y:2},				
				color: '#FFFFFF',
				borderRadius: 1,
				top: '2%',
				height: '25%',
				left: '10%',
				width: '80%'				
			}),
			exploreBtn = Ti.UI.createButton({
				title: Ti.Locale.getString('explorePublicFeed'),
				font: {
					fontWeight: 'bold',
					fontSize: '20'
				},				
				backgroundColor: '#5D3879',
				color: 'white',
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
				borderRadius: 1,
				top: '30%',
				height: '6%',
				left: '10%',
				width: '80%'
			}),
			editProfileBtn = Ti.UI.createButton({
				title: Ti.Locale.getString('fillProfile'),
				font: {
					fontWeight: 'bold',
					fontSize: '20'
				},				
				backgroundColor: '#5D3879',
				color: 'white',
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
				borderRadius: 1,				
				top: '46%',
				height: '6%',
				left: '10%',
				width: '80%'				
			}),
			createPostBtn = Ti.UI.createButton({
				title: Ti.Locale.getString('createPost'),
				font: {
					fontWeight: 'bold',
					fontSize: '20'
				},				
				backgroundColor: '#5D3879',
				color: 'white',
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
				borderRadius: 1,				
				top: '62%',
				height: '6%',
				left: '10%',
				width: '80%'				
			}),
			closeBtn = Ti.UI.createButton ({
				top: 0, 
				left: 290,
				width: 30,
				height: 30,
				image: '/icons/298-circlex.png',
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN				
			});

		transparentOverlay.add(welcomeText);
		transparentOverlay.add(exploreBtn);
		transparentOverlay.add(editProfileBtn);
		transparentOverlay.add(createPostBtn);
		transparentOverlay.add(closeBtn);
		parentWin.add(translucentOverlay);
		parentWin.add(transparentOverlay);
		parentWin.translucentOverlay = translucentOverlay;
		parentWin.transparentOverlay = transparentOverlay;
		
		exploreBtn.addEventListener('click', function (e) {
			dismissGettingStartedOverlay(parentWin);		
		});
		
		editProfileBtn.addEventListener('click', function(e) {
			dismissGettingStartedOverlay(parentWin);
			Ti.App.mainTabGroup.setActiveTab(4);	
		});
		
		createPostBtn.addEventListener('click', function(e) {
			dismissGettingStartedOverlay(parentWin);
			Ti.App.mainTabGroup.setActiveTab(2);	
		});
		
		closeBtn.addEventListener('click', function(e) {
			dismissGettingStartedOverlay(parentWin);
		});				
		
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
	
	
	function handleEmptyFriendsFeed() {
		var fWin = currentFeedWindow(), // returns FriendsFeedWindow
			findFeedWin = currentFindFeedWindow(),
			tableView = fWin.table,
			mainTabGroup = Ti.App.mainTabGroup;
		// check that we don't already show the getting started overlay
		if (tableView && !findFeedWin.translucentOverlay) {
			if (!tableView.data || tableView.data.length === 0) {
				// no photos in friend feed, show public feed									
				mainTabGroup.setActiveTab(1);									
				// this is the first time the user is using fasghionist. provide some guidance
				showGettingStartedOverlay(currentFindFeedWindow());																						
			}			
		}			
	}
	
	
	function showFeedWin(fWin, postQuery, noRefresh) {
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
			if (!noRefresh) {
				clearFeedWin(fWin);
			}			
			cleanupAction = function() {
								var mainTabGroup = Ti.App.mainTabGroup;
								
								if (fWin === currentFeedWindow()) {
									if (!tableView.flipped) {
										handleEmptyFriendsFeed();									
										mainTabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
										tableView.flipped = true;
									}	
								}
								
								activityIndicator.hide(); 
								fWin.rightNavButton = fWin.savedRightNavButton;
								inShowFeedWindow = false;
								fWin.initialized = true;
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
	
	function showFriendsFeed(noRefresh, selectedPostId) {
		showFeedWin(privFeedWindow, friendFeedPostQuery, noRefresh);
	}
	
	function showFindFeed(noRefresh, selectedPostId) {
		showFeedWin(privFindFeedWindow, findFeedPostQuery, noRefresh);
	}
	
	
	Ti.App.addEventListener('refreshFeedWindow', function (e) { showFriendsFeed(false);});
	
	Ti.App.addEventListener('refreshFindFeedWindow', function (e) { showFindFeed(false);});
	
	
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
						// if the public feed has already been initialized just add the new post at the top. Otherwise, it will get displayed as part of the initialization process
						if (Ti.App.newPublicPost && currentFindFeedWindow().initialized) {
							displayPostInFindFeed(post, true); // post is inserted at top with index 0							
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
		Ti.App.mainTabGroup.setActiveTab(0);		
	}
	

	function afterSharePostFeedWin (fWin, post) {
		removeFinishingUpRowFeedWin(fWin, true, post);		
	}

	
	function afterSharePost (post) {
		removeFinishingUpRowFeedWin(privFeedWindow,true, post);		
	}
	
	
	function findRowforPost(tableView, postId) {
		var section, rows, numRows, i;
		section = tableView.data[0];
		rows = section && section.getRows();
		numRows = rows && rows.length;
		for (i = 0; i < numRows; i = i +1) {
			if (rows[i].post.id === postId) {
				return i;
			}
		}
		return -1;
	}
	
	
	function deleteRowforPost(tableView, postId) {
		var rowIdx = -1;
		if (postId) {
			rowIdx = findRowforPost(tableView, postId);
		}
		if (rowIdx !== -1) {
			tableView.deleteRow(rowIdx, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.LEFT});
			Ti.API.info("deleteRowforPost: rowIdx " + rowIdx);
		} 
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
				objname: 'PostSummary',
				separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE
		});
		
		fWin.type = type;
		// window should know how to update its posts
		fWin.addEventListener('deletePost', function (e) {
				deleteRowforPost(tableView, e.postId);
		});
		tableView.addEventListener('postlayout', function (e) {
				if (fWin.type === 'friendFeed') {
					handleEmptyFriendsFeed();
				}
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
		// go to a push model to refresh public feed windows. just show when switching tabs instead of forcing a rebuild everytime 
		fWin.initialized = false;												
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
	exports.handleEmptyFriendsFeed = handleEmptyFriendsFeed;
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
	exports.dismissGettingStartedOverlay = dismissGettingStartedOverlay;

} ());
