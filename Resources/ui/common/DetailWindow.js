// copyright 2012 by Monique Barbanson. All rights reserved.
// @author MONIQUE BARBANSON
// Detail window for photos

(function () {
	'use strict';

	var CommentsView = require('ui/common/CommentsView'),
		Comments = require('lib/comments'),
		Likes = require('lib/likes'),		
		acs = require('lib/acs'),
		social = require('lib/social');
	
	function showPreview (thumbView) {
		var imgView = null,
			detailWindow = Ti.UI.createWindow({
									title: title + "Fashionista Favorites",
							        backgroundColor: 'black',
							        barColor: '#5D3879',
							        tabBarHidden: true
							});

		imgView = Ti.UI.createImageView({
			title: 'Post Detail',
			backgroundColor: 'black',
			width: Ti.UI.FILL,
			height: Ti.UI.FILL
		});
		detailWindow.imgView = imgView;
		detailWindow.add(imgView);

		// use small_240 if present, otherwise use the thumbnail itself or fallback image if neither has a value
		imgView.image = thumbView.image || '/photos/IMG_0001.JPG';
		imgView.show();
		
		return detailWindow;
	}
	
	function createDetailWindow(title) {
		var detailWindow = Ti.UI.createWindow({
							title: title + "'s Photo",
					        backgroundColor: 'white',
							barColor: '#5D3879',
							tabBarHidden: true	
						});
		return detailWindow;		
	}
	
	
	function likePost(row) {
		var post = row.post,
			createLikeCallback = function (like) {
				social.newLikeNotification(post);
				var likesCount = row.likesCount;	
				likesCount.fireEvent('update_likesCount');
			};
		
		if (post) {
			Ti.API.info("Like a post " + post.content);
			Likes.createLike(post, createLikeCallback);
		}
		else {
			Ti.API.info("likePost: post is null " + post);			
		}		
	}
	

	function updateLikesCount (row, post) {
		Ti.API.info('update like count');	
		var likesCount = row.likesCount,
			count =  post.likes_count; //commentsCount.text.split(" ", 1);
		row.post = post;
		// Update likes count
		likesCount.text = count + ' likes'; //parseInt(count[0], 10) + 1 + ' comments';			
	}

		
	function createComment (tableView, row, commentText) {
		var post = row.post,
			createReviewCallback = function (review) {
				social.newCommentNotification(post, commentText);
				var commentsCount = row.commentsCount;
				if (tableView.displayComments) {
					//FIXME also check that tableView is a child of win
					CommentsView.addNewComment(tableView, review);									
				}	
				commentsCount.fireEvent('update_commentsCount');
			};
		Comments.createReview(post.id, commentText, createReviewCallback);
	}

	
	function flagPost(row) {
		var post = row.post;		
		alert("Flag post as inappropriate" + post.content);
	}
	
	
	function updateCommentsCount (row, post) {
		Ti.API.info('Need to updateCommentsCount');	
		var commentsCount = row.commentsCount,
			count =  post.reviews_count; //commentsCount.text.split(" ", 1);
		row.post = post;
		// Update comment count
		commentsCount.text = count + ' comments'; //parseInt(count[0], 10) + 1 + ' comments';
			
	}



	function createComment (tableView, row, commentText) {
		var post = row.post,
			createReviewCallback = function (review) {
				social.newCommentNotification(post, commentText);
				var commentsCount = row.commentsCount;
				if (tableView.displayComments) {
					//FIXME also check that tableView is a child of win
					CommentsView.addNewComment(tableView, review);									
				}	
				commentsCount.fireEvent('update_commentsCount');
			};
		Comments.createReview(post.id, commentText, createReviewCallback);
	}
	

	function addComment (tableView, row, postH) {
		var post = row.post,
			contentTextInput,
			sendBtn,
			closeBtn;
		if (post) {
			//Ti.API.info("Add a comment to post " + post.content);
			// comment input field
			contentTextInput = Ti.UI.createTextArea({
		        hintText: 'Add a comment...',
		        top: postH + 135, left: 5, 
		        width: 255, height: 50,
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
			contentTextInput.focus();
			
			closeBtn = Ti.UI.createButton({
					image: '/icons/dark_x.png',
					style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
					left:245, top:postH + 140,
					//borderWidth: 1,
					//borderColor: 'black',
					width: 10,
					height: 10
					});
			row.add(closeBtn);
			closeBtn.addEventListener('click', function(e) { 
													row.remove(contentTextInput);
													row.remove(sendBtn);
													row.remove(closeBtn);
												});
			
			
			// send comment button			
			sendBtn = Ti.UI.createButton({
					        title: 'Send',
					        top: postH + 135, left: 265, 
					        width: 50, height: 50
				        });
				    
		    row.add(sendBtn);
		    
		    sendBtn.addEventListener('click', 
									function (e) {
										var reviewText = contentTextInput.value || 'How does this look?';
										createComment(tableView, row, reviewText);
										// remove comment input UI
										row.remove(contentTextInput);
										row.remove(sendBtn);
										row.remove(closeBtn);
									});    
		}
		else {
			Ti.API.info("addComment: post is null " + post);			
		}
	}


	function createRow (post) {
		var row = Ti.UI.createTableViewRow({
				    className:'fashionistaPost', // used to improve table performance
					color: 'black',
					backgroundColor: 'white',
					selectedBackgroundColor:'white',
				    width:Ti.UI.SIZE,
				    height: Ti.UI.SIZE
					});
		row.post = post;			  
		return row;
	}
	
	//FIXME when do we pass in a photoBlob here?
	function setRowEventHandlers (row, clickHandler, updateCommentsCountHandler, updateLikesCountJandler, photoBlob) {
		row.action = function (e) {if (clickHandler) {clickHandler(row, photoBlob);}};
		row.updateCommentsCount = function(e) {
										Ti.API.info('Need to updateCommentsCount');	
										if (updateCommentsCountHandler) {
											var post = row.post;
											// update post then the commentsCount in row from the new post values
											acs.showPost(post.id, function (updatedPost) {updateCommentsCountHandler(row, updatedPost);});
									}};	
		row.updateLikesCount = function(e) {
										Ti.API.info('Need to updateLikesCount');	
										if (updateLikesCountHandler) {
											var post = row.post;
											// update post then the commentsCount in row from the new post values
											acs.showPost(post.id, function (updatedPost) {updateLikesCountHandler(row, updatedPost);});
									}};												
	}
	

	function populateRow (tableView, row, photoBlob) {
		var IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/',
			defaultFontSize = Ti.Platform.name === 'android' ? 16 : 14,
			post = row.post,
			imageAvatar,
			labelUserName,
			labelDetails,
			imgView,
			img,
			imgW,
			imgH,
			postW,
			postH,
			labelDate,
			createdAtDate,
			likeBtn,
			commentBtn,
			flagBtn,
			likeIcon, likesCount,
			commentIcon, commentsCount;
			
			// if photoBlob is null, this was called to display a photo that's already uploaded
			if (!photoBlob) {
				if (post.photo.urls.iphone) {
					img = post.photo.urls.iphone;
					imgW = Ti.App.photoSizes[Ti.Platform.osname][0];
					imgH = Ti.App.photoSizes[Ti.Platform.osname][1];
				}
				else {
					img = post.photo.urls.medium_320;
					imgW = 320;
					imgH = 480;
				}
			}
			else {
				img = photoBlob;
				imgW = photoBlob.width;
				imgH = photoBlob.height;
			}
			
			//Ti.API.info("photo width " + imgW + "  height  " + imgH);
			postW = Math.min(Ti.App.SCREEN_WIDTH, imgW);
			postH = Math.min(Ti.App.SCREEN_WIDTH, imgH);
			//Ti.API.info("post width " + postW + "  height  " + postH);
			//images are square. make them fit
			imgView = Ti.UI.createImageView({
							image: img,
							borderColor: '#5D3879',
							borderWidth: 1,							
							left:0, top: 0,
							width:postW, 
							height: postH
							});
			row.add(imgView);
			imgView.addEventListener('click', row.action);

			imageAvatar = Ti.UI.createImageView({
							image: IMG_BASE + 'custom_tableview/user.png',
							left:5, top:postH + 5,
							width:30, height:30
							});
			row.add(imageAvatar);
  
			labelUserName = Ti.UI.createLabel({
								color:'#576996',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'bold'},
								ellipsize: false,
								text: post.user.username,
								left:40, top: postH + 5,
								width:160, height: 20
								});
			row.add(labelUserName);

			createdAtDate = post.created_at;
	
			labelDate = Ti.UI.createLabel({
							color:'#999',
							font:{fontFamily:'Arial', fontSize:defaultFontSize, fontWeight:'normal'},
							text:createdAtDate,						
							left:40, top: postH + 25,
							width:160, height:20
							});
			row.add(labelDate);

			flagBtn = Ti.UI.createButton({
								image: '/icons/light_more....png',
								style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
								left:290, top:postH + 5,
								width:30,
								height: 30
								});
			row.add(flagBtn);
			flagBtn.addEventListener('click', function(e) { flagPost(row);});

			commentBtn = Ti.UI.createButton({
								image: '/icons/light_comment.png',
								style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
								left:245, top:postH + 5,
								width:30,
								height: 30
								});
			row.add(commentBtn);
			commentBtn.addEventListener('click', 
										function(e) {
												addComment(tableView, row, postH);
										 }
									 );
			likeBtn = Ti.UI.createButton({
								image: '/icons/light_heart.png',
								style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
								left:200, top:postH + 5,
								width:30,
								height: 30
								});
			row.add(likeBtn);
			likeBtn.addEventListener('click', function(e) { likePost(row);});
						
			// photo caption
			labelDetails = Ti.UI.createLabel({
								color:'#222',
								autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: post.content,
								wordWrap : true,
								horizontalWrap : true,															
								left:5, top: postH + 35,
								width:Ti.UI.FILL,
								height: 60 //Ti.UI.SIZE
								});
			row.add(labelDetails);

			// number of likes
			likeIcon = Ti.UI.createImageView({
							image: '/icons/light_heart.png',
							left:5, top: postH + 100,
							width:15, height:15
							});
			row.add(likeIcon);			

			
			likesCount = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: (post.likes_count || 0)  + ' likes',
								left: 30, top: postH + 100,
								width: 200,
								height: 15
								});
			row.add(likesCount);
			row.likesCount = likesCount;
			likesCount.addEventListener('update_likesCount', row.updateLikesCount);
						
			// number of comments
			commentIcon = Ti.UI.createImageView({
							image: '/icons/light_comment.png',
							left:5, top: postH + 120,
							width:15, height:15
							});
			row.add(commentIcon);			
		
			commentsCount = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: (post.reviews_count || 0) + ' comments',
								left: 30, top: postH + 120,
								width: 290,
								height: 15
								});
			row.add(commentsCount);	
			row.commentsCount = commentsCount;
			commentsCount.addEventListener('click', row.action);
			commentsCount.addEventListener('update_commentsCount', row.updateCommentsCount);
	
			return row;
	}


	function showPostAndComments(tableView, post, photoBlob, comments) {
		if (tableView) {
			var row;
			tableView.displayComments = true; 
			row = createRow (post);
			setRowEventHandlers (row, null, updateCommentsCount, updateLikesCount);
			populateRow(tableView, row, photoBlob);
			tableView.appendRow(row);
			CommentsView.createCommentsView(tableView, comments);			
		}
	}
	
	
	function showPostDetails (win, post, photoBlob) {
		var tableView = Ti.UI.createTableView({
								objname: 'PostDetails',
								backgroundColor: 'white',
								color: 'black',
								visible: true				
							});
							
			if (tableView) {
				tableView.parentWin = win;				
				// retrieves comments for current post and display each post followed by its comments on separate rows
				Comments.getPostComments(post.id, function (comments) {showPostAndComments (tableView, post, photoBlob, comments);});
				win.add(tableView);	
				win.table = tableView;				
			}				
				
	}


	exports.showPreview = showPreview;	
	exports.showPostDetails = showPostDetails;
	exports.createDetailWindow = createDetailWindow;
	exports.createRow = createRow;
	exports.populateRow = populateRow;
	exports.setRowEventHandlers = setRowEventHandlers;
	exports.updateCommentsCount = updateCommentsCount;
	exports.updateLikesCount = updateLikesCount;	
} ());