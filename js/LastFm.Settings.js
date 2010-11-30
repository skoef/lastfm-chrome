var LastFM = LastFM || {};
LastFM.Settings = {}

const LASTFM_SETTINGS = '__settings';

LastFM.Settings.all = ['username', 'password'];

LastFM.Settings.get = function(){
	var storage = new LocalStorage();
	return storage.get(LASTFM_SETTINGS);
};

LastFM.Settings.restore = function(){
	var settings = LastFM.Settings.get() || {};
	Array.each(LastFM.Settings.all, function(field){
		if (settings[field] === null || !$(field)){
			return;
		}
		
		$(field).set('value', settings[field]);
	});
};

LastFM.Settings.store = function(settings){
	var settings = {},
		storage = new LocalStorage();
		
	Array.each(LastFM.Settings.all, function(field){
		if (!$(field)){
			return;
		}
		
		settings[$(field).get('name')] = $(field).get('value');
	});
	
	storage.set(LASTFM_SETTINGS, settings);
}