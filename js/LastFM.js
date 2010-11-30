const LASTFM_API_KEY = "78d639d941263ebae25a087e580b42c0";
const LASTFM_SECRET = "00417b8a6e6fa8506826d86d98bcb382";

var LastFM = new Class({
	
	initialize: function(){
		this.loggedIn = false;
		this.sessionKey;
		// init settings
		this.settings = LastFM.Settings.get();
	},
	
	login: function(){
		if (this.settings === null){
			chrome.tabs.create({
				url: 'options.html'
			});
			return;
		}
		
		if (this.loggedIn === true){
			return;
		}
		
		this.sessionKey = this.authGetMobileSession();
		this.loggedIn = true;
		console.log(this.sessionKey);
	},
	
	authGetMobileSession: function(){
		var result = this.doRequest('auth.getMobileSession', {
			'username': this.settings.username,
			'authToken': this.getAuthToken(),
			'api_key': LASTFM_API_KEY
		});
		return result.session.key;
	},
	
	userGetRecentTracks: function(){
		var result = this.doRequest('user.getRecentTracks', {
			'user': this.settings.username,
			'limit': 5,
			'api_key': LASTFM_API_KEY
		});
		
		if (typeOf(result.recenttracks.track) == 'object'){
			return [result.recenttracks.track];
		}
		
		return result.recenttracks.track;
	},
	
	trackLove: function(track, unlove){
		unlove = typeOf(unlove) && unlove || false;
		console.log((unlove === true ? 'un' : '') + 'loving', track.title, 'by', track.artist.name);
		var result = this.doRequest((unlove === true ? 'track.unlove' : 'track.love'), {
			'track': track.title,
			'artist': track.artist.name,
			'api_key': LASTFM_API_KEY,
			'sk': this.sessionKey
		}, 'POST');
		
		return (result.status == 'ok')
	},
	
	trackUnlove: function(track){
		return this.trackLove(track, true);
	},
	
	trackGetInfo: function(artist, track){
		console.log('track.getinfo for', artist, '-', track);
		var result = this.doRequest('track.getInfo', {
			'artist': artist,
			'track': track,
			'username': this.settings.username,
			'api_key': LASTFM_API_KEY
		});
		
		return result.track;
	},
	
	getAuthToken: function(){
		var sig =  this.settings.username + this.settings.password.toMD5();
		return sig.toMD5();
	},
	
	doRequest: function(method, params, httpmethod){
		params = params || {}
		console.log('request:', method, Object.toQueryString(params))
		
		// include method
		params['method'] = method;
		// sign request
		params = this.signRequestParams(params);
		// request format JSON
		params['format'] = 'json';
		
		httpmethod = httpmethod || 'GET';
		
		var request = new Request.JSON({
				'url': 'http://ws.audioscrobbler.com/2.0/',
				'method': httpmethod,
				'async': false,
				'onFailure': function(){
					throw('request failed for ' + method);
				},
				'onComplete': function(response){
					result = response;
				}
			}),
			result;
		
		// do request
		request.send(Object.toQueryString(params));
		// return result
		return result;
	},
	
	signRequestParams: function(params){
		var signature = "";
		Object.keys(params).sort().each(function(key){
			signature += key + params[key];
		});
		
		signature += LASTFM_SECRET;
		params['api_sig'] = signature.toMD5();
		return params;
	}
});