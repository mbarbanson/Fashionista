/**
 * copyright 2012 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 * Detail window for photos
 * 
 */

(function () {
	'use strict';
	
	
	function createDetailWindow(tab) {
		var detailWindow = Ti.UI.createWindow({
							title: "Comments",
					        backgroundColor: 'white',
							barColor: '#5D3879',
							tabBarHidden: true
							});
		detailWindow.containingTab = tab;
		return detailWindow;		
	}
	

	// display list of comments for post
	function showPostComments(containingTab, tableView, post, newComment, comments) {
		Ti.API.info("showPostComments");
		var CommentsView = require('ui/common/CommentsView'),
			PostView = require('ui/common/PostView'),
			row;
		if (tableView) {
			tableView.displayComments = true; 
			row = PostView.createPostView (post);
			PostView.setPostViewEventHandlers (row);
			PostView.populatePostView(containingTab, row, true);
			tableView.appendRow(row);
			CommentsView.createCommentsView(row, comments);
			if (newComment) {
				CommentsView.inputComment(row);
			}			
		}
	}
	
	
	

	exports.showPostComments = showPostComments;
	exports.createDetailWindow = createDetailWindow;


} ());
