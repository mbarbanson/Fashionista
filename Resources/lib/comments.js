/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';

	var Cloud = require('ti.cloud');


	// cache comments list directly in the post and set the acl to public
	// only cache up to three comments
	function updateCachedCommentsForPost(savedPostId, comments, updateACL, successCallback, errorCallback) {
		var maxIndex = Math.min(Ti.App.maxNumCachedComments, comments.length),
			params = {
			post_id: savedPostId,
			custom_fields: {'comments': comments.slice(0, maxIndex)}
				};
		if (updateACL) {
			params.acl_name = Ti.Locale.getString('publicPostACLName');
		}
		Cloud.Posts.update(params, 
		function (e) {
			if (e.success) {
				if (successCallback) {
					Ti.API.info("updateCachedCommentsForPost success ");
					successCallback(e);
				}		
			}
			else {
		        Ti.API.error('Cloud.Posts.update error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));	
	            if (errorCallback) {
					errorCallback(e);
	            }			
			}
		});
	}
	
			
	// Reviews aka Comments
	function createComment(post, contentText, createCommentCallback, updatePostCallback) {
		var savedPostId = post && post.id,
			custom_fields = (post && post.custom_fields) || {},
			comments = (custom_fields && custom_fields.comments) || [];
		if (savedPostId) {
			Cloud.Reviews.create({
			    post_id: savedPostId,
			    content: contentText,
			    allow_duplicate: 1
			}, function (e) {
			    if (e.success) {
			        var review = e.reviews[0],
						numComments = comments.length;
			        if (numComments < Ti.App.maxNumCachedComments) {
				        comments.push(review);
				        // update local cached comments
				        custom_fields.comments = comments;
				        post.custom_fields = custom_fields;
			            // update cached comments in the cloud
						updateCachedCommentsForPost(savedPostId, comments, false,
							function(e) {
								Ti.API.info("Updated cached comments for post " + post.content);
								if (updatePostCallback) {
									updatePostCallback(e.posts[0]);
								}
							},
							function(e){ Ti.API.error("Update cached comments for post failed " + ((e.error && e.message) || JSON.stringify(e)));});
					}
			        Ti.API.info('createComment success:\\n' +
			            'user: ' + review.user + '\\n' +
			            'rating: ' + review.rating + '\\n' +
			            'content: ' + review.content + '\\n' +
			            'updated_at: ' + review.updated_at);
		            
		            if (createCommentCallback) {
						createCommentCallback(review);
						}
			    } else {
			        Ti.API.error('createComment error:\\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
			    }
			});					
		}
	}	
	
	
//where={"rating":{"$ne":1}}	
	function getPostComments (post, callback, getAllComments) {
		var postId = post && post.id,
			acs = require('lib/acs'),
			currentUser = acs.currentUser(),
			currentUserId = acs.currentUserId(),		
			custom_fields = post && post.custom_fields,
			cachedComments = custom_fields && custom_fields.comments,
			postACL = post.acls;
		if (postId && (!cachedComments || getAllComments)) {
			Cloud.Reviews.query({
				post_id: postId,
				where: {"rating": {"$ne" : 1}},
			    order: 'created_at',
			    page: 1,
			    per_page: 20
			}, function (e) {
			    if (e.success) {
					var numReviews = e.reviews.length;
			        Ti.API.info('Success getPostComments:\\n' +
			            'Count: ' + numReviews);
					if (currentUser.admin === "true" || (post.user && post.user.id === currentUserId)) {
						// cache comments list in post in the cloud and update ACL
						updateCachedCommentsForPost(postId, e.reviews, true,
							function(e){ Ti.API.info("Updated cached comments for post " + post.content);},
							function(e){ Ti.API.error("Update cached comments for post failed " + ((e.error && e.message) || JSON.stringify(e)));});
					}
			        if (callback) {
						callback(e.reviews);
					}
					
			    } else {
			        Ti.API.error('Reviews query Error:\\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
			    }
			});								
		}
		else if (cachedComments) {
			// temporary. remove this code once all posts from the dev database have been updated
			if (!postACL && (currentUser.admin === "true" || (post.user && post.user.id === currentUserId))) {
				updateCachedCommentsForPost(postId, cachedComments, true,
					function(e){ Ti.API.info("Updated cached comments and ACL for post " + post.content);},
					function(e){ Ti.API.error("Update cached comments for post failed " + ((e.error && e.message) || JSON.stringify(e)));});
				
			}
			callback(cachedComments);
		}
	}
	
	exports.createComment = createComment;
	exports.getPostComments = getPostComments;
} ());
