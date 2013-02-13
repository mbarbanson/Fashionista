/*
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	var acs = require('/lib/acs');
	
	function createCommentRow(comment) {
		var	commenter = comment.user.username,
			row = Ti.UI.createTableViewRow({
					    className:'fashionistaComment', // used to improve table performance
						color: 'black',
						backgroundColor: 'white',
						selectedBackgroundColor:'white',
					    width:Ti.UI.SIZE,
					    height: Ti.UI.SIZE,
					    borderColor: 'white'
					}),

			label = Ti.UI.createLabel({
						text: commenter + ': ' + comment.content,
						textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
						left: 5,
						height: Ti.UI.SIZE,
						width: Ti.UI.SIZE	
					});
			//row.add(commenter);
			row.add(label);						
		return row;		
	}
	
	
	function displayComment(tableView, comment) {
		var row = createCommentRow(comment);			
		tableView.appendRow(row);						
	}
	
	
	function addNewComment(tableView, comment) {
		var row = createCommentRow(comment);			
		tableView.appendRow(row);			
		
	}
	
	
	function createCommentsView (tableView, comments) {
		var length = comments.length,
			i;
		for (i = 0; i < length; i = i + 1) {
			displayComment(tableView, comments[i]);						
		}
	}
	
	
	exports.createCommentsView = createCommentsView;
	exports.addNewComment = addNewComment;
	
	
} ())