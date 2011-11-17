phantom.injectJs('casperjs/casper.js');

var url = 'http://jean-philippe.github.com/moolayers';

var casper = new phantom.Casper();

var addFakeGeolocation = function(self, latitude, longitude) {
    self.evaluate(function(){
        window.navigator.geolocation = function() {
            var pub = {};
            var current_pos = {
                coords: {
                    latitude: window.__casper_params__.latitude,
                    longitude: window.__casper_params__.longitude
                }
            };

            pub.getCurrentPosition = function(locationCallback,errorCallback) {
                locationCallback(current_pos);
            };
            return pub;
        }();
    }, { latitude: latitude, longitude: longitude });
};

function getMap(self) {
    return self.evaluate(function(){
        return map._map;
    });
}

casper.start(url, function(self) {
    self.test.assertExists('#map', 'map holder found');
    self.waitForSelector('div.olMapViewport', function(self) {
        self.test.pass('map viewport has been initialised');
    }, function(self) {
        self.test.fail('map init failed');
    });
});

casper.then(function(self) {
    self.waitForSelector('img[src="http://www.openlayers.org/dev/img/marker.png"]', function(self) {
        self.test.pass('markers has been loaded');
    }, function(self) {
        self.test.fail('markers load fails');
    });
});

casper.then(function(self) {
    var currentZoom =getMap(self).zoom;
    self.click('a[data-action=zoomIn]');
    self.test.assertEquals(getMap(self).zoom, currentZoom+1, 'zoom has been increased');
});

casper.then(function(self) {
    var currentZoom =getMap(self).zoom;
    self.click('a[data-action=zoomOut]');
    self.test.assertEquals(getMap(self).zoom, currentZoom-1, 'zoom has been decreased');
});

var getMapCenter = function(self) {
    return self.evaluate(function() {
        return window.map._map.getCenter();
    });
};

casper.then(function(self) {
    var lat = getMapCenter(self).lat;
    addFakeGeolocation(self, 12, 35);
    self.click('a[data-action=localizeMe]');
    var newLat = getMapCenter(self).lat;
    self.test.assert(lat != newLat, 'position has changed');
});

casper.run(function(self) {
    self.test.renderResults(true);
});
