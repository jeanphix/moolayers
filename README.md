# Moolayers


Creates OpenLayers maps.

Demo at: http://jeanphix.github.com/moolayers


## How to use


### Simple map:

    <div id="map" data-zoom="1.5">
        <nav>
            <ul>
                <li>
                    <a href="#" title="Zoom in" data-action="zoomIn" accesskey="i">+</a>
                </li>
                <li>
                    <a href="#" title="Zoom out" data-action="zoomOut" accesskey="o">-</a>
                </li>
            </ul>
        </nav>
    </div>
    <script src="http://www.openlayers.org/api/OpenLayers.js" type="text/javascript"></script>
    <script type="text/javascript">
        var map = new MooLayers.Map('map');
    </script>


### Marker service

    <div id="map" data-zoom="1.5" data-markers-service="markers.json" />

expected json format:

    {"markers" : [{
            "content": "somewhere...",
            "latitude": 0,
            "longitude": 9.4
        }, {
            "content": "somewhere else...",
            "latitude": 40,
            "longitude": 0
        }]
    }


## Runing tests

requirements: PhantomJS

    git submodule init && git submodule update  # Checks out CasperJS
    phantomjs test.js