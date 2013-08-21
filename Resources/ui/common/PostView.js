/**
 * copyright 2012-2013 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 * Detail window for photos
 * 
 */


(function () {
	'use strict';
	
	var singleLineHeight = 20,
		maxCharsPerLine = 45; // bogus, but use this for quick and dirty layout

// Like a post
	function likePost(row) {
		var post,
			likeBtn = row.likeBtn,
			social = require('lib/social'),
			Likes = require('lib/likes'),		
			createLikeCallback;
		if (row && row.post) {
			post = row.post;
			Ti.API.info("You liked a post: " + post.content);
			// put code here to change the color of the like icon
			//likeBtn.backgroundColor = '#5D3879';
			likeBtn.image = '/icons/purple_heart.png';
			likeBtn.setEnabled(false);			
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
		// force the proxy to update the underlying native object
		row.commentsCount = commentsCount;	
	}
	
	
// Flag	
	function flagPost(row) {
		var Flurry = require('sg.flurry'),
			post = row.post;
		Flurry.logEvent('flaggedPostAsInappropriate');		
		alert("Flagged post as inappropriate" + post.content);
	}
	
//Find
	function findSource(containingTab, row) {
		var post = row.post,
			baseUrl = "https://www.google.com/searchbyimage?image_url=",
			imageUrl = row.photo.slice(7),
			suffix = "&btnG=Search+by+image",
			webview = Titanium.UI.createWebView({url:baseUrl + imageUrl}),
			window = Titanium.UI.createWindow(),
			Flurry = require('sg.flurry');
		Flurry.logEvent('priceTagBtnClicked');
	    window.add(webview);
	    window.containingTab = containingTab;
	    containingTab.open(window);
	}	
	
	


	/*
	 *	createPostView
	 */
	//FIXME BEWARE!!!! Functions should avoid creating long lived closures that point to a post (ie for an event listener)
	// since posts can be updated after they are liked or commented on. Access a post through its row instead for this
	// at some point we should fix this by updating the local comments_count and ratings_count so we never have stale posts pointers
	function createPostView (post) {
		var row = Ti.UI.createTableViewRow({
				    className:'fashionistPost', // used to improve table performance
					color: 'black',
					selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
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
	 * displayPostDetailsView. Do not use this directly in a long lived closure!!! post objects are mutable!!!!!
	 */
	function displayPostDetailsFeedView (containingTab, post, newComment) {
		Ti.API.info('show post details');
		var DetailWindow = require('ui/common/DetailWindow'),
			detailWindow = DetailWindow.createDetailWindow(containingTab),
			ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			CommentsView = require('ui/common/CommentsView'); 
		if (containingTab) {
			containingTab.open(detailWindow);
		}
		else {
			Ti.API.error("displayPostDetails: currentTab is null");
		}
		CommentsView.createPostCommentsTable(detailWindow, post, newComment);
		return;	
	}
	
	
	
	function displayPostDetailsView (containingTab, post, newComment) {
		Ti.API.info('show post details');
		var FeedWindow = require('ui/common/FeedWindow');
		displayPostDetailsFeedView(containingTab, post, newComment);	
	}	


	/*
	 * displayRowDetails
	 */
	function displayRowDetails (containingTab, row, newComment) {
		Ti.API.info('show row details');
		displayPostDetailsView(containingTab, row.post, newComment);		
	}

		
	/*
	 * populatePostView
	 */
	function populatePostView (containingTab, row, displayComments, photoBlob) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			MoreActionDialog = require('/ui/common/moreActionDialog'),
			CommentsView = require('ui/common/CommentsView'),
			ProfileView = require('ui/common/ProfileView'),
			Facebook = require('lib/facebook'),
			IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/',
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),		
			author = row.post.user,
			currentUser = acs.currentUser(),
			facebookUID,
			avatarView, 
			avatarImg = IMG_BASE + 'custom_tableview/user.png',
			labelUserName,
			labelDetails,
			imgView,
			post = row.post, 
			photoUrls = post.photo && post.photo.urls,
			img, clickHandler,
			imgW,
			imgH,
			postW, postH, postL, postT,
			labelDate,
			createdAtDate,
			findBtn,
			likeBtn,
			commentBtn,
			moreBtn,
			likeIcon, likesCount,
			commentIcon, commentsCount;

			if (currentUser.id === author.id) {
				author = currentUser;
			}

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
						Flurry.logEvent('noPhotoInPost', {'caption': post.content});
						Ti.API.info("no photo in post!");
						return false;
					}
				}
				else {
					img = photoBlob;
					imgW = photoBlob.width;
					imgH = photoBlob.height;
				}
	
				// images are square. make them fit
				// first row
				imgView = Ti.UI.createImageView({
								image: img,						
								width:Ti.UI.SIZE, 
								height:Ti.UI.SIZE
								});
				row.add(imgView);
				row.photo = img;
				row.imgView = imgView;

				clickHandler = function (e) {
									likePost(row);
								};
				imgView.addEventListener('dblclick', clickHandler);

			}

			//second row
			facebookUID = Facebook.getLinkedFBId(author);
			
			if (author.photo && author.photo.processed) {
				avatarImg = author.photo.urls.small_240;				
			}				
			else if (facebookUID) {
				avatarImg = 'https://graph.facebook.com/' + facebookUID + '/picture';	
			}
							 
			avatarView = Ti.UI.createImageView({
							image: avatarImg,
							left: 5, top:5,
							width:30, height:30
							});
			row.add(avatarView);
								
								
			labelUserName = Ti.UI.createButton({
								color: '#576996',
								backgroundColor: 'white',
								style: 'Titanium.UI.iPhone.SystemButtonStyle.PLAIN',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'bold'},
								ellipsize: false,
								title: author.username,
								left: 40, top: -30,
								width:90, height: 20
								});
			labelUserName.addEventListener('click', function (e) {
														ProfileView.displayUserProfile(containingTab, author);
														});									
			row.add(labelUserName);
			
			if (!displayComments) {

				findBtn = Ti.UI.createButton({
									image: '/icons/172-pricetag.png',
									//title: Ti.Locale.getString('find'),
									//color: 'white',
									backgroundColor: '#5D3879',
									style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
									left: 150, top:-20,
									width:30,
									height: 30
									});
				row.add(findBtn);
								
				likeBtn = Ti.UI.createButton({
									image: '/icons/light_heart.png',
									style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,								
									left: 200, top:-30,
									width:30,
									height: 30
									});
				row.add(likeBtn);
				
				row.likeBtn = likeBtn;
				
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
				
				findBtn.addEventListener('click', function(e) { findSource(containingTab, row);});
				likeBtn.addEventListener('click', function(e) { likePost(row);});
				
				moreBtn.addEventListener('click', function(e) {
														Flurry.logEvent('moreBtnClicked'); 
														MoreActionDialog.createMoreDialog(containingTab, row.post, imgView);
													});
	
				commentBtn.addEventListener('click', 
											function(e) {
													Flurry.logEvent('commentBtnClicked');
													if (!displayComments) {
														displayRowDetails(containingTab, row, true);
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
			// tumblr is not showing the date. let's not show it until we have better formatting
			//row.add(labelDate);
				
						
			// photo caption
			labelDetails = Ti.UI.createLabel({
								color:'#222',
								autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: (post.content === Ti.Locale.getString('nocaption') ? '' : unescape(post.content)),
								wordWrap : true,
								horizontalWrap : true,
								ellipsize: true,															
								left:5, top: 10,
								width:Ti.UI.FILL,
								height: 20
								});
			labelDetails.height = singleLineHeight * (labelDetails.text.length / maxCharsPerLine + 1);
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
				commentsCount.addEventListener('click', function (e) {displayRowDetails(containingTab, row, true);});	
			}
	
			return true;
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
	function displayPostSummaryView (containingTab, post) {
		var row = createPostView(post), success = false;
		
		Ti.API.info('display post summary: create and populate a row from current post ');
		success = populatePostView(containingTab, row, false);
		if (success) {
			setPostViewEventHandlers (row);			
			return row;			
		}
		else {
			return null;
		}
	}



	exports.createPostView = createPostView;
	exports.populatePostView = populatePostView;
	exports.setPostViewEventHandlers = setPostViewEventHandlers;
	exports.displayPostSummaryView = displayPostSummaryView;
	exports.displayPostDetailsView = displayPostDetailsView;
	exports.displayPostDetailsFeedView = displayPostDetailsFeedView;
	exports.likePost = likePost;
	exports.findSource = findSource;
	
} ());