var LastFM = LastFM || {};
LastFM.Track = new Class({
	
	data: null,
	
	initialize: function(lastfm, track){
		this.lastfm = lastfm;
		this.storage = new LocalStorage();
		this.track = track;
		
		this.fetchData();
	},
	
	fetchData: function(){
		var token = this.getToken(),
			data;
		this.data = this.storage.get(token);
		
		if (this.data === null){
			data = this.lastfm.trackGetInfo(this.track.artist['#text'], this.track.name);
			
			// format data
			this.data = {
				'artist': data.artist,
				'image': null,
				'title': data.name,
				'url': data.url,
				'loved': (data.userloved === "true")
			};
			
			// has music brain id?
			if (data.mbid.length > 0){
				this.data = data.mbid;
			}
			
			// try for image
			try {
				this.data.image = data.album.image[0]['#text'];
			} catch (x){}
			
			this.storage.set(token, this.data);
		}
		
		// merge now playing into track data
		this.data.nowplaying = false;
		try {
			if (typeOf(this.track['@attr'].nowplaying) !== null && this.track['@attr'].nowplaying == "true"){
				this.data.nowplaying = true;
			}
		} catch (x){}
		
		console.log('track', this.track, 'data', data, 'result', this.data);
	},
	
	getToken: function(){
		if (typeOf(this.track.mbid) !== 'null' && this.track.mbid.length > 0){
			return this.track.mbid;
		}
		
		return (this.track.artist['#text'] + this.track.name).toMD5();
	},
	
	love: function(){
		chrome.extension.sendRequest(['love', this.data], function(success){
			if (success === true){
				this.data.loved = true;
				this.storage.set(this.getToken(), this.data);
			}
		}.bind(this));
	},
	
	unlove: function(){
		chrome.extension.sendRequest(['unlove', this.data], function(success){
			if (success === true){
				this.data.loved = false;
				this.storage.set(this.getToken(), this.data);
			}
		}.bind(this));
	}
});