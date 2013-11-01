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

	function getMostRecentPost(fWin) {
		var tableView = fWin.table,
			sections = tableView && tableView.getSections(),
			rows, firstRow, post = null;
		if (sections.length > 0 && sections[0].getRows().length > 0) {
			rows = sections[0].getRows();
			firstRow = rows[0];
			post = firstRow.post;
		}
		return post;	
	}
	
	function getMostRecentFriendPost() {
		getMostRecentPost(privFeedWindow);
	}
	
	
	function getMostRecentPublicPost() {
		getMostRecentPost(privFindFeedWindow);
	}

	function displayPostInFeedWin(fWin, post, insertAtTop) {
		var PostView = require('ui/common/PostView'),
			acs = require('lib/acs'),
			currentUser = acs.currentUser(),
			sections, section, rows = fWin.rows,
			row = PostView.displayPostSummaryView(fWin.containingTab, post),
			tableView = fWin.table,
			tabGroup = null;
			
		if (tableView && row) {
			sections = tableView.getSections();
			if (insertAtTop) {
				Ti.API.info("insert row at top of feed window");
				if (sections.length > 0 && sections[0].getRows().length > 0) {
					Ti.API.info("There's at least one post in the feed window. Insert Before 0");
					tableView.insertRowBefore(0, row, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});	
				}
				else {
					Ti.API.info("No post in the feed window. Append");
					tableView.appendRow(row, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.RIGHT});
				}
			}
			else { 
				// not inserting at top means we're displaying the whole table. 
				// create the rows array and call setData instead of appending rows one by one which seems to be very slow
				// this code can be executed twice with no problems in case we have a race condition
				if (!tableView.flipped) {
					tableView.flipped = true;
					tabGroup = Ti.App.mainTabGroup;
					tabGroup.open();  //{transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
					Ti.API.info("Flipped tabgroup open");
				}				
				rows.push(row);
				fWin.rows = rows;				
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
		if (fWin.table && fWin.rows) {
			while (fWin.rows.length > 0) {
				fWin.table.deleteRow(fWin.rows[0]);
			}
		}	
	}


	function clearFeed() {
		clearFeedWin(privFeedWindow);	
	}
	

	// gettingStartedOverlay	
	
	// check that the overlays are around
	function dismissGettingStartedOverlay (parentWin) {
		var transparentOverlay = parentWin.transparentOverlay,
			translucentOverlay = parentWin.translucentOverlay,
			result = false;
		if (transparentOverlay && transparentOverlay.getParent() === parentWin) {
			parentWin.remove(transparentOverlay);
			parentWin.transparentOverlay = null;
			result = true;	
		}
		if (translucentOverlay && translucentOverlay.getParent() === parentWin) {
			parentWin.remove(translucentOverlay);
			parentWin.translucentOverlay = null;
			result = true;	
		}
		return result;		
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
				backgroundColor: 'transparent',
				shadowColor: 'black',
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
				textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,			
				//backgroundColor: Ti.Locale.getString('themeColor'),
				color: 'blue',
				shadowColor: 'white',
				shadowOffset: {x:2, y:2},				
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
				borderRadius: 1,
				top: '30%',
				height: Ti.UI.SIZE, //'6%',
				left: '10%',
				width: '80%'
			}),
			editProfileBtn = Ti.UI.createButton({
				title: Ti.Locale.getString('fillProfile'),
				font: {
					fontWeight: 'bold',
					fontSize: '20'
				},
				textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,										
				//backgroundColor: Ti.Locale.getString('themeColor'),
				color: 'blue',
				shadowColor: 'white',
				shadowOffset: {x:2, y:2},				
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,				
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
				textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,								
				//backgroundColor: Ti.Locale.getString('themeColor'),
				color: 'blue',
				shadowColor: 'white',
				shadowOffset: {x:2, y:2},				
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,				
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
	
	function handleEmptyFriendsFeed() {
		var tableView = privFeedWindow.table,
			mainTabGroup = Ti.App.mainTabGroup,
			result = false;
		// check that we don't already show the getting started overlay
		if (tableView) {
			if (!tableView.data || tableView.data.length === 0 || tableView.data[0].getRows().length === 0) {
				// no photos in friend feed, show public feed									
				mainTabGroup.setActiveTab(1);
				mainTabGroup.tabs[1].fireEvent('focus');									
				// this is the first time the user is using fasghionist. provide some guidance
				if (!privFindFeedWindow.translucentOverlay) {
					showGettingStartedOverlay(privFindFeedWindow);
				}
				result = true;																						
			}			
		}
		return result;			
	}	
	

	/*
	 * 
	 * showFriendsFeed
	 */
	function postCreatedTime(post) {
		var created_at = (post && post.created_at) || null,
			dateComponents = created_at ? created_at.split(/:|T|-|\+/g) : [],
			date = null,
			time = null;
		if (dateComponents && dateComponents.length >= 6) {
			date = new Date(dateComponents[0], dateComponents[1]-1, dateComponents[2], dateComponents[3], dateComponents[4], dateComponents[5]);
			time = date.getTime();
		}
		return time;
	}
	
	function friendFeedPostQuery(showPost, cleanupAction, doNotClear) {
		var acs = require('lib/acs'),
			fWin = privFeedWindow,
			queryAction = function (posts) { 
				var mostRecentPost = getMostRecentPost(fWin),				
					numPosts = posts.length, i, post,
					displayAllPosts,
					displayRemainingPosts;
					displayAllPosts = function () {
						for (i = 0; i < numPosts ; i = i + 1) {
						    post = posts[i];
						    if (showPost) { showPost(post); }
					   }					
					};
				displayRemainingPosts = function () {
					for (i = 4; i < numPosts ; i = i + 1) {
					    post = posts[i];
					    if (showPost) { showPost(post); }
				   }					
				};				
				if (!mostRecentPost || (posts && posts.length > 0 && postCreatedTime(mostRecentPost) < postCreatedTime(posts[0]))) {
					//FIXME clear table view if needed. We should really only display all the new posts since the most recent instead of clearing the table
					if (!doNotClear) {
						clearFeedWin(fWin);
					}					
					if (numPosts > 4) {
						//display first four post
						for (i = 0; i < 4 ; i = i + 1) {
						    post = posts[i];
						    if (showPost) { showPost(post); }
						}
						displayRemainingPosts();				
					}
					else if (numPosts > 0 && numPosts <= 4) {
						displayAllPosts();
					}
					fWin.table.setData(fWin.rows);
					fWin.rows = [];
				}
				// stop activity indicator
				if (cleanupAction) { cleanupAction(); }					
			},
			friendsListCallback = function (friends, cleanupAction) {
											acs.getFriendsPosts(friends, queryAction, cleanupAction);
										};
		
		return acs.getFriendsList(friendsListCallback, cleanupAction);		
	}
	
	
	function findFeedPostQuery(showPost, cleanupAction, doNotClear) {
		var acs = require('lib/acs'),
			fWin = privFindFeedWindow,
			queryAction = function (posts) { 
				var mostRecentPost = getMostRecentPost(fWin),
					numPosts = posts.length, i, post,
					displayAllPosts,
					displayRemainingPosts;
					displayAllPosts = function () {
						for (i = 0; i < numPosts ; i = i + 1) {
						    post = posts[i];
						    if (showPost) { showPost(post); }
					   }					
					};
				displayRemainingPosts = function () {
					for (i = 4; i < numPosts ; i = i + 1) {
					    post = posts[i];
					    if (showPost) { showPost(post); }
				   }					
				};				
				if (!mostRecentPost || (posts && posts.length > 0 && postCreatedTime(mostRecentPost) < postCreatedTime(posts[0]))) {
					//FIXME clear table view if needed. We should really only display all the new posts since the most recent instead of clearing the table
					if (!doNotClear) {
						clearFeedWin(fWin);
					}					
					if (numPosts > 4) {
						//display first four post
						for (i = 0; i < 4 ; i = i + 1) {
						    post = posts[i];
						    if (showPost) { showPost(post); }
						}
						displayRemainingPosts();				
					}
					else if (numPosts > 0 && numPosts <= 4) {
						displayAllPosts();
					}
					fWin.table.setData(fWin.rows);
					fWin.rows = [];
				}
				// stop activity indicator
				if (cleanupAction) { cleanupAction(); }					
			};
		
		return acs.getPublicPosts(queryAction, cleanupAction);		
	}
	
	
	function showFeedWin(fWin, postQuery, doNotClear, afterAction) {
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
			cleanupAction = function() {
								var mainTabGroup = Ti.App.mainTabGroup,
									tab2 = mainTabGroup.tabs[2],
									blurHandler = function(e) {
														if (dismissGettingStartedOverlay(privFindFeedWindow)) {
															tab2.removeEventHandler('blur', blurHandler);
														}
													};
								
								if (fWin === currentFeedWindow()) {
									if (!tableView.flipped) {
										if (handleEmptyFriendsFeed()) {
											tab2.addEventListener('blur', blurHandler);	
										}																			
										mainTabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
										tableView.flipped = true;
									}	
								}
								if (afterAction) { afterAction();}
								activityIndicator.hide(); 
								fWin.rightNavButton = fWin.savedRightNavButton;
								inShowFeedWindow = false;
								fWin.initialized = true;
							};
			tableView.displayComments = false;	
			Ti.API.info("showFeedWin. Refreshing Feed window");
			showPost = function (post) {
							Ti.API.info('showPost');
							displayPostInFeedWin(fWin, post, false);
						};
			fWin.savedRightNavButton = fWin.rightNavButton;
			fWin.rightNavButton = activityIndicator;
			activityIndicator.show(); 

			postQuery(showPost, cleanupAction, doNotClear);
		}
		else {
			alert("FeedWindow doesn't have a tableView");
		}
	}
	
	function showFriendsFeed(doNotClear, selectedPostId, afterAction) {
		showFeedWin(privFeedWindow, friendFeedPostQuery, doNotClear, afterAction);
	}
	
	function showFindFeed(doNotClear, selectedPostId, afterAction) {
		showFeedWin(privFindFeedWindow, findFeedPostQuery, doNotClear, afterAction);
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
	
	
	
	function addFinishingUpRowFeedWin(fWin, postModel) {
		Ti.API.info('Calling addFinishingUpRow');
		var tableView = fWin.table,
			fRow = createFinishingUpRow(postModel);
		if (tableView && tableView.data) {		
			if (tableView.data.length > 0 && tableView.data[0].getRows().length > 0) {
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
		rows = section && section.getRows();
		numRows = section ? section.getRowCount() : 0;
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
		if (tableView && tableView.data && tableView.data.length > 0) {
			section = tableView.data[0];
			rows = section && section.getRows();
			numRows = (rows && rows.length) || 0;
			for (i = 0; i < numRows; i = i + 1) {
				fRow = rows[i];
				if (fRow.className === 'finishingUp') {
					Ti.API.info("Calling deleteRow");
					tableView.deleteRow(i, {animated: true, animatedStyle: Titanium.UI.iPhone.RowAnimationStyle.LEFT});
					if (doDisplayPost && post) {	
						if (numRows === 1) {
							Ti.API.info('First post in feed!');
							displayPostInFeedWin(fWin, post, false); // post is appended and will be row index 1
							fWin.table.setData(fWin.rows);
							fWin.rows = [];							
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
			Ti.API.error("couldn't find finishing up row in tableView");			
		}
		else {
			Ti.API.error("tableView is empty! ");
		}
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
			//imgH = image.height,
			//imgW = image.width,
			//newSize = Ti.App.photoSizes[Ti.Platform.osname],
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
		//postModel.photo = image; //resizeToPlatform(image);	image has already been scaled down to 640 * 480										
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
		numRows = (rows && rows.length) || 0 ;
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
		return rowIdx; 
	}
	
	function addFeedEventListeners(fWin) {
		var mainTabGroup = Ti.App.mainTabGroup,
			tableView = fWin.table,
			tab2 = mainTabGroup.tabs[2],
			blurHandler = function(e) {
								if (dismissGettingStartedOverlay(privFindFeedWindow)) {
									tab2.removeEventHandler('blur', blurHandler);
								}
							};
		// window should know how to update its posts
		fWin.addEventListener('deletePost', function (e) {
			var rowIdx = deleteRowforPost(tableView, e.postId);
			if (rowIdx === 0 && fWin.type === 'friendFeed') {
				if (handleEmptyFriendsFeed()) {
					tab2.addEventListener('blur', blurHandler);	
				}
			}
		});
											
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
			        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
			        extendEdges: [Ti.UI.EXTEND_EDGES_ALL]								
			}),
			tableView =  Ti.UI.createTableView ({
					objname: 'PostSummary',
					separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,
					layout: 'vertical'
			}),
			isAndroid = Ti.Platform.osname === 'android',
			refreshFeedWindowHandler = function (e) {
				if (e.reason === "significanttimechange" && privFeedWindow && !privFeedWindow.isInitialized) {
					Ti.API.info("no need to refresh feed window");
					return;
				} 
				showFriendsFeed(false, null, null);
			},
			refreshFindFeedWindowHandler = function (e) {
				if (e.reason === "significanttimechange" && privFindFeedWindow && !privFindFeedWindow.isInitialized) {
					Ti.API.info("no need to refresh find feed window");
					return;
				}
				showFindFeed(false, null, null);
			};
		
		fWin.type = type;
		fWin.rows = [];
		fWin.pages = [];
		fWin.currentPageNum = 0;
		fWin.table = tableView;
		fWin.initialized = false;
		tableView.flipped = false;
		fWin.add(tableView);
										
		tableView.addEventListener('scroll', function(evt) {
		    // If we're on android: our total number of rows is less than the first visible row plus the total number of visible
		    // rows plus 3 buffer rows, we need to load more rows!
		    // ---OR---
		    // If we're on ios: how far we're scrolled down + the size of our visible area + 100 pixels of buffer space
		    // is greater than the total height of our table, we need to load more rows!
		    if ((isAndroid && (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3))
		            || (!isAndroid && (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height))) {
		        // tell our interval (above) to load more rows
		        Ti.API.info("evt.contentOffset.y " + evt.contentOffset.y + " evt.size.height " + evt.size.height + 
		        " evt.contentSize.height " + evt.contentSize.height);
		    }		 
		});	
		
		
		// avoid memory leaks
		fWin.addEventListener('close', function (e) {
			Ti.App.removeEventListener('refreshFeedWindow', refreshFeedWindowHandler);
			Ti.App.removeEventListener('refreshFindFeedWindow', refreshFindFeedWindowHandler);

			if (privFeedWindow) {
				privFeedWindow.table.setData(null);
				privFeedWindow.table = null;
				privFeedWindow = null;
			}
			
			if (privFindFeedWindow) {
				privFindFeedWindow.table.setData(null);
				privFindFeedWindow.table = null;				
				privFindFeedWindow = null;
			}
		});
		
		Ti.App.addEventListener('refreshFeedWindow', refreshFeedWindowHandler);
		
		Ti.App.addEventListener('refreshFindFeedWindow', refreshFindFeedWindowHandler);		
					
		if (type === 'friendFeed') {	
			fWin.title = Ti.Locale.getString('fashionista') + ' ' + Ti.Locale.getString('friendsFeed');
			refreshBtn.addEventListener('click', function(e) { showFriendsFeed(false, null, null); });
			fWin.addEventListener('refreshFeedWindow', function(e) {showFriendsFeed(false, null, null); });		
		}
		else {
			fWin.title = Ti.Locale.getString('publicFeed') + ' ' + Ti.Locale.getString('fashionista');
			refreshBtn.addEventListener('click', function(e) { showFindFeed(false, null, null); });				
			fWin.addEventListener('refreshFeedWindow', function(e) {showFindFeed(false, null, null); });		
		}

		fWin.setRightNavButton(refreshBtn);
												
		return fWin;
	}
		
		
		
	
	exports.createFeedWindow = createFeedWindow;
	exports.addFeedEventListeners = addFeedEventListeners;
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
	exports.getMostRecentFriendPost = getMostRecentFriendPost;
	exports.getMostRecentPublicPost = getMostRecentPublicPost;

} ());
