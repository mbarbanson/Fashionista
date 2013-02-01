/**
 * @author MONIQUE BARBANSON
 * Copyright 2012 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	
	// Reviews aka Comments
	function createReview(savedPostId, contentText) {
		Cloud.Reviews.create({
		    post_id: savedPostId,
		    rating: 1,
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
		    } else {
		        Ti.API.info('Error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		});		
	}	
	
	exports.createReview = createReview;
})
