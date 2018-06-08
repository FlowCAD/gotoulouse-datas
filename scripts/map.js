/*jslint node: true*/
/*jslint es5: true */
/*global L, $, datas, alert*/
"use strict";

//--------------------------------------------------------------------------------------------//
//--------------------------------------DATA DEFINITIONS--------------------------------------//
// Map's properties
var mymap = L.map('mapId');

// Map's bounds
var northEastBound = L.latLng(43.68, 1.68),
    southWestBound = L.latLng(43.52, 1.21),
    bounds = L.latLngBounds(northEastBound, southWestBound);

// Background layers
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmxvcmlhbmNhZG96IiwiYSI6ImNqMGkzN3ZzYzAwM3MzMm80MDZ6eGQ2bmwifQ.BMmvDcBnXoWT8waOnIKNBg',
    osmAttr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';

var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
    satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite', attribution: mbAttr}),
    streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr}),
    osm = L.tileLayer(osmUrl, {attribution: osmAttr});

// Styles
var alertMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-exclamation', prefix: 'fa', color: 'orange', iconColor: 'white'}),
    homeMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-home', prefix: 'fa', color: 'green', iconColor: 'white'}),
    transportMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-subway', prefix: 'fa', color: 'blue', iconColor: 'white'}),
    workMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-briefcase', prefix: 'fa', color: 'darkblue', iconColor: 'white'}),
    shopMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-shopping-basket', prefix: 'fa', color: 'green', iconColor: 'white'}),
    restoMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-cutlery', prefix: 'fa', color: 'purple', iconColor: 'white'}),
    coffeeMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-coffee', prefix: 'fa', color: 'cadetblue', iconColor: 'white'}),
    barMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-beer', prefix: 'fa', color: 'darkred', iconColor: 'white'}),
    clubMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-glass', prefix: 'fa', color: 'red', iconColor: 'white'});

var polygonStyle = {"weight": 1, "color": 'rgb(52, 196, 85)', "opacity": 1, fillColor: 'rgb(255, 255, 255)', fillOpacity: 0.15};

// JSONs
var datasJson = L.geoJson(datas, {
    onEachFeature: function (feature, layer) {
        var popupText = "<b>" + feature.properties.libelle + "</b><br />" + feature.properties.genre + "<br />" + feature.properties.sousgenre;
        layer.bindPopup(popupText, {
            closeButton: true,
            offset: L.point(0, -20)
        });
        layer.on('click', function() {
            layer.openPopup();
        });
    },
    pointToLayer: function(feature, latlng) {
        var genre = feature.properties.genre;
        var marker;
        if (genre == "Magasin") {
            marker = new L.marker(latlng, {icon: shopMarkerSymbol});
        } else if (genre == "Restaurant") {
            marker = new L.marker(latlng, {icon: restoMarkerSymbol});
        } else if (genre == "WorkPlace") {
            marker = new L.marker(latlng, {icon: workMarkerSymbol});
        } else if (genre == "Café") {
            marker = new L.marker(latlng, {icon: coffeeMarkerSymbol});
        } else if (genre == "Bar") {
            marker = new L.marker(latlng, {icon: barMarkerSymbol});
        } else if (genre == "Boite") {
            marker = new L.marker(latlng, {icon: clubMarkerSymbol});
        } else {
            marker = new L.marker(latlng, {icon: alertMarkerSymbol});
        }
        return marker;
    }
});

//--------------------------------------------------------------------------------------------//
//-------------------------------------MAP INITIALIZATION-------------------------------------//
var initParam = function () {
    datasJson.addTo(mymap);
    osm.addTo(mymap);
};

var checkForUrlTransmission = function () {
    var myCurrentUrl = window.location.href,
        paramURL = null,
        myUrlRegexDev = /\/index\.html$/,
        myUrlRegexProd = /\/gotoulouse-datas\/?$/,
        myUrlParamRegex = /#([0-9]{1,2})\/([0-9]{1,2}\.?[0-9]*)\/(-?[0-9]{1,2}\.?[0-9]*)$/; /* like: #12/44.8369/-0.5713 */
    if (!myUrlRegexDev.test(myCurrentUrl) && !myUrlRegexProd.test(myCurrentUrl)) {
        paramURL = myUrlParamRegex.exec(myCurrentUrl);
        console.log("There are parameters in the URL : ", paramURL, "\nZoom : ", RegExp.$1, "\nLatitude : ", RegExp.$2, "\nLongitude : ", RegExp.$3);
        L.marker([RegExp.$2, RegExp.$3], {icon: alertMarkerSymbol}).addTo(mymap).bindPopup("<h6>Position transmise / Dernière position</h6>").openPopup();
    }
};

mymap.on("load", function () {
    initParam();
    checkForUrlTransmission();
});

