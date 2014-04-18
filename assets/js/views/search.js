var SearchView = Backbone.View.extend({
    template: _.template($('#SearchTemplate').html()),
    el: '#search-dimmer .center',

    render:function () {
        $(this.el).html(this.template());
        this.countSelected();
        $('body').dimmer('toggle');
        return this;
    },

    events: {
        "mouseenter td" : "hoverTrack",
        "mouseleave td" : "hoverTrack",        
        "click td" : "selectDeselectTrack",
        "click #add-tracks"   : "addTracks",
        "click #search" : "search"
    },

    search: function(event) {
        $('#search-results').html('<div class="ui text loader"></div>');
        var query = $('#queue-add input').val();
        mopidy.library.search({'any': [query]}).then(function(results) {
            $('#search-results').html(
                _.template($('#SearchResultsTemplate').html())({
                    results: results
                }));
            $('#search-all').fadeIn();
            $('#search-all.ui.accordion').accordion();
        })
    },

    hoverTrack: function(event) {
        $(event.target).parent().toggleClass('hover');
    },

    selectDeselectTrack: function(event) {
        $(event.target).parent().toggleClass('selected');
        this.countSelected();
    },

    countSelected: function() {
        var selectedCount = {
            artists: 0,
            albums: 0,
            tracks: 0
        }
        var searchTables = $("#search-results table");
        for (var i=0; i<searchTables.length; i++) {
            selectedCount[$(searchTables[i]).data('type')] = $(searchTables[i]).find('tr.selected').length;
        }
        $('#selected-count').html(
            _.template($('#SelectedCountTemplate').html())({
                selected: selectedCount
        }));
        $('#selected-count-content').fadeIn(300);       
    },

    addTracks: function(event) {
        var selectedTracks = $('#search-results tr.selected');
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