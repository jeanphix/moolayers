var map = new MooLayers.Map('map');

map.localizeMe = function() {
    if(geo_position_js.init()){
       geo_position_js.getCurrentPosition(function(p) {
            console.log(p);
            map.moveTo(
                p.coords.latitude.toFixed(4),
                p.coords.longitude.toFixed(4),
                10
            );
       });
    }
};

