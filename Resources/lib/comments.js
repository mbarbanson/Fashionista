/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';

	var Cloud = require('ti.cloud');
			
	// Reviews aka Comments
	function createComment(savedPostId, contentText, callback) {
		Cloud.Reviews.create({
		    post_id: savedPostId,
		    content: contentText,
		    allow_duplicate: 1
		}, function (e) {
		    if (e.success) {
		        var review = e.reviews[0];
		        Ti.API.info('Success:\\n' +
		            'id: ' + review.id + '\\n' +
		            'rating: ' + review.rating + '\\n' +
		            'content: ' + review.content + '\\n' +
		            'updated_at: ' + review.updated_at);
	            callback(review);
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		});		
	}	
	
	
	function getPostComments (postId, callback) {
		Cloud.Reviews.query({
			post_id: postId,
			where: {"$and": [{"content": {"$exists" : true}}, {"content": {"$ne" : ""}}]},   //, {"rating": {"$ne" : "1"}}
		    order: 'created_at',
		    response_json_depth: 2,			
		    page: 1,
		    per_page: 20
		}, function (e) {
		    if (e.success) {
				var numReviews = e.reviews.length;
		        Ti.API.info('Success getPostComments:\\n' +
		            'Count: ' + numReviews);
		        /*    
		        for (var i = 0; i < e.reviews.length; i++) {
		            var review = e.reviews[i];
		            Ti.API.info('id: ' + review.id + '\\n' +
		                'id: ' + review.id + '\\n' +
		                'rating: ' + review.rating + '\\n' +
		                'content: ' + review.content + '\\n' +
		                'updated_at: ' + review.updated_at);
		        }
		        */
		        callback(e.reviews);
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		});		
	}
	
	exports.createComment = createComment;
	exports.getPostComments = getPostComments;
} ());
