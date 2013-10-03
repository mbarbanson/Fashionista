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
					        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
					        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT],			
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
			// full list of comments is needed to notify other commenters when a comment is added
			row.comments = comments;
			PostView.setPostViewEventHandlers (row);
			success = PostView.populatePostView(containingTab, row, true);
			if (success) {
				CommentsView.createCommentsView(row, comments);
				if (newComment) {
					CommentsView.inputComment(row);
				}
				tableView.appendRow(row);				
			}			
		}
	}
	
	
	

	exports.showPostComments = showPostComments;
	exports.createDetailWindow = createDetailWindow;


} ());
