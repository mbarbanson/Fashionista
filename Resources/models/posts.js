/*
 * Define model objects for Posts
 * Copyright 2013 by Monique Barbanson
 * @author MONIQUE BARBANSON
 */



	
//constructor
function PostModel(user, photoBlob) {
	'use strict';
	var setCaption = function (caption) {
		this.caption = caption;
	};
	
	return {user: user, photo: photoBlob}; 

}

module.exports = PostModel;