//--------------------------------------------------------------------------------------------//
//---------------------------------------MAP PROPERTIES---------------------------------------//
// Geolocation of the user and initialization of the map view
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    L.marker(e.latlng, {icon: homeMarkerSymbol}).addTo(mymap)
        .bindPopup("Vous êtes ici ! (à " + Math.round(radius) + " mètres près)").openPopup();
    L.circle(e.latlng, radius).addTo(mymap);
}

function onLocationError(e) {
    alert("Il y a eu un problème avec la géolocalisation ! Vérifiez les paramètres de votre navigateur. ", e.message);
}

mymap.on('locationfound', onLocationFound);
mymap.on('locationerror', onLocationError);
mymap.locate({setView: true, maxZoom: 16}).setMaxBounds(bounds);
mymap.options.minZoom = 12;

// Hash the map (zoom/lon/lat)
new L.Hash(mymap);

// Basemaps for control
var baseMaps = {
    "OpenStreetMap": osm,
    "Plan gris": grayscale,
    "Plan": streets,
    "Satellite": satellite
};

// Layers for control
var overlayMaps = {
    "Mes Spots": datasJson
};

// Controler
var lcontrol = L.control.layers(baseMaps, overlayMaps).addTo(mymap);

// Geocorder OpenStreetMap
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.OpenStreetMap(),
    retainZoomLevel: false,
    showMarker: true
}).addTo(mymap);
//--------------------------------------------------------------------------------------------//
//--------------------------------------OTHER FUNCTIONS---------------------------------------//
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

// Send a mail with a link and the coordinates in the url
L.easyButton('fa fa-envelope-o', function () {
    $('#emailLink').val(window.location.href);
    $('#sendMailModal').modal('show');
}).addTo(mymap);

var onclickSendMailButton = function () {
    var receiver = $("#emailAdress").val(),
        senderName = $("#emailSender").val(),
        senderMessage = $("#emailContent").val(),
        senderLink = $("#emailLink").val(),
        bodyOfMailToLink = encodeURI(senderMessage + "\r\n" + senderLink + "\r\n \r\n" + senderName),
        mailToLink = "mailto:" + receiver + "?subject=gÔToulouse&body=" + bodyOfMailToLink;
    window.location.href = mailToLink;
};

// Trigger an onclick event on the map and opening a great multitask popup
var onclickPopupContainer = $('<div />'), mapClickEvent = null, onMapClickSendPositionMail = null, onMapClickPlaceMarker = null, onMapClickAlertCoord = null;

onMapClickSendPositionMail = function () {
    var myUrlWithoutParam = window.location.hostname + window.location.pathname;
    $('#emailLink').val(myUrlWithoutParam + '#' + mymap.getZoom() + '/' + mapClickEvent.latlng.lat.toFixed(4).toString() + '/' + mapClickEvent.latlng.lng.toFixed(4).toString());
    $('#sendMailModal').modal('show');
    mymap.closePopup();
};

onMapClickPlaceMarker = function () {
    var marker = L.marker(mapClickEvent.latlng).bindPopup("<h5><i class='fa fa-info-circle' aria-hidden='true'></i> Marqueur Temporaire</h5><p>Ceci est un marquer temporaire, il ne sera pas sauvegardé après cette session !</p>").addTo(mymap);
    mymap.closePopup();
};

onMapClickAlertCoord = function () {
    alert("Ici, les coordonnées sont : " + mapClickEvent.latlng.toString());
    mymap.closePopup();
};

onclickPopupContainer.html('<div class="btn-group-vertical" role="group"><button id="onMapClickButton1" type="submit" class="btn btn-primary btn-block" onclick="onMapClickSendPositionMail()"><i class="fa fa-envelope fa-fw" aria-hidden="true"></i> Envoyer cette position par mail</button><button id="onMapClickButton2" type="submit" class="btn btn-primary btn-block" onclick="onMapClickPlaceMarker()"><i class="fa fa-map-marker fa-fw" aria-hidden="true"></i> Placer un marker temporaire</button><button id="onMapClickButton3" type="submit" class="btn btn-primary btn-block" onclick="onMapClickAlertCoord()"><i class="fa fa-globe fa-fw" aria-hidden="true"></i> Récupérer les coordonnées</button></div>');


mymap.on('click', function (e) {
    mapClickEvent = e;
    L.popup()
        .setLatLng(e.latlng)
        .setContent(onclickPopupContainer[0])
        .openOn(mymap);
});
//--------------------------------------------------------------------------------------------//
//------------------------------------OPEN DATA FUNCTIONS-------------------------------------//
//Go searching for openData from Toulouse Metropole
var fromPointFeatureToLayer = function (featuresCreated, openDataName, openDataProperties) {
    var myData = L.geoJson(
        featuresCreated,
        {
            pointToLayer: function (feature, latlng) {
                return new L.marker((latlng), {icon: transportMarkerSymbol});
            },
            onEachFeature: function (feature, layer) {
                var featureAttributes = "", prop, attr;
                for (prop in openDataProperties) {
                    for (attr in feature.properties) {
                        if (typeof(feature.properties[attr]) !== "object" && attr === openDataProperties[prop].toLowerCase()) {
                            featureAttributes += openDataProperties[prop] + " : " + feature.properties[attr] + "<br />";
                        }
                    }
                }
                layer.bindPopup(featureAttributes);
            }
        }
    );
    lcontrol.addOverlay(myData, openDataName);
};

var fromPolygonFeatureToLayer = function (featuresCreated, openDataName, openDataProperties) {
    var myData = L.geoJson(
        featuresCreated,
        {
            style: polygonStyle,
            onEachFeature: function (feature, layer) {
                var featureAttributes = "", prop, attr;
                for (prop in openDataProperties) {
                    for (attr in feature.properties) {
                        if (typeof(feature.properties[attr]) !== "object" && attr === openDataProperties[prop].toLowerCase()) {
                            featureAttributes += openDataProperties[prop] + " : " + feature.properties[attr] + "<br />";
                        }
                    }
                }
                layer.bindPopup(featureAttributes);
            }
        }
    );
    lcontrol.addOverlay(myData, openDataName);
};

var fromFeatureToFeatureType = function (featuresCreated, typeOfGeomArray, openDataName, openDataProperties) {
    console.log("Datas to display: ", featuresCreated, typeOfGeomArray, openDataName, openDataProperties);
    if (typeOfGeomArray.length !== 1) {
        console.log("Il y a un problème avec le type de géométrie");
    }
    switch (typeOfGeomArray[0]) {
    case "Point":
        fromPointFeatureToLayer(featuresCreated, openDataName, openDataProperties);
        break;
    case "LineString":
        console.log("Hey c'est une LineString !");
        break;
    case "Polygon":
        fromPolygonFeatureToLayer(featuresCreated, openDataName, openDataProperties);
        break;
    case "MultiPoint":
        fromPointFeatureToLayer(featuresCreated, openDataName, openDataProperties);
        break;
    case "MultiLineString":
        console.log("Hey c'est une MultiLineString !");
        break;
    case "MultiPolygon":
        fromPolygonFeatureToLayer(featuresCreated, openDataName, openDataProperties);
        break;
    case "GeometryCollection":
        console.log("Hey c'est une GeometryCollection !");
        break;
    default:
        console.log("Hey je connais pas ce type de géométrie !!");
    }
};

var FeatureConstructor = function (geometry, properties) {
    this.geometry = geometry;
    this.properties = properties;
    this.type = "Feature";
};

var fromXhrToFeature = function (myResponse, openDataName, openDataProperties) {
    var i,
        typeOfGeomArray = [],
        featuresCreated = {
            "type": "FeatureCollection",
            "features": []
        };
    for (i = 0; i < myResponse.records.length; i += 1) {
        var typeOfGeom = myResponse.records[i].record.fields.geo_shape.geometry.type,
            theGeom = myResponse.records[i].record.fields.geo_shape.geometry.coordinates,
            featureObject = new FeatureConstructor(
                {
                    type: typeOfGeom,
                    coordinates: theGeom
                },
                myResponse.records[i].record.fields
            );
        if (typeOfGeomArray.indexOf(typeOfGeom) === -1) {
            typeOfGeomArray.push(typeOfGeom);
        }
        featuresCreated.features.push(featureObject);
    }
    fromFeatureToFeatureType(featuresCreated, typeOfGeomArray, openDataName, openDataProperties);
};

var myXHRSender = function (openData) {
    var openDataLink = openData[0],
        openDataName = openData[1],
        openDataProperties = openData[2],
        openDataXHR = new XMLHttpRequest();
    openDataXHR.open('GET', openDataLink);
    openDataXHR.send(null);
    /*openDataXHR.addEventListener('progress', function (e) {
        console.log(e.loaded + ' / ' + e.total);
    });*/
    openDataXHR.addEventListener('readystatechange', function () {
        if (openDataXHR.readyState === XMLHttpRequest.DONE) {
            if (openDataXHR.status === 200) {
                var myResponse = JSON.parse(openDataXHR.responseText);
                fromXhrToFeature(myResponse, openDataName, openDataProperties);
            } else {
                console.log("openDataXHR ", openDataXHR.statusText);
            }
        }
    });
};

var openDataDistricts = ['https://data.toulouse-metropole.fr/api/v2/catalog/datasets/recensement-population-2012-grands-quartiers-logement/records?rows=100&fields=code_insee%2Creg2016%2Cdep%2Clibelle_du_grand_quartier%2Cgeo_shape&pretty=true&timezone=UTC', "Grands quartiers", ["libelle_du_grand_quartier"]],
    openDataSubwayStations = ['https://data.toulouse-metropole.fr/api/v2/catalog/datasets/stations-de-metro/records?rows=100&pretty=true&timezone=UTC', "Stations de métro", ["Etat", "Ligne", "Nom"]];
myXHRSender(openDataDistricts);
myXHRSender(openDataSubwayStations);