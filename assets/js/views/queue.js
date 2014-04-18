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
//        "mouseenter #search": "hoverAddIcon",
//        "mouseout #search": "hoverAddIcon",        
        "mouseenter #clear": "hoverClearIcon",
        "mouseout #clear": "hoverClearIcon",        
        "mouseenter .remove-track": "hoverInRemoveIcon",
        "mouseout .remove-track": "hoverOutRemoveIcon",
        "click .remove-track": "removeTrack",        
        "click #state" : "changeState",
        "click #next": "nextTrack",
        "click #clear": "clearQueue",
        "click #search": "switchSearchView"
    },

//    hoverAddIcon: function(event) {
//        if ($(event.target).hasClass('add')) {
//            $(event.target).removeClass("add").addClass("search")
//        } else {
//            $(event.target).removeClass("search").addClass("add")            
//        }
//    },

    hoverAddIcon: function(event) {
        $('#add-exp').fadeToggle(300);
    },

    hoverClearIcon: function(event) {
        $('#clear-exp').fadeToggle(300);
    },

    hoverInRemoveIcon: function(event) {
        $(event.target).fadeTo(300, 0.7);
    },

    hoverOutRemoveIcon: function(event) {
        $(event.target).fadeTo(200, 0.1);
    },

    // TODO: clean up playback tls referral
    changeState: function(event) {
        mopidy.playback.getState().then(function(state) {
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

    removeTrack: function(event) {
        mopidy.tracklist.remove({'tlid': [$(event.target).parent().parent().data('tlid')]});
    },

    nextTrack: function(event) {
        mopidy.tracklist.remove({'tlid': [$("#tracks tr:first").data('tlid')]});
    },

    clearQueue: function(event) {
        mopidy.tracklist.clear();
    },

    switchSearchView: function(event) {
        searchView.render();
    }
});

var controlsView = new ControlsView();
