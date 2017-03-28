/*jslint node: true*/
/*global L, $, zonesLargesBDX, zonesFinesBDX, zonesLargesTLS, alert*/
"use strict";

//--------------------------------------DATA DEFINITIONS--------------------------------------//
// Map's properties
var mymap = L.map('mapId');

// Background layers
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmxvcmlhbmNhZG96IiwiYSI6ImNqMGkzN3ZzYzAwM3MzMm80MDZ6eGQ2bmwifQ.BMmvDcBnXoWT8waOnIKNBg',
    osmAttr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';

var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
    satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr}),
    streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr}),
    osm = L.tileLayer(osmUrl, {attribution: osmAttr});

// Styles
var alertMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-exclamation', prefix: 'fa', color: 'blue', iconColor: 'white'}),
    workMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-briefcase', prefix: 'fa', color: 'cadetblue', iconColor: 'white'});

var zonesFinesStyle = {"color": "#ff7800", "weight": 2, "opacity": 0.65},
    zonesLargesStyle = {"color": "#0000FF", "weight": 1, "opacity": 0.25};

// Markers
var mobigisMarker = L.marker([44.805458, -0.559889], {icon : workMarkerSymbol}).bindPopup("<b>Travail</b><br>MobiGIS Bègles"),
    thalesMarker = L.marker([43.536916, 1.513079], {icon : workMarkerSymbol}).bindPopup("<b>Travail</b><br>Thalès Service Labège");

// JSONs
var zonesFinesBDXJson = L.geoJson(
    zonesFinesBDX,
    {
        style: zonesFinesStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<b>" + feature.properties.NOMCOMMUNE + " (" + feature.properties.CODEINSEE + ")</b><br />Commentaire : " + feature.properties.COMMENT);
        }
    }
).addTo(mymap);

var zonesLargesBDXJson = L.geoJson(
    zonesLargesBDX,
    {
        style: zonesLargesStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<b>" + feature.properties.NOMCOMMUNE + " (" + feature.properties.CODEINSEE + ")</b><br />Population : " + feature.properties.POPULATION + " personnes<br />Date de recensement : " + feature.properties.DATERECENS);
        }
    }
).addTo(mymap);

var zonesLargesTLSJson = L.geoJson(
    zonesLargesTLS,
    {
        style: zonesLargesStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<b> Quartier : " + feature.properties.libelle_du + "</b>");
        }
    }
).addTo(mymap);

//--------------------------------------------------------------------------------------------//

var initParam = function () {
    console.log("fonction initParam !");
    mobigisMarker.addTo(mymap);
    osm.addTo(mymap);
};

var checkForUrlTransmission = function () {
    console.log('checkForUrlTransmission');
    var myCurrentUrl = window.location.href,
        paramURL = null,
        paramURLPopup = null,
        myUrlRegexDev = /\/index\.html$/,
        myUrlRegexProd = /\/mappart\/?$/,
        myUrlParamRegex = /#([0-9]{1,2})\/([0-9]{1,2}\.?[0-9]*)\/(-?[0-9]{1,2}\.?[0-9]*)$/; /* like: #12/44.8369/-0.5713 */
    if (!myUrlRegexProd.test(myCurrentUrl)) { /*/!\PENSER A CHANGER LA VARIABLE UTILISEE ENTRE myUrlRegexDev ET myUrlRegexProd EN FONCTION DE L'ENVIRONNEMENT/!\*/
        console.log('Il y a des paramètres en URL');
        paramURL = myUrlParamRegex.exec(myCurrentUrl);
        console.log("paramURL : ", paramURL, "\nZoom : ", RegExp.$1, "\nLatitude : ", RegExp.$2, "\nLongitude : ", RegExp.$3);
        L.marker([RegExp.$2, RegExp.$3], {icon : alertMarkerSymbol}).addTo(mymap).bindPopup("<h6>Position transmise</h6>").openPopup();
    }
};

mymap.on("load", function () {
    console.log("map has loaded!");
    initParam();
    checkForUrlTransmission();
});

