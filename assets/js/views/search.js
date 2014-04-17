// SearchView includes a SearchResultsView
var SearchView = Backbone.View.extend({
    template: _.template($('#SearchTemplate').html()),
    el: '#search-dimmer .center',

    render:function () {
        $(this.el).html(this.template);
        $('body').dimmer('toggle');
        return this;
    },

    search: function() {
        var uri = "spotify:user:moumerry:playlist:1esa4l1YrYCzLVczy3TNms";
        mopidy.playlists.lookup(uri).then(function(playlist) {
            if (playlist) {
                $('#search-results').html(
                    _.template($('#SearchResultsTemplate').html())(
                    {
                        tracks: _.map(playlist.tracks, function(t){
                            return new TrackModel({
                                uri: t.uri,
                                title: t.name,
                                artist: t.artists[0].name,
                                album: t.album.name,
                                length: t.length,
                                timestamp: Date.now()
                            });
                        })
                }));
            } else {
                console.log("search failed");
            }
        });
    },

    events: {
        "click td" : "selectDeselectTrack",
        "click #add-tracks"   : "addTracks"
    },

    selectDeselectTrack: function(event) {
        $(event.target).parent().toggleClass('active');
    },

    addTracks: function(event) {
        var selectedTracks = $('#search-results .active');
        for (var i = 0; i < selectedTracks.length; i++) {
            uri = $(selectedTracks[i]).data('uri');
            mopidy.library.lookup(uri).then(function(t) {
                mopidy.tracklist.add(t);
            });
        };
        $('#search-dimmer').dimmer('toggle');
    }
});

var searchView = new SearchView();