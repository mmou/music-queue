var foo;
var mopidy;
$(document).ready(function() {
    mopidy = new Mopidy({
        webSocketUrl: "ws://localhost:6680/mopidy/ws/"
    });

    mopidy.on("state:online", function () {
        $('#loading').remove();
        updateQueue();
    });

    mopidy.on("event:playbackStateChanged", function(data) {
        controlsView.updateState();
    });

    mopidy.on("event:tracklistChanged", function(data) {
        updateQueue();
    });
})

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

// Collections

var TrackCollection = Backbone.Collection.extend({
    model: TrackModel
});

var trackCollection = new TrackCollection();

// Models

var TrackModel = Backbone.Model.extend({
    initialize: function () {
    },

    defaults: {
        tlid: 0,
        uri: "",
        title: "Untitled",
        artist: "Anon",
        album: "Untitled",
        length: 0,
        timestamp: Date.now()
    }
});


// Views


// Controls View includes MusicQueueView
var ControlsView = Backbone.View.extend({
    template: _.template($('#ControlsTemplate').html()),
    collection: new TrackCollection(),
    el: "#main",
    foo: "hi",

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template);
        return this;
    },

    createMusicQueueView: function() {
        this.musicQueueView = new MusicQueueView({collection: this.collection});
        return this.musicQueueView;
    },


    // front-end updates to controls, called when playbackChanged event triggered
    updateState: function() {
        mopidy.playback.getState().then(function(state) {
            console.log(state);
            if (state == "stopped") {
                console.log("state stopped!");
                $('#state').removeClass('pause').addClass('play');
                if ($('#tracks tr:first').length > 0) {
                    var track = $('#tracks tr:first');
                    track.removeAttr('id', 'playing');                
                }
            } else if (state == "paused") {
                console.log("state paused!");                
                $('#state').removeClass('pause').addClass('play');
            } else if (state =="playing") {
                console.log("state playing!");                
                var track = $('#tracks tr:first');
                track.attr('id', 'playing');                
                $('#state').removeClass('play').addClass('pause');
            } 
        })
    },

    events: {
        "click #state" : "changeState",
        "click #next": "nextTrack",
        "click #prev": "prevTrack",
        "click #add"   : "add",
        "click #search" : "search"
    },

    changeState: function(event) {
        mopidy.playback.getState().then(function(state) {
            console.log(state);
            if (state == "stopped") {
                if ($('#tracks tr:first').length > 0) {
                    var track = $('#tracks tr:first'); 
                    mopidy.tracklist.filter({'uri': [track.data('uri')]})
                        .then(function(tls) {
                            console.log(tls);
                            if (tls.length > 0) {
                                mopidy.playback.play(tls[0]);
                            }
                    })
                } 
            } else if (state == "paused") {
                mopidy.playback.resume();                
            } else if (state =="playing") {
                mopidy.playback.pause();
            } 
        })
    },

    nextTrack: function(event) {
        var track = $("#tracks #playing"); 
        track.removeAttr('id', 'playing');

        mopidy.playback.next();
    },

    prevTrack: function(event) {
        console.log('prevs!');
        mopidy.playback.previous();
    },

    add: function(event) {
        $('#queue-add').html(_.template($('#SearchSongControlsTemplate').html()));
    },

    search: function(event) {
        searchView.render().search();

    }

})

var MusicQueueView = Backbone.View.extend({
	template: _.template($('#MusicQueueTemplate').html()),
    collection: new TrackCollection(),
	el: "#music-queue",

    initialize: function () {
    },

    render:function () {
        console.log("this models #: " + this.collection.models.length);
        $(this.el).html(this.template({
            tracks: this.collection.models
        }));
        return this;
    }



});


var SearchView = Backbone.View.extend({
    template: _.template($('#SearchTemplate').html()),
    el: '#search-dimmer .center',

    initialize: function () {
//        this.render().search();
    },

    render:function () {
        $(this.el).html(this.template);
        $('body').dimmer('toggle');
        return this;
    },

    search: function() {
        var uri = "spotify:user:moumerry:playlist:1esa4l1YrYCzLVczy3TNms";
        mopidy.playlists.lookup(uri).then(function(playlist) {
            foo = playlist.tracks;
            var searchResultsView = new SearchResultsView(
                {collection: new TrackCollection(
                    _.map(playlist.tracks, function(t){
                        return new TrackModel({
                            uri: t.uri,
                            title: t.name,
                            artist: t.artists[0].name,
                            album: t.album.name,
                            length: t.length,
                            timestamp: Date.now()
                        });
                    })
                )
            }
            )
        });
    },

    events: {
        "click #add-tracks"   : "addTracks",
    },

    addTracks: function(event) {
        var selectedTracks = $('#search-results .positive');
        for (var i = 0; i < selectedTracks.length; i++) {
            uri = $(selectedTracks[i]).data('uri');
            mopidy.library.lookup(uri).then(function(t) {
                mopidy.tracklist.add(t);
            });
        };
        $('#search-dimmer').dimmer('toggle');
    }

});

var SearchResultsView = Backbone.View.extend({
    template: _.template($('#SearchResultsTemplate').html()),
    collection: new TrackCollection(),
    el: '#search-results',
    
    initialize: function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template({
            tracks: this.collection.models
        }));
        return this;
    },

    events: {
//        "mouseenter tr"   : "hoverTrack",
//        "mouseleave tr"   : "unhoverTrack",        
        "click tr" : "selectDeselectTrack"
    },

//    hoverTrack: function(event) {
//        $(event.target).parent().addClass('active');
//    },
//
//    unhoverTrack: function(event) {
//        $(event.target).parent().removeClass('active');
//    },

    selectDeselectTrack: function(event) {
        $(event.target).parent().toggleClass('positive');
    }

});


////

var controlsView = new ControlsView({collection: trackCollection});
var musicQueueView = controlsView.createMusicQueueView();
var searchView = new SearchView();