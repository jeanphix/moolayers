/*
---
description: Simplifies OpenLayers maps.

license: MIT-style

authors:
- jean-philippe serafin <serafinjp@gmail.com>

requires:
  core/1.4.1: '*'

provides: [MooLayers, MooLayers.Markers, MooLayers.Map]

...
*/
var MooLayers = new Class();


MooLayers.Markers = new Class({
    Implements: [Options],

    options: {
        service: null,
        defaultIcon: 'http://www.openlayers.org/dev/img/marker.png',
        defaultIconWidth: 20,
        defaultIconHeigth: 20
    },

    initialize: function(map, options){
        this.setOptions(options);
        this.map = map;
        this._markers = new OpenLayers.Layer.Markers('markers', this.options.markersOptions);
        this.map._map.addLayer(this._markers);
        if (this.options.service){
            this.loadFromService();
        }
    },

    loadFromService: function(){
        var jsonRequest = new Request.JSON({
            url: this.options.service,
            onSuccess: function(datas){
                this.fromJson(datas.markers);
            }.bind(this)
        }).get();
    },

    addMarker: function(latitude, longitude, content, icon, iconWidth, iconHeight){
        icon = icon || this.options.defaultIcon;
        iconWidth = iconWidth || this.options.defaultIconWidth;
        iconHeight = iconWidth || this.options.defaultIconHeight;
        console.log(this.options.defaultIcon);
        var lonLat = new OpenLayers.LonLat(longitude, latitude).transform(
            new OpenLayers.Projection(this.map.options.workProjection),
            this.map._map.getProjectionObject()
        );

        var size = new OpenLayers.Size(
            parseInt(iconWidth, 10),
            parseInt(iconHeight, 10)
        );
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h/2);
        var iconObj = new OpenLayers.Icon(icon, size, offset);

        var feature = new OpenLayers.Feature(this._markers, lonLat);
        feature.closeBox = true;
        feature.popupClass = OpenLayers.Class(
            OpenLayers.Popup.AnchoredBubble,
            { autoSize: true }
        );
        feature.data.popupContentHTML = content;
        feature.data.overflow = "visible";
        var marker = new OpenLayers.Marker(lonLat, iconObj);
        marker.events.register("mousedown", feature, function(e){
            if (!this.popup){
                this.popup = this.createPopup(this.closeBox);
                this.layer.map.addPopup(this.popup, true);
                this.popup.feature = this;
                this.popup.show();
            }else{
                this.popup.toggle();
                this.popup = null;
            }
            e.stopPropagation();
        });

        marker.feature = feature;

        this._markers.addMarker(marker);
    },

    fromJson: function(json){
        json.each(function(marker){
            this.addMarker(
                marker.latitude,
                marker.longitude,
                marker.content,
                marker.icon,
                marker.iconWidth,
                marker.iconHeight
            );
        }.bind(this));
    }
});


MooLayers.Map = new Class({
    Implements: [Events, Options],

    options: {
        controls: null,
        layers: null,
        workProjection: 'EPSG:4326',
        defaultCenter: {
            lat: 30,
            lon: 0
        },
        defaultZoom: 1
    },

    initialize: function(element, options){
        this.element = document.id(element);
        this.setOptions(options);
        this.initMap();
        this.initUserControls();
        this.initMapEvents();
    },

    initMap: function(){
        if (this.options.controls === null){
            controls = [
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.Navigation()
            ];
        }else{
            controls = this.options.controls;
        }
        if (this.options.layers === null){
            layers = [new OpenLayers.Layer.OSM()];
        }else{
            layers = this.options.layers;
        }
        this._map = new OpenLayers.Map(this.element, {
            controls: controls
        });
        layers.each(function(layer){
            this._map.addLayer(layer);
        }.bind(this));
        this.moveTo(
            parseFloat(this.element.get('data-latitude')) || this.options.defaultCenter.lat,
            parseFloat(this.element.get('data-longitude')) || this.options.defaultCenter.lon,
            parseFloat(this.element.get('data-zoom')) || this.options.defaultZoom
        );
        if (this.element.get('data-markers-service')){
            this.initMarkers();
        }
    },

    initUserControls: function(){
        this.element.getElements('a').each(function(link){
            if (link.get('data-action')){
                link.addEvent('click', function(e){
                    this[link.get('data-action')]();
                    e.stop();
                }.bind(this));
            }
        }.bind(this));
    },

    zoomIn: function() {
        this._map.zoomIn();
    },

    zoomOut: function() {
        this._map.zoomOut();
    },

    moveTo: function(lat, lon, zoom) {
        this._map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
            new OpenLayers.Projection(this.options.workProjection),
            this._map.getProjectionObject()
        ), zoom);
    },

    initMapEvents: function() {
        this._map.EVENT_TYPES.each(function(eventType){
            this._map.events.register(eventType, this._map, function(e){
                this.fireEvent(eventType);
            }.bind(this));
        }.bind(this));
    },

    initMarkers: function(){
            var markersOptions = {
                service: this.element.get('data-markers-service')
            };
            if (this.element.get('data-markers-default-icon')) {
                markersOptions.defaultIcon = this.element.get('data-markers-default-icon');
            }
            if (this.element.get('data-markers-default-icon-width')) {
                markersOptions.defaultWidth = this.element.get('data-markers-default-icon-width');
            }
            if (this.element.get('data-markers-default-icon-height')) {
                markersOptions.defaultHeight = this.element.get('data-markers-default-icon-height');
            }
            this.markers = new MooLayers.Markers(this, markersOptions);
    },

    getCenter: function(){
        return new OpenLayers.LonLat(
            this._map.center.lon,
            this._map.center.lat
        ).transform(
            this._map.getProjectionObject(),
            new OpenLayers.Projection(this.options.workProjection)
        );
    },

    getBoundaries: function(){
        return this._map.calculateBounds().transform(
            this._map.getProjectionObject(),
            new OpenLayers.Projection(this.options.workProjection)
        );
    }
});
