/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	var acs = require('/lib/acs'),
		singleLineHeight = 25,
		maxCharsPerLine = 45; // bogus, but use this for quick and dirty layout
	

	function addCommentHandler (row, commentText, displayComments, cleanup) {
		var CommentsView = require('ui/common/CommentsView'),
			Comments = require('lib/comments'),
			social = require('lib/social'),
			notifications = require('/ui/common/notifications'),
			post = row.post,
			senderId = acs.currentUser().id,
			addCommentHandlerCallback = function (comment) {
				social.newCommentNotification(post, commentText);
				var commentsCount = row.commentsCount;
				if (displayComments) {
					//FIXME also check that tableView is a child of win
					CommentsView.displayComment(row, comment);
				}
				row.addEventListener('update_commentsCount', row.updateCommentsCountHandler);
				row.fireEvent('update_commentsCount');
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
//										contentTextInput.editable = false;										
										addCommentHandler(row, commentText, true, removeInputFields);										
									});	
			//contentTextInput.focus();
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
		var	PostView = require('ui/common/PostView'),
			ProfileView = require('ui/common/ProfileView'),		
			commenter = comment.user ? comment.user.username + ": " : "",
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
			label = Ti.UI.createTextArea({
				        autoLink: Ti.UI.AUTOLINK_URLS,
				        editable: false,
						value: commenter + unescape(comment.content),
						font:{fontFamily:'Arial', fontSize:defaultFontSize + 2, fontWeight:'normal'},
						textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
						wordWrap : true,
						horizontalWrap : true,					
						left: 5, top: 0, bottom: 0,
						height: Ti.UI.SIZE,
						width: Ti.UI.FILL,
						color: 'black',
						visible: true	
			}),
			authorBtn = Ti.UI.createButton({
								color: '#576996',
								backgroundColor: 'white',
								style: 'Titanium.UI.iPhone.SystemButtonStyle.PLAIN',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'bold'},
								ellipsize: false,
								title: commenter,
								left: 5, top: 0,
								width:Ti.UI.SIZE, height: 20
								}),			
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

			url = comment.content.match(urlRe);
			if (url) {
				comment.url = url[0].trim();
				Ti.API.info("url " + comment.url);				
			}
			// very rough approx, quick and dirty for now
			numLines = Math.floor(label.value.length / maxCharsPerLine) + 1;
			label.height = singleLineHeight * numLines;
			authorBtn.top = -label.height + (defaultFontSize + 2)/2;
			row.add(label);
			row.add(authorBtn);	
			label.addEventListener('singletap', clickHandler);
			label.addEventListener ('click', clickHandler);		
			authorBtn.addEventListener('click', function (e) {
														var containingTab = Ti.App.mainTabGroup.getActiveTab();
														ProfileView.displayUserProfile(containingTab, comment.user);
														});
						
	}
	
	
	function createCommentsView (row, comments) {
		var length = comments.length,
			i;
		for (i = 0; i < length; i = i + 1) {
			displayComment(row, comments[i]);						
		}
	}
	

	function createPostCommentsTable (win, post, newComment) {
		Ti.API.info("createPostCommentsTable");
		var	Comments = require('lib/comments'),
			DetailWindow = require('ui/common/DetailWindow'),
			PostView = require('ui/common/PostView'),
			linkHandler = function (row) {PostView.findSource(win.containingTab, row);},
			tableView = Ti.UI.createTableView({
								objname: 'PostDetails',
								backgroundColor: 'white',
								color: 'black',
								visible: true
								//separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE												
							});
							
			if (tableView) {
				win.add(tableView);	
				win.table = tableView;
				win.linkHandler = linkHandler;				
				// retrieves comments for current post and display each post followed by its comments on separate rows
				Comments.getPostComments(post.id, function (comments) {DetailWindow.showPostComments (win.containingTab, tableView, post, newComment, comments);});
			}							
	}
	
	
	exports.createCommentsView = createCommentsView;
	exports.displayComment = displayComment;
	exports.createPostCommentsTable = createPostCommentsTable;
	exports.inputComment = inputComment;	
	
} ());