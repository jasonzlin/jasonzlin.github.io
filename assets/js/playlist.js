$(document).ready(function () {

    var spotify_token = localStorage.getItem('spotify_token');

    if(localStorage.getItem('spotify_token')){
        setSpotifyDetails(spotify_token);
    }

	$('#submitButton').attr('disabled', true);
    $('.spotify-login-button').click(function(){
        handleSpotifyConnect();
    });

    $('.spotify-logout-button').click(function(){
        localStorage.removeItem('spotify_token');
        $('.spotify-login-form').removeClass('hidden');
        $('.spotify-details').addClass('hidden').children()[0].remove();
    });

    function handleSpotifyConnect(){
        var SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize',
            SPOTIFY_CLIENT_ID = 'f6b4b574524748fda00a6abdde7682ca',
            SPOTIFY_REDIRECT_URL = 'https://jasonzlin.github.io/callback_spotify.html',
            SPOTIFY_RESPONSE_TYPE = 'token';

        var authURL =
            SPOTIFY_AUTH_URL + "?client_id=" +
            SPOTIFY_CLIENT_ID + "&redirect_uri=" +
            encodeURIComponent(SPOTIFY_REDIRECT_URL) + "" +
            "&response_type=" + SPOTIFY_RESPONSE_TYPE;

        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);

        var w = window.open(
            authURL,
            'Spotify',
            'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
        );

        window.addEventListener("message", function(event) {
            var hash = JSON.parse(event.data);
            if (hash.type == 'access_token_spotify') {
                callback(hash.access_token);
            }
        }, false);

        var callback = function(token){
            localStorage.setItem('spotify_token',token);
            setSpotifyDetails(token);
        };
    }

    function setSpotifyDetails(token){
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response){
                var username = response.id;
				var loginForm = document.getElementById('mainlogin');
				var mainView = document.getElementById('mainContent');
				
                loginForm.style.display = 'none';
				main.style.display = 'block';
				console.log('test');
                },
            error: function(){
                // handle error
            }
        });
    }
});




// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = 'spotify-155321';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

// Upon loading, the Google APIs JS client automatically invokes this callback.
googleApiClientReady = function() {
	gapi.client.init({
    'apiKey': 'AIzaSyDhFKCXCBGKWl0CsZcWBA-qj_6rMOxG6h8',
    // clientId and scope are optional if auth is not required.
  }).then(loadClient);
   
// 1. Load the JavaScript client library.
//gapi.load('client', start);
}

function loadClient() {
	gapi.client.load('youtube', 'v3', function() {
                        handleAPILoaded();
                });
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  $('#submitButton').attr('disabled', false);
}


//global variables
var user_id;
var playlistID;
var accessToken;
var constraint = 0;
var trackList = [];
var searchList = [];
var sum = 0;
var total = 0;

//helper method to get access token
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.hash.substr(1).split('&'));

//button clicked method, attempts to search for youtube playlist
function search() {	
	searchYoutube(null);
}

//Login button clicked
function loginWithSpotify() {
    var client_id = 'f6b4b574524748fda00a6abdde7682ca';
    var redirect_uri = 'https://jasonzlin.github.io/';
    var scopes = 'playlist-modify-private';

    if (document.location.hostname == 'localhost') {
        redirect_uri = 'http://localhost:8080/playlist/popup.html';
    }

    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri) +
		'&show_dialog=true';
    document.location = url;
	
}

var testCounter = 0;

// attempts to search spotify for tracks from youtube playlist
function searchSpotify(trackList, index, constraint) {
	
	var namesElement = document.getElementById('names');
	var title = trackList[index].snippet.title;
	if(window.location.hash) {
		accessToken = qs["access_token"];
		var formattedTitle = title.replace(/[^A-Z0-9']+/ig, " ").toLowerCase();
		
		var hasMV = formattedTitle.indexOf('music video');
		
		if(hasMV > -1) {
				formattedTitle = formattedTitle.substring(0, hasMV) + formattedTitle.substring(hasMV + 'music video'.length);
		} else {
			hasMV = formattedTitle.indexOf('mv');
			if(hasMV > -1) {				
				formattedTitle = formattedTitle.substring(0, hasMV) + formattedTitle.substring(hasMV + 2);
			}
			hasMV = formattedTitle.indexOf('m v');
			if(hasMV > -1) {
				formattedTitle = formattedTitle.substring(0, hasMV) + formattedTitle.substring(hasMV + 3);
			}
			
		}
				
		$.ajax({
			url: 'https://api.spotify.com/v1/search?q=' + formattedTitle + "&type=track",
			success: function(response) {
				
				index++;
				var found = response;
				var result = found.tracks.items[0];
				if(result != null) {
					var title = result.name;
					var artist = result.artists;
					var liElement = document.createElement('li');
					liElement.innerText = artist[0].name + ' - ' + title;
					namesElement.appendChild(liElement);
					searchList.push(result.uri);
					console.log("found " + formattedTitle);
					testCounter++;
					console.log(testCounter);
				}  else if(constraint == 1){
					console.log("Could not find " + formattedTitle);
					index--;
					var name = trackList[index].snippet.title;
					constraint = 0;
					trackList[index].snippet.title = formattedTitle.substring(0, formattedTitle.length / 2);
				} else {
					constraint = 1;
				}
				
				if(index >= total) {
					createPlaylist();
				} else {		
					searchSpotify(trackList, index, constraint);
				}
			},
			error: function(response) {
				var error = response;
				
				console.log(error);
			}
		});
	}
	
}

//attempts to create playlist
function createPlaylist() {
	
	accessToken = qs["access_token"];
	
	$.ajax({
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
			var user = response;		
			user_id = user.id;
				
			var testData = { 'name' : "New Playlist"};
				
			$.ajax({
				url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
				type: 'POST',
				headers: {
					'Authorization': 'Bearer ' + accessToken,
					'Content-Type': 'application/json'
				},
				data: JSON.stringify(testData),
				success: function(response) {
					console.log("Created playlist");
					playlistID = response.id;
					addToPlaylist(searchList);
				},
				error: function(response) {
					var error = response;
					console.log(error);
				}
			});
		}, 
		error: function(response) {
			var error = response;
			console.log(error);
		}
	});
}

//last step of adding all spotify tracks to the playlist
function addToPlaylist(test) {
	
	var i,j,temparray,chunk = 100;
	for (i=0,j = test.length; i<j; i+=chunk) {
		temparray = test.slice(i,i+chunk);
		var jsonObject = {'uris' : temparray};
		console.log("Attempting to add to playlist");
	
		$.ajax({
			url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlistID + '/tracks',
			headers: {
				'Authorization': 'Bearer ' + accessToken,
				'Content-Type': 'application/json'
			},
			type: 'POST',
			data: JSON.stringify(jsonObject),
			success: function(response) {
				var added = response;
				console.log(added);
				//display success
			}, error: function(response) {
				var error = response;
				console.log(error);
			}
		});
	
	}
	
	constraint++;
	
}
	
//search youtube for playlist and returns the whole playlist.
function searchYoutube(PageToken) {
	
	var test = 'test';
	var q = $('#inputBox').val();

	var request = gapi.client.youtube.playlistItems.list({
        part: 'snippet',
        playlistId: q,
		maxResults: 50,
		pageToken : PageToken
        });

		request.execute(function(response) {
			var jsonObject = response.result;
			
			if(jsonObject != null) {
				total = response.pageInfo.totalResults;
				sum += jsonObject.items.length;
				trackList = trackList.concat(jsonObject.items);
				console.log(jsonObject.items);
				if(sum < total) 
					searchYoutube(response.result.nextPageToken);
				else 
					searchSpotify(trackList, 0, 1);
			
			}
		});
}



