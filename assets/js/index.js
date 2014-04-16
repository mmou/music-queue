$(document).ready(function() {
	var mopidy = new Mopidy({
    	webSocketUrl: "ws://localhost:6680/mopidy/ws/"
	});

	getPlaylists(mopidy);

	$('#refresh').click(getPlaylists(mopidy));
})

function getPlaylists(mopidy) {
	mopidy.on("state:online", function () {
		mopidy.playlists.getPlaylists(false).then(processPlaylists, console.error);
	});	
}

function processPlaylists(result) {
    var processedResult = "loading..."
    if (!result || result == '') {
    	processedResult = "playlists failed to load";
    }
	processedResult = _.map(result, function(p){ return p.name; });
	console.log(processedResult);
    $('#playlists #list').append(processedResult);

}