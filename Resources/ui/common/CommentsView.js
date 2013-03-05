/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	var acs = require('/lib/acs');
	

	function addCommentHandler (row, commentText, displayComments) {
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
		Comments.createComment(post.id, commentText, addCommentHandlerCallback);
	}
	
	

	function inputComment (row) {
		var contentTextInput,
			sendBtn,
			closeBtn,
			post = row.post,
			removeInputFields = function() {
									contentTextInput.blur();
									contentTextInput.hide();
									row.remove(contentTextInput);
									sendBtn.hide();
									row.remove(sendBtn);
									closeBtn.hide();
									row.remove(closeBtn);
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
		        width: 255, height: 45,
				textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
				autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,				
		        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		        borderColor: 'black',
		        borderWidth: 1,
				borderRadius : 5,
				font : {
					fontWeight : 'normal',
					fontSize : '17'
				}
			});
			row.add(contentTextInput);
			row.textArea = contentTextInput;
			
			contentTextInput.privHintText = contentTextInput.value;
		
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
	

			closeBtn = Ti.UI.createButton({
					image: '/icons/dark_x.png',
					style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
					left:235, 
					top:-35, //postH + 145,
					borderWidth: 1,
					borderColor: 'black',
					backgroundColor: 'grey',
					backgroundFocusedColor: 'blue',
					width: 15,
					height: 15
					});
			row.add(closeBtn);
			closeBtn.addEventListener('click', removeInputFields);
						
			// send comment button			
			sendBtn = Ti.UI.createButton({
					        title: 'Send',
					        top: -25, //postH + 140, 
					        left: 270, 
					        width: 45, height: 45
				        });
				    
		    row.add(sendBtn);
		    
		    sendBtn.addEventListener('click', 
									function (e) {
										var commentText = contentTextInput.value || 'How does this look?';										
										addCommentHandler(row, commentText, true);
										// remove comment input UI
										removeInputFields();										
									});	
			//contentTextInput.focus();
			setTimeout(function(){ contentTextInput.focus();}, 250);						
		}
		else {
			Ti.API.info("inputComment: post is null " + post);			
		}
	}


	
	function displayComment(row, comment) {
		var	commenter = comment.user.username,
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
			label = Ti.UI.createLabel({
						text: commenter + ': ' + comment.content,
						font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
						textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
						left: 5, top: 5,
						height: 20,
						width: Ti.UI.FILL,
						color: 'black',
						visible: true	
					});
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