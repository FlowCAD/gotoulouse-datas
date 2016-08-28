// Background layers
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
    satellite  = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr}),
    streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});


// Markers
var jobMarker = L.marker([44.805458, -0.559889]).bindPopup("<b>Travail</b><br>Lieu de travail actuel");
var potentialJobMarker = L.marker([43.553609, 1.485198]).bindPopup("<b>Travail</b><br>Lieu de travail potentiel");

// Map's properties
var mymap = L.map('mapId', {
    center: [44.83688, -0.57129],
    zoom: 12,
    layers: [streets, jobMarker, potentialJobMarker]
});


// Styles
var ZonesFinesStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

var ZonesLargesStyle = {
    "color": "#0000FF",
    "weight": 5,
    "opacity": 0.35
};


// JSONs
var ZonesLargesJson = L.geoJson(
    ZonesLarges,
    {
        style: ZonesLargesStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<b>" + feature.properties.NOMCOMMUNE + " (" + feature.properties.CODEINSEE + ")</b><br />Population : " + feature.properties.POPULATION + " personnes<br />Date de recensement : " + feature.properties.DATERECENS);
        }
    }
).addTo(mymap);

var ZonesFinesJson = L.geoJson(
    ZonesFines,
    {
        style: ZonesFinesStyle,
        onEachFeature: function (feature, layer) {
    		layer.bindPopup("<b>" + feature.properties.NOMCOMMUNE + " (" + feature.properties.CODEINSEE + ")</b><br />Commentaire : " + feature.properties.COMMENT);
        }
    }
).addTo(mymap);


// Basemaps for control
var baseMaps = {
    "Plan gris": grayscale,
    "Plan": streets,
    "Satellite": satellite
};

// Layers for control
var overlayMaps = {
    "Job": jobMarker,
	"Job potentiel": potentialJobMarker,
    "Zones Larges": ZonesLargesJson,
    "Zones Fines": ZonesFinesJson
};


// Controler
L.control.layers(baseMaps, overlayMaps).addTo(mymap);


// Geocorder OpenStreetMap
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.OpenStreetMap(),
    retainZoomLevel: false,
    showMarker: true
}).addTo(mymap);


// Event on the map
/*var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("Ici, les coordonnées sont : " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);*/