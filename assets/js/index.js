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
        $('#music-queue').html(
            _.template($('#MusicQueueTemplate').html())({
                tracks: tlTracks
            }));
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
                track.removeAttr('id', 'playing');
            }
        } else if (state == "paused") {
            $('#state').removeClass('pause').addClass('play');
        } else if (state =="playing") {
            var track = $('#tracks tr:first');
            track.attr('id', 'playing');
            $('#state').removeClass('play').addClass('pause');
        } 
    })
};

