// copyright 2012 by Monique Barbanson. All rights reserved.
//
// Detail window for photos

(function () {
	'use strict';


	function showPreview (thumbView) {
		var imgView = null,
			detailWindow = Ti.UI.createWindow({
							        backgroundColor: 'black',
							        barColor: 'black'
							});
		if (!detailWindow) {
			imgView = Ti.UI.createImageView({
				title: 'Post Detail',
				backgroundColor: 'black',
				width: Ti.UI.FILL,
				height: Ti.UI.FILL
			});
			detailWindow.imgView = imgView;
			detailWindow.add(imgView);
		}
		imgView = detailWindow.imgView;
		// use small_240 if present, otherwise use the thumbnail itself or fallback image if neither has a value
		imgView.image = thumbView.urls? thumbView.urls.small_240 : (thumbView.image || '/photos/IMG_0001.JPG');
		imgView.show();
		
		return detailWindow;
	}
	
	function createDetailWindow(title) {
		var detailWindow = Ti.UI.createWindow({
							title: 'Comment on ' + title + "'s Photo",
					        backgroundColor: 'white',
							barColor: '#5D3879'	
						});
		return detailWindow;		
	}
	
	
	function showPostDetails (win, post, photoBlob) {
		var tableView = Ti.UI.createTableView({
								objname: 'PostDetails',
								backgroundColor: 'white',
								color: 'black',
								visible: true				
							}),
			tableData = [],
			row = populateRow(post, null, photoBlob);
			tableData.push(row);
			tableView.setData(tableData);		
			win.add(tableView);					
	}
	
	function likePost(row) {
		var post = row.post;
		alert("Liked post " + post.content);
	}

	
	function flagPost(row) {
		var post = row.post;		
		alert("Flag post as inappropriate" + post.content);
	}

	function populateRow(post, clickHandler, photoBlob) {
		var IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/',
			defaultFontSize = Ti.Platform.name === 'android' ? 16 : 14,
			row,
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
			likeIcon, likesDetails,
			commentIcon, commentsDetails,
			commentsTable,
			addComment;
		
			row = Ti.UI.createTableViewRow({
				    className:'fashionistaPost', // used to improve table performance
					color: 'black',
					backgroundColor: 'white',
					selectedBackgroundColor:'white',
				    width:Ti.UI.FILL,
				    height: Ti.UI.SIZE,
				    action: function (post) {if (clickHandler) {clickHandler(post);}},
				    post: post
			});  
			
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
			Ti.API.info("photo width " + imgW + "  height  " + imgH);
			postW = Math.min(Ti.App.SCREEN_WIDTH, imgW);
			postH = Math.min(Ti.App.SCREEN_WIDTH, imgH);
			Ti.API.info("post width " + postW + "  height  " + postH);
			//images are square. make them fit
			imgView = Ti.UI.createImageView({
							image: img,
							borderColor: 'black',
							borderWidth: 1,							
							left:0, top: 0,
							width:postW, 
							height: postH
							});
			row.add(imgView);
			imgView.addEventListener('click', row.action);

			imageAvatar = Ti.UI.createImageView({
							image: IMG_BASE + 'custom_tableview/user.png',
							//borderColor: 'black',
							//borderWidth: 1,
							left:0, top:postH + 5,
							width:50, height:50
							});
			row.add(imageAvatar);
  
			labelUserName = Ti.UI.createLabel({
								color:'#576996',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+6, fontWeight:'bold'},
								text: post.user.username,
								//borderColor: 'black',
								//borderWidth: 1,
								left:55, top: postH + 5,
								width:125, height: 20
								});
			row.add(labelUserName);
  
			labelDetails = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: post.content,
								//borderColor: 'black',
								//borderWidth: 1,								
								left:55, top:postH + 25,
								width:165,
								height: 30
								});
			row.add(labelDetails);

			flagBtn = Ti.UI.createButton({
								image: '/icons/dark_warn.png',
								style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
								//borderColor: 'black',
								//borderWidth: 1,								
								left:290, top:postH + 25,
								width:30,
								height: 30
								});
			row.add(flagBtn);
			flagBtn.addEventListener('click', function(e) { flagPost(row);});

			commentBtn = Ti.UI.createButton({
								image: '/icons/dark_comment.png',
								style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
								//borderColor: 'black',
								//borderWidth: 1,								
								left:255, top:postH + 25,
								width:30,
								height: 30
								});
			row.add(commentBtn);
			commentBtn.addEventListener('click', function(e) { addComment(row);});
			
			likeBtn = Ti.UI.createButton({
								image: '/icons/dark_heart.png',
								style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
								//borderColor: 'black',
								//borderWidth: 1,								
								left:220, top:postH + 25,
								width:30,
								height: 30
								});
			row.add(likeBtn);
			likeBtn.addEventListener('click', function(e) { likePost(row);});
						
			createdAtDate = post.created_at;
	
			labelDate = Ti.UI.createLabel({
							color:'#999',
							font:{fontFamily:'Arial', fontSize:defaultFontSize, fontWeight:'normal'},
							text:createdAtDate,
							//borderColor: 'black',
							//borderWidth: 1,							
							left:180, top: postH + 5,
							width:140, height:20
							});
			row.add(labelDate);

			likeIcon = Ti.UI.createImageView({
							image: '/icons/light_heart.png',
							//borderColor: 'black',
							//borderWidth: 1,
							left:10, top:postH + 60,
							width:15, height:15
							});
			row.add(likeIcon);			

			
			likesDetails = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: (post.likes_count || '0')  + ' likes',
								//borderColor: 'black',
								//borderWidth: 1,								
								left: 30, top: postH + 60,
								width: 200,
								height: 15
								});
			row.add(likesDetails);			

			commentIcon = Ti.UI.createImageView({
							image: '/icons/light_comment.png',
							//borderColor: 'black',
							//borderWidth: 1,
							left:10, top:postH + 80,
							width:15, height:15
							});
			row.add(commentIcon);			

			
			commentsDetails = Ti.UI.createLabel({
								color:'#222',
								font:{fontFamily:'Arial', fontSize:defaultFontSize+2, fontWeight:'normal'},
								text: (post.reviews_count || '0') + ' comments',
								//borderColor: 'black',
								//borderWidth: 1,								
								left: 30, top: postH + 80,
								width: 290,
								height: 15
								});
			row.add(commentsDetails);
			
			addComment = function (row) {
				var post = row.post,
					postId,
					contentText,
					button,
					Comment = require('lib/comments'),
					createComment;
				if (post) {
					Ti.API.info("Add a comment to post " + post.content);
					postId = post.id,
					contentText = Ti.UI.createTextField({
				        hintText: 'Comment...',
				        top: postH + 100, left: 30, 
				        width: 230, height: 50,
				        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
				        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
				    	});
		    		row.add(contentText);
		    		contentText.focus();
		    		
		    		button = Ti.UI.createButton({
							        title: 'Send',
							        top: postH + 100, left: 265, 
							        width: 50, height: 50
							    });
				    row.add(button);
				    createComment = function (e) {Comment.createReview(postId, contentText.value);};
				    button.addEventListener('click', createComment);
				    
		    		row.updateLayout();
					}
					else {
						Ti.API.info("addComment: post is null " + post);			
					}
				};

			
			return row;
	}

	exports.showPreview = showPreview;	
	exports.showPostDetails = showPostDetails;
	exports.createDetailWindow = createDetailWindow;
	exports.populateRow = populateRow;
}) ();
