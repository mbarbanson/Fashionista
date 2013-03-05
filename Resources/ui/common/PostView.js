/*
 * copyright 2012 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 * Detail window for photos
 * 
 */

(function () {
	'use strict';

// Like a post
	function likePost(row) {
		var post,
			social = require('lib/social'),
			Likes = require('lib/likes'),		
			createLikeCallback;
		if (row && row.post) {
			post = row.post;
			Ti.API.info("You liked a post: " + post.content);
			createLikeCallback = function (like) {
													social.newLikeNotification(post);
													if (row.updateLikesCountHandler) {
														row.addEventListener('update_likesCount', row.updateLikesCountHandler);	
														row.fireEvent('update_likesCount');														
													}
													else {
														Ti.API.error("likePost: row.updateLikesCountHandler is null. This just shouldn't happen!!!!");
													}
												};			
			Likes.createLike(post.id, createLikeCallback);
		}
		else {
			Ti.API.error("This shouldn't happen!!!! likePost: row or post is null " + row);			
		}		
	}
	

	function updateLikesCount (row, updatedPost) {
		Ti.API.info('update like count');	
		var likesCount = row.likesCount,
			count =  updatedPost.ratings_count; 
		row.post = updatedPost;
		likesCount.text = count + ' likes';		
	}
	
// Add a comment	
	function updateCommentsCount (row, updatedPost) {
		Ti.API.info('update CommentsCount');	
		var commentsCount = row.commentsCount,
			count =  (updatedPost.reviews_count || 0) - (updatedPost.ratings_count || 0);
		row.post = updatedPost;
		// Update comment count
		commentsCount.text = count + ' comments';	
	}
	
	
// Flag	
	function flagPost(row) {
		var post = row.post;		
		alert("Flag post as inappropriate" + post.content);
	}


	/*
	 *	createPostView
	 */
	//FIXME BEWARE!!!! this is the only function that should access post directly.
	// all other functions should access post through row, ESPECIALLY if they create closures that point to a post
	// since posts can be updated after they are liked or commented on.
	// at some point we should fix this by updating the local comments_count and ratings_count so we never have stale posts pointers
	function createPostView (post) {
		var row = Ti.UI.createTableViewRow({
				    className:'fashionistPost', // used to improve table performance
					color: 'black',
					backgroundColor: 'white',
					selectedBackgroundColor:'white',
				    width:Ti.UI.SIZE,
				    height: Ti.UI.SIZE,
				    layout: 'vertical'
					});
		row.post = post;			  
		return row;
	}

	
	/*
	 * displayPostDetails
	 */
	function displayPostDetailsView (row, newComment) {
		Ti.API.info('show post details');
		var DetailWindow = require('ui/common/DetailWindow'),
			detailWindow = DetailWindow.createDetailWindow(),
			ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			CommentsView = require('ui/common/CommentsView'),
			tab = Ti.App.getFeedTab(); 
		if (tab) {
			tab.open(detailWindow);
		}
		else {
			Ti.API.error("displayPostDetails: currentTab is null");
		}
		CommentsView.createPostCommentsTable(detailWindow, row.post, newComment);
		return detailWindow;	
	}

	
	/*
	 * populatePostView
	 */
	function populatePostView (row, displayComments, photoBlob) {
		var MoreActionDialog = require('/ui/common/moreActionDialog'),
			CommentsView = require('ui/common/CommentsView'),
			IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/',
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
			imageAvatar,
			labelUserName,
			labelDetails,
			imgView, photoUrls = row.post.photo.urls,
			img,
			imgW,
			imgH,
			postW,
			postH,
			labelDate,
			createdAtDate,
			likeBtn,
			commentBtn,
			moreBtn,
			likeIcon, likesCount,
			commentIcon, commentsCount;
			
			if (!displayComments) {
				// if photoBlob is null, this was called to display a photo that's already uploaded
				if (!photoBlob) {
					if (photoUrls) {
						if (photoUrls.iphone) {
							img = photoUrls.iphone;
							imgW = Ti.App.photoSizes[Ti.Platform.osname][0];
							imgH = Ti.App.photoSizes[Ti.Platform.osname][1];
						}
						else {
							img = photoUrls.medium_320;
							imgW = 320;
							imgH = 480;
						}					
					}
					else {
						alert("no photo in post!");
					}
				}
				else {
					img = photoBlob;
					imgW = photoBlob.width;
					imgH = photoBlob.height;
				}
				
				postW = Math.min(Ti.App.SCREEN_WIDTH, imgW);
				postH = Math.min(Ti.App.SCREEN_WIDTH, imgH);
	
				// images are square. make them fit
				// first row
				imgView = Ti.UI.createImageView({
								image: img,
								borderColor: '#5D3879',
								borderWidth: 1,							
								left:0, top: 0,
								width:postW, 
								height: postH
								});
				row.add(imgView);
				row.photo = img;
				//clickHandler = function (e) {row.action(post, img);};
				//imgView.addEventListener('click', clickHandler);

				//second row
				imageAvatar = Ti.UI.createImageView({
								image: IMG_BASE + 'custom_tableview/user.png',
								left: 5, top:5,
								width:30, height:30
								});
				row.add(imageAvatar);
	  
				labelUserName = Ti.UI.createLabel({
									color:'#576996',
									font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'bold'},
									ellipsize: false,
									text: row.post.user.username,
									left: 45, top: -30,
									width:155, height: 20
									});
				row.add(labelUserName);
				
				likeBtn = Ti.UI.createButton({
									image: '/icons/light_heart.png',
									style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
									left: 200, top:-20,
									width:30,
									height: 30
									});
				row.add(likeBtn);
				
				commentBtn = Ti.UI.createButton({
									image: '/icons/light_comment.png',
									style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
									left: 245, top:-30,
									width:30,
									height: 30
									});
				row.add(commentBtn);
	
				moreBtn = Ti.UI.createButton({
									image: '/icons/light_more....png',
									style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
									left: 290, top:-30,
									width:30,
									height: 30
									});
				row.add(moreBtn);
				
				likeBtn.addEventListener('click', function(e) { likePost(row);});
				
				moreBtn.addEventListener('click', function(e) { 
														MoreActionDialog.createMoreDialog(row);
													});
	
				commentBtn.addEventListener('click', 
											function(e) {
													if (!displayComments) {
														displayPostDetailsView(row, true);
													}
													else {
														CommentsView.inputComment(row);
													}
											 }
										 );
			}

			createdAtDate = row.post.created_at;

			//third row
			labelDate = Ti.UI.createLabel({
							color:'#999',
							font:{fontFamily:'Arial', fontSize:defaultFontSize, fontWeight:'normal'},
							text:createdAtDate,						
							left:40, top: -5,
							width:160, height:20
							});
			row.add(labelDate);
				
						
			// photo caption
			labelDetails = Ti.UI.createLabel({
								color:'#222',
								autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: row.post.content,
								wordWrap : true,
								horizontalWrap : true,															
								left:5, top: 0,
								width:Ti.UI.FILL,
								height: 60
								});
			row.add(labelDetails);

			// number of likes
			likeIcon = Ti.UI.createImageView({
							image: '/icons/light_heart.png',
							left:5, top: 5,
							width:15, height:15
							});
			row.add(likeIcon);			

			
			likesCount = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: (row.post.ratings_count || 0)  + ' likes',
								left: 30, top: -15,
								width: 200,
								height: 15
								});
			row.add(likesCount);
			row.likesCount = likesCount;
						
			// number of comments
			commentIcon = Ti.UI.createImageView({
							image: '/icons/light_comment.png',
							left:5, top: 5,
							width:15, height:15
							});
			row.add(commentIcon);			
		
			commentsCount = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: ((row.post.reviews_count|| 0) - (row.post.ratings_count || 0)) + ' comments',
								left: 30, top: -15,
								width: 290,
								height: 15
								});
			row.add(commentsCount);	
			row.commentsCount = commentsCount;
			
			if (!displayComments) {
				commentsCount.addEventListener('click', function (e) {displayPostDetailsView(row, true);});	
			}
	
			return row;
	}
	


	/*
	 * setPostViewEventHandlers
	 */
	function setPostViewEventHandlers (row) {
		var CommentsView = require('ui/common/CommentsView'),
			acs = require('lib/acs');
		//row.action = displayPostDetails;
		row.updateCommentsCountHandler = function(e) {	
										var post = row.post;
										// update post then the commentsCount in row from the new post values
										acs.showPost(post.id, function (updatedPost) {
																	Ti.API.info('updateCommentsCountHandler: updateCommentsCount');
																	updateCommentsCount(row, updatedPost);
																	row.removeEventListener('update_commentsCount', row.updateCommentsCountHandler);
																});
									};

		row.updateLikesCountHandler = function(e) {
										Ti.API.info('updateLikesCount');	
										var post = row.post;
										// update post then the likesCount in row from the new post values
										acs.showPost(post.id, function (updatedPost) {
																	updateLikesCount(row, updatedPost);
																	row.removeEventListener('update_likesCount', row.updateLikesCountHandler);
																});																				
								};
	}
	

	// display post without comments details
	/*
	 * displayPostSummaryView
	 */
	function displayPostSummaryView (post) {
		var row = createPostView(post),
			ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			tabGroup;
		
		Ti.API.info('display post summary: adding a row to the feedWindow ');
		populatePostView(row, false);
		setPostViewEventHandlers (row);
		
		return row;
	}



	exports.createPostView = createPostView;
	exports.populatePostView = populatePostView;
	exports.setPostViewEventHandlers = setPostViewEventHandlers;
	exports.displayPostSummaryView = displayPostSummaryView;
	
} ());