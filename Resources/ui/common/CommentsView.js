/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	

	function addCommentHandler (row, commentText, displayComments, cleanup) {
		var acs = require('/lib/acs'),
			CommentsView = require('ui/common/CommentsView'),
			Comments = require('lib/comments'),
			social = require('lib/social'),
			notifications = require('/ui/common/notifications'),
			post = row.post,
			senderId = acs.currentUser().id,
			addCommentHandlerCallback = function (comment) {
				social.newCommentNotification(post, commentText);
				var commentsCount = row.commentsCount,
					originRow = row.originRow,
					comments = (originRow && originRow.comments) || [];
				if (displayComments) {
					//FIXME also check that tableView is a child of win
					CommentsView.displayComment(row, comment);
					//add new comment to originRow and display it
					if (originRow && comments) {
						comments.push(comment);
						originRow.comments = comments;
						CommentsView.displayComment(originRow, comment, Ti.App.maxCommentsInPostSummary);
					}
				}
				originRow.addEventListener('update_commentsCount', originRow.updateCommentsCountHandler);
				originRow.fireEvent('update_commentsCount');
				notifications.newCommentHandler(post.id, senderId, commentText);
				//Ti.API.info("FIRE EVENT: NEW Comment from " + senderId);
				//Ti.App.fireEvent('newComment', {"uid": senderId, "pid": post.id, "message": commentText});
			};
		if (commentText === "") {
			alert(Ti.Locale.getString('emptyComment'));
		}
		else {
			Comments.createComment(post.id, commentText, addCommentHandlerCallback);
			cleanup();					
		}
	}
	
	

	function inputComment (row) {
		var contentTextInput,
			sendBtn = Ti.UI.createButton({
											    style : Ti.UI.iPhone.SystemButtonStyle.DONE,
											    title : 'Send'
											}),
			cancelBtn = Ti.UI.createButton({
											    systemButton : Ti.UI.iPhone.SystemButton.CANCEL
											}),
			flexSpace = Ti.UI.createButton({
												systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
											}),
			post = row.post,
			removeInputFields = function() {
									contentTextInput.blur();
									contentTextInput.hide();
									row.remove(contentTextInput);
								};
							
		if (post) {
			Ti.API.info("Add a comment to post " + post.content);
			// comment input field
			contentTextInput = Ti.UI.createTextArea({
				autolink: Ti.UI.AUTOLINK_URLS,
				editable: true,
		        value: 'Add a comment...',
				color: '#aaa',
		        top: 5, //postH + 140, 
		        left: 5, 
		        width: 310, //255, 
		        height: 60,
				textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
				autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,	
				//keyboardToolbar : [cancelBtn, flexSpace, sendBtn],
				//keyboardType: Ti.UI.KEYBOARD_EMAIL,
				returnKeyType: Ti.UI.RETURNKEY_SEND,			
		        //borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		        borderColor: 'black',
		        borderWidth: 1,
				borderRadius : 1,
				font : {
					fontWeight : 'normal',
					fontSize : '17'
				}
			});
			contentTextInput.privHintText = contentTextInput.value;			
			row.add(contentTextInput);
			row.textArea = contentTextInput;
					
			contentTextInput.addEventListener('focus', function(e) {
				contentTextInput.editable = true;										
				if (e.source.value === e.source.privHintText) {
					e.source.value = "";
					e.source.color = 'black';
				}
			});
			contentTextInput.addEventListener('blur', function(e) {
				contentTextInput.editable = false;										
				if (e.source.value === "") {
					e.source.value = e.source.privHintText;
					e.source.color = '#aaa';
				}
			});
			
			contentTextInput.addEventListener('return', function()
			{
				sendBtn.fireEvent('click');
			});
		    
		    sendBtn.addEventListener('click', 
									function (e) {
										var commentText = escape(contentTextInput.value);
										addCommentHandler(row, commentText, true, removeInputFields);										
									});	
			setTimeout(function(){ contentTextInput.focus();}, 250);						
		}
		else {
			Ti.API.info("inputComment: post is null " + post);			
		}
	}


	function openInWebView(containingTab, url) {
		var webview = Titanium.UI.createWebView({url: url}),
			window = Titanium.UI.createWindow();
	    window.add(webview);
	    window.containingTab = containingTab;
	    containingTab.open(window);
	}
	
	
	
	function displayComment(row, comment) {
		/*jslint regexp: true */
		if (!comment) {
			alert("null comment");
			return;
		}
		var	PostView = require('ui/common/PostView'),
			ProfileView = require('ui/common/ProfileView'),		
			commenter = comment.user ? comment.user.username : null,
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
			avatarView,
			preSpaces = "", i, numSpaces = 0,
			label = Ti.UI.createTextArea({
				        autoLink: Ti.UI.AUTOLINK_URLS,
				        editable: false,
						font:{fontFamily:'Arial', fontSize:defaultFontSize + 2, fontWeight:'normal'},
						textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
						wordWrap : true,
						//horizontalWrap : true,					
						//left: 0, 
						top: 0,
						height: Ti.UI.SIZE,
						width: Ti.UI.FILL,
						color: 'black',
						visible: true,
						scrollable: false,
						//borderWidth: 1,
						//borderColor: 'black'	
			}),
			authorBtn = null,			
			urlRe = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9.\-]+|(?:www.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9.\-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[\-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/,		
			url = null,
			numLines = 0,
			clickHandler = function(event) {
					var tableSection = row.getParent(),
						tableView = tableSection ? tableSection.getParent() : null,
						detailWin = tableView ? tableView.getParent() : null,
						containingTab = detailWin ? detailWin.containingTab : null;
					if (containingTab && url) {
						openInWebView(containingTab, url);	
					}			
			};

			// due to appcelerator lossage, some comments don't have a user
			if (commenter) {
				numSpaces = Math.ceil(commenter.length * 1.6) + 4;
				for (i = 0; i < numSpaces; i = i + 1) {
					preSpaces += " ";
				}				
				authorBtn = Ti.UI.createButton({
								color: '#576996',
								style: 'Titanium.UI.iPhone.SystemButtonStyle.PLAIN',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'bold'},
								ellipsize: false,
								title: commenter,
								left: 5, 
								top: 0,
								width:Ti.UI.SIZE, 
								height: Ti.UI.SIZE
								});
				authorBtn.top = (defaultFontSize + 2)/2;
				authorBtn.addEventListener('click', function (e) {
															var containingTab = Ti.App.mainTabGroup.getActiveTab();
															ProfileView.displayUserProfile(containingTab, comment.user);
															});				
				label.add(authorBtn);								
			}

			url = comment.content.match(urlRe);
			if (url) {
				comment.url = url[0].trim();
				Ti.API.info("url " + comment.url);				
			}
			
			label.value = preSpaces + unescape(comment.content);
			row.add(label);	
			label.addEventListener('singletap', clickHandler);
			label.addEventListener ('click', clickHandler);								
	}
	
	
	function createCommentsView (row, comments, maxComments) {
		var length = maxComments ? Math.min(maxComments, comments.length) : comments.length,
			i;
		for (i = 0; i < length; i = i + 1) {
			displayComment(row, comments[i]);						
		}
	}
	

	function displayCommentsInPostView(containingTab, row) {
		Ti.API.info("createPostCommentsTable");
		var	Comments = require('lib/comments'),
			PostView = require('ui/common/PostView'),
			post = row && row.post,
			linkHandler = function (row) {PostView.findSource(containingTab, row);},
			tableView = Ti.UI.createTableView({
								objname: 'PostDetails',
								backgroundColor: 'white',
								color: 'black',
								visible: true,
								separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,
								layout: 'vertical'																
						}),
			successCallback = function (comments) {
								var post = row && row.post;
								if (row) {
									row.comments = comments;
								}
								createCommentsView(row, comments, Ti.App.maxCommentsInPostSummary);
							};
		// retrieves comments for current post and display each post followed by its comments on separate rows
		Comments.getPostComments(post, successCallback);		
	}

	function createPostCommentsTable (containingTab, containingView, originRow, newComment) {
		Ti.API.info("createPostCommentsTable");
		var	Comments = require('lib/comments'),
			DetailWindow = require('ui/common/DetailWindow'),
			PostView = require('ui/common/PostView'),
			tableView = Ti.UI.createTableView({
								objname: 'PostDetails',
								separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE												
							}),
			successCallback = function (comments) {
				DetailWindow.showPostComments (containingTab, tableView, originRow, newComment, comments);
			};							
			if (tableView) {
				containingView.add(tableView);	
				containingView.commentsTable = tableView;
				// FIXME This should be attached to the tableView, not the window
				//containingView.linkHandler = linkHandler;				
				// retrieves comments for current post and display each post followed by its comments on separate rows
				if (originRow.comments) {
					successCallback(originRow.comments);	
				}
				else {
					Comments.getPostComments(originRow.post, successCallback);					
				}
			}							
	}
	
	
	exports.createCommentsView = createCommentsView;
	exports.displayComment = displayComment;
	exports.createPostCommentsTable = createPostCommentsTable;
	exports.inputComment = inputComment;
	exports.displayCommentsInPostView = displayCommentsInPostView;	
	
} ());