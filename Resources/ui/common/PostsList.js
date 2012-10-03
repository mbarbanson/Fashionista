//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images

var ThumbnailGrid = function() {
	var acs = require('lib/acs');	
	
	var table = Ti.UI.createTableView({
		objname: 'ThumbnailGrid'
	});

	var tableData = [];

	for (var i = 0; i < 5; i = i + 1) {
		
		var row = Ti.UI.createTableViewRow({
	        className:'row', // used to improve table performance
	        selectedBackgroundColor:'transparent',
	        rowIndex:i, // custom property, useful for determining the row during events
	        height:105,
	        top: 105*i
	      });
	     
	    for (var col = 0; col < 4; col = col + 1) {  
			var imgView = Ti.UI.createImageView({
				image:'/images/IMG_0001.jpg',
				height:100,
				width:100,
				left: 5 + 105*col
				});
			imgView.addEventListener('click', function() {
				//var DetailWindow = require('ui/common/DetailWindow');
				//var detailWindow = new DetailWindow();
				alert("Go to detail window");
			});
			row.add(imgView);
		}
		
		tableData.push(row);
	}
	
	table.setData(tableData);
	
	return table;
};

module.exports = ThumbnailGrid;