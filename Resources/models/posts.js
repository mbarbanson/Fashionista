/**
 * Define model objects for Posts
 * Copyright 2013 by Monique Barbanson
 * @author MONIQUE BARBANSON
 */


(function () {
	'use strict';
	
	//constructor
	function createPostModel (user, photoBlob) {		
		return {user: user, photo: photoBlob, tags:[]}; 
	
	}
	
	function parseCaptionAndTags(postModel, captionStr)	{
		var startTags = captionStr.indexOf('#');
	}


	exports.createPostModel = createPostModel;

} ());