mymap.setView([44.83688, -0.57129], 12);

// Hash the map (zoom/lon/lat)
var hash = new L.Hash(mymap);


// Basemaps for control
var baseMaps = {
    "OpenStreetMap": osm,
    "Plan gris": grayscale,
    "Plan": streets,
    "Satellite": satellite
};

// Layers for control
var overlayMaps = {
    "MobiGIS Bègles": mobigisMarker,
    "Zones Larges Bordeaux": zonesLargesBDXJson,
    "Zones Fines Bordeaux": zonesFinesBDXJson
};


// Controler
var lcontrol = L.control.layers(baseMaps, overlayMaps).addTo(mymap);


// Geocorder OpenStreetMap
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.OpenStreetMap(),
    retainZoomLevel: false,
    showMarker: true
}).addTo(mymap);


// Removing data
var removeData = function (layerToRemove) {
    mymap.removeLayer(layerToRemove);
    lcontrol.removeLayer(layerToRemove);
};


// Adding data
var addingData = function (layerToAdd, layerNameToAdd) {
    mymap.addLayer(layerToAdd);
    lcontrol.addOverlay(layerToAdd, layerNameToAdd);
};


// Pan to another city
var cityToChoose = document.forms.cityChoiceForm.elements.city;

cityToChoose[0].onclick = function () {
    console.log("Bordeaux");
    mymap.setView(
        new L.LatLng(44.83688, -0.57129),
        12,
        {
            animate: true
        }
    );
    removeData(thalesMarker);
    removeData(zonesLargesTLSJson);
    addingData(mobigisMarker, "MobiGIS Bègles");
    addingData(zonesFinesBDXJson, "Zones Fines Bordeaux");
    addingData(zonesLargesBDXJson, "Zones Larges Bordeaux");
};

cityToChoose[1].onclick = function () {
    console.log("Toulouse");
    mymap.setView(
        new L.LatLng(43.599560, 1.441079),
        12,
        {
            animate: true
        }
    );
    removeData(mobigisMarker);
    removeData(zonesFinesBDXJson);
    removeData(zonesLargesBDXJson);
    addingData(thalesMarker, "Thalès Service Labège");
    addingData(zonesLargesTLSJson, "Zones Larges Toulouse");
};


// Send a mail with a link and the coordinates in the url
L.easyButton('fa fa-envelope-o', function (btn, mymap) {
    $('#emailLink').val(window.location.href);
    $('#sendMailModal').modal('show');
}).addTo(mymap);

/*
// OLD
$('#emailSendButton').on('click', function (e) {
    var mailModel = {
        adress: document.getElementById("emailAdress").value,
        text: document.getElementById("emailContent").value,
        link: document.getElementById("emailLink").value
    };
    window.location.href = "mailto:" + mailModel.adress + "?subject='Mappart'&body=" + mailModel.text + "<br />" + mailModel.link;
});
*/
$('#emailSendButton').on('click', function (e) {
    var destinaire = document.getElementById("emailAdress").value;
    document.mailingForm.action = "https://formspree.io/" + destinaire;
});


//Go searching for openData from Toulouse Metropole
var myXHR = new XMLHttpRequest();
myXHR.open('GET', 'https://data.toulouse-metropole.fr/api/v2/catalog/datasets/recensement-population-2012-grands-quartiers-logement/records?rows=100&pretty=false&timezone=UTC');
myXHR.send(null);

myXHR.addEventListener('progress', function (e) {
    console.log(e.loaded + ' / ' + e.total);
});

myXHR.addEventListener('readystatechange', function () {
    if (myXHR.readyState === XMLHttpRequest.DONE) {
        if (myXHR.status === 200) {
            var myResponse = JSON.parse(myXHR.responseText);
            console.log("myXHR", myResponse);
        } else {
            console.log("myXHR", myXHR.statusText);
        }
    }
});


// Event on the map
/*var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("Ici, les coordonnées sont : " + e.latlng.toString())
        .openOn(mymap);
}
mymap.on('click', onMapClick);*/
