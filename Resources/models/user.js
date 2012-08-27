/*
 * 
 {
  "meta": {
    "stat":"ok",
    "code":200,
    "method":"createUser"
  },
  "response": {
    "users": [
      {
        "id":"4d6e77386f70950c89000001",
        "first_name":"John",
        "last_name":"Smith",
        "role": "teacher",
        "created_at":"2011-03-02T16:58:32+0000",
        "updated_at":"2011-03-02T16:58:32+0000",
        "facebook_authorized":false,
        "email":"john.smith@company.com",
        "photo": {
          "id":"4d882896d0afbe0a3600000d",
          "filename":"photo.jpg",
          "size":584344,
          "md5":"589b8ad43ed20bf8e622d719642bc939",
          "created_at":"2011-03-22T04:41:58+0000",
          "updated_at":"2011-03-22T04:42:07+0000",
          "processed":false
        },
        "custom_fields": {
          "follows": {},
          "followers": {},
          "photocollections": {},
          "favorites": {},
          "comments": {},
          "tags": {},
          "posts": {}
        }
      }
    ]
  }     
}
 */
// User 0 = Fashionista editor's picks
// User 1 = Archer
// a couple local variables to save state
var currentUser = null;
var loggedIn = false;
var Cloud = require('ti.cloud');

exports.isLoggedIn = function() {
	return loggedIn;
};

exports.setIsLoggedIn = function(val) {
	loggedIn = val;
};

exports.currentUser = function() {
	return currentUser;
}

exports.createUser = function(username, firstName, lastName, password, photo, callback) {
	// ACS API requires password & confirm, but we do the checking elsewhere so use the same for both here
	Cloud.Users.create({
		username: username,
		first_name: firstName,
		last_name: lastName,
		password: password,
		password_confirmation: password,
		photo: photo
	}, function (e) {
	    if (e.success) {
	        Ti.API.info('user = ' + JSON.stringify(e.users[0]))
	        currentUser = e.users[0];
	        initFashionistaUser(currentUser);
	        loggedIn = true;
	        callback(currentUser);
	    } else {
	    	Ti.API.info('Error create User failed' + JSON.stringify(e));
	    	loggedIn = false;
	    	currentUser = null;
	    	callback(false);
	    }
	});
};

// TODO: create a profile collection for user pics
function createPhotoCollectionForCurrentUser () {
			name: currentUser.username, 
			function (e) {
			    if (e.success) {
			        var collection = e.collections[0];
			        alert('Success:\\n' +
			            'id: ' + collection.id + '\\n' +
			            'name: ' + collection.name + '\\n' +
			            'count: ' + collection.counts.total_photos + '\\n' +
			            'updated_at: ' + collection.updated_at);
			    } else {
			        alert('Error: silentLogin failed \\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
			    }
};


function initFashionistaUser () {
    // app specific fields should be initialized here    
    acsUser.custom_fields = {
    	follows: [acsUser.id],
    	followers: [acsUser.id],
    	photoCollection: {}
	};
}

exports.login = function(username, password, callback) {
	Cloud.Users.login({
	    login: username,
	    password: password
	}, function (e) {
	    if (e.success) {
	    	currentUser = e.users[0];
	    	loggedIn = true;
	    	Ti.App.Properties.setString('currentFashionista', username);
			Ti.App.Properties.setString('fashionistaPassword', password);
			callback(loggedIn);
	    } else {
	        Ti.API.info('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
	        loggedIn = false;
	        currentUser = null;
			callback(loggedIn);
	    }
	});	
};


exports.logout = function() {
	Cloud.Users.logout(function (e) {
	    if (e.success) {
	        currentUser = null;
	        loggedIn = false;
	    }
	});		
};


