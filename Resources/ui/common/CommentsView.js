/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	var acs = require('/lib/acs'),
		singleLineHeight = 20,
		maxCharsPerLine = 45; // bogus, but use this for quick and dirty layout
	

	function addCommentHandler (row, commentText, displayComments, cleanup) {
		var CommentsView = require('ui/common/CommentsView'),
			Comments = require('lib/comments'),
			social = require('lib/social'),
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
				Ti.API.info("FIRE EVENT: NEW Comment from " + senderId);
				Ti.App.fireEvent('newComment', {"user_id": senderId, "post_id": post.id, "message": commentText});
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
				keyboardType: Ti.UI.KEYBOARD_EMAIL,
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
				if (e.source.value === e.source.privHintText) {
					e.source.value = "";
					e.source.color = 'black';
				}
			});
			contentTextInput.addEventListener('blur', function(e) {
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
			//contentTextInput.focus();
			setTimeout(function(){ contentTextInput.focus();}, 250);						
		}
		else {
			Ti.API.info("inputComment: post is null " + post);			
		}
	}


	
	function displayComment(row, comment) {
		var	commenter = comment.user ? comment.user.username + ": " : "",
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
			label = Ti.UI.createLabel({
						text: commenter + unescape(comment.content),
						font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
						textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
						wordWrap : true,
						horizontalWrap : true,	
						ellipsize: false,					
						left: 5, top: 2,
						height: 40,
						width: Ti.UI.FILL,
						color: 'black',
						visible: true	
					}),
			numLines;
			// very rough approx, quick and dirty for now
			numLines = Math.floor(label.text.length / maxCharsPerLine) + 1;
			label.height = singleLineHeight * numLines;
			row.add(label);						
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
			tableView = Ti.UI.createTableView({
								objname: 'PostDetails',
								backgroundColor: 'white',
								color: 'black',
								visible: true				
							});
							
			if (tableView) {
				win.add(tableView);	
				win.table = tableView;				
				// retrieves comments for current post and display each post followed by its comments on separate rows
				Comments.getPostComments(post.id, function (comments) {DetailWindow.showPostComments (tableView, post, newComment, comments);});
			}							
	}
	
	
	exports.createCommentsView = createCommentsView;
	exports.displayComment = displayComment;
	exports.createPostCommentsTable = createPostCommentsTable;
	exports.inputComment = inputComment;	
	
} ())