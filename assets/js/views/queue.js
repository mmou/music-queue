// Queue Views


// Controls View includes MusicQueueView
var ControlsView = Backbone.View.extend({
    template: _.template($('#ControlsTemplate').html()),
    el: "#main",

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template);
        return this;
    },

    events: {
        "click #state" : "changeState",
        "click #next": "nextTrack",
        "click #clear": "clearQueue",
        "click #search" : "search"
    },

    // TODO: clean up playback tls referral
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
        var track = $("#tracks .active"); 
        track.removeClass('active');
        mopidy.playback.next();
    },

    clearQueue: function(event) {
        mopidy.tracklist.clear();
    },

    search: function(event) {
        searchView.render().search();
    }
});

var MusicQueueView = Backbone.View.extend({
	template: _.template($('#MusicQueueTemplate').html()),
    collection: new TrackCollection(),
	el: "#music-queue",

    render:function () {
        $(this.el).html(this.template({
            tracks: this.collection.models
        }));
        return this;
    }
});



var controlsView = new ControlsView();
var musicQueueView = new MusicQueueView({collection: trackCollection});
