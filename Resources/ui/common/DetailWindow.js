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
	

	// display detail view of post including picture and list of comments for post
	function showPostComments(containingTab, tableView, originRow, newComment, comments) {
		Ti.API.info("showPostComments");
		var CommentsView = require('ui/common/CommentsView'),
			PostView = require('ui/common/PostView'),
			post = originRow.post,
			row, success = false;
		if (tableView) {
			tableView.displayComments = true; 
			row = PostView.createPostView (post);
			row.originRow = originRow;
			PostView.setPostViewEventHandlers (row);
			success = PostView.populatePostView(containingTab, row, true);
			if (success) {
				tableView.appendRow(row);
				CommentsView.createCommentsView(row, comments);
				if (newComment) {
					CommentsView.inputComment(row);
				}				
			}			
		}
	}
	
	
	

	exports.showPostComments = showPostComments;
	exports.createDetailWindow = createDetailWindow;


} ());
