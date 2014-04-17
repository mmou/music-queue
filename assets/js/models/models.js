// Collections

var TrackCollection = Backbone.Collection.extend({
    model: TrackModel
});

var trackCollection = new TrackCollection();


// Models

var TrackModel = Backbone.Model.extend({
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
