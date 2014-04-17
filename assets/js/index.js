var mopidy;
$(document).ready(function() {
    mopidy = new Mopidy({
        webSocketUrl: "ws://localhost:6680/mopidy/ws/"
    });

    mopidy.on("state:online", function () {
        $('#loading').remove();
        mopidy.tracklist.setConsume(true);
        updateQueue();
        updateState();
    });

    mopidy.on("event:playbackStateChanged", function(data) {
        updateState();
    });

    mopidy.on("event:tracklistChanged", function(data) {
        updateQueue();
        updateState();        
    });
});

// refresh music queue
var updateQueue = function() {
    mopidy.tracklist.getTlTracks().then(function(tlTracks) {
        musicQueueView.collection.reset(
            _.map(tlTracks, function(t){
                return new TrackModel({
                    tlid: t.tlid,
                    uri: t.track.uri,
                    title: t.track.name,
                    artist: t.track.artists[0].name,
                    album: t.track.album.name,
                    length: t.track.length,
                    timestamp: Date.now()      
                });
            }));
        musicQueueView.render();
        controlsView.updateState();            
    });
};

// refresh controls and 'currently playing'
var updateState = function() {
    mopidy.playback.getState().then(function(state) {
        console.log(state);
        if (state == "stopped") {
            $('#state').removeClass('pause').addClass('play');
            if ($('#tracks tr:first').length > 0) {
                var track = $('#tracks tr:first');
                track.removeClass('active');
            }
        } else if (state == "paused") {
            $('#state').removeClass('pause').addClass('play');
        } else if (state =="playing") {
            var track = $('#tracks tr:first');
            track.addClass('active');
            $('#state').removeClass('play').addClass('pause');
        } 
    })
};

