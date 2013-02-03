/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';

	var Cloud = require('ti.cloud');

/*
 * 

function callback(data) {
  if(data) {
    if(data.meta) {
      var meta = data.meta;
      if(meta.status == 'ok' && meta.code == 200 && meta.method_name == 'createLike') {
        var likes = data.response.likes;
        ...
      }
    }
  }
}
 * 
 */			
	// Likes
	function createLike(savedPostId, callback) {
		/*
		var deployType = Ti.App.getDeployType(),
			sdk = (deployType == 'production')? new Cocoafish('awbsrluLqnzmYOZPoevSb4x4cyUvSmHk') : new Cocoafish('VtBOemkWS2i8oF8ky5Zw72RlLnRaRRov'),  // app key
			data = {
					  post_id: savedPostId
					};
		sdk.sendRequest('likes/create.json', 'POST', data, callback);
		*/
		Ti.API.info("Likes are not supported yet!")
	}	

/*
function callback(data) {
  if(data) {
    if(data.meta) {
      var meta = data.meta;
      if(meta.status == 'ok' && meta.code == 200 && meta.method_name == 'deleteLike') {
        alert("Like deleted!");
      }
    }
  }
}	
*/
	
	function deleteLike(savedPostId, callback) {
		var deployType = Ti.App.getDeployType();
			sdk = (deployType == 'production')? new Cocoafish('awbsrluLqnzmYOZPoevSb4x4cyUvSmHk') : new Cocoafish('VtBOemkWS2i8oF8ky5Zw72RlLnRaRRov'),  // app key
			data = {
					  post_id: savedPostId
					};
		sdk.sendRequest('likes/delete.json', 'DELETE', data, callback);
	}	
	
	exports.createLike = createLike;
	exports.deleteLike = deleteLike;
} ());
