/*jslint node: true*/
/*jslint es5: true */
/*global L, $, zonesLargesTLS, alert*/
"use strict";

//--------------------------------------------------------------------------------------------//
//---------------------------------------DATABASE INIT----------------------------------------//
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCAa7DgIILyVHWgoWluxoWqy5lOsYxHQsA",
    authDomain: "test-457af.firebaseapp.com",
    databaseURL: "https://test-457af.firebaseio.com",
    projectId: "test-457af",
    storageBucket: "test-457af.appspot.com",
    messagingSenderId: "549265380497"
};
firebase.initializeApp(config);
//var dbRef = firebase.database().ref().child('Points');
//dbRef.on('value', snap => console.log("dbRef", snap.val()));

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
    satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr}),
    streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr}),
    osm = L.tileLayer(osmUrl, {attribution: osmAttr});

// Styles
var alertMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-exclamation', prefix: 'fa', color: 'orange', iconColor: 'white'}),
    workMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-briefcase', prefix: 'fa', color: 'darkblue', iconColor: 'white'}),
    homeMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-home', prefix: 'fa', color: 'green', iconColor: 'white'}),
    transportMarkerSymbol = L.AwesomeMarkers.icon({icon: ' fa fa-subway', prefix: 'fa', color: 'blue', iconColor: 'white'});

var zonesFinesStyle = {"weight": 2, "color": "#ff7800", "opacity": 1, fillColor: '#ff7800', fillOpacity: 0.4},
    zonesLargesStyle = {"weight": 1, "color": "#0000FF", "opacity": 1, fillColor: '#0000FF', fillOpacity: 0.25},
    polygonStyle = {"weight": 1, "color": "white", "opacity": 1, fillColor: 'rgb(52, 196, 85)', fillOpacity: 0.25};

// Markers
var thalesMarker = L.marker([43.536916, 1.513079], {icon : workMarkerSymbol}).bindPopup("<b>Travail</b><br />Thalès Service Labège");

// JSONs
var zonesLargesTLSJson = L.geoJson(
    zonesLargesTLS,
    {
        style: zonesLargesStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<b> Quartier : " + feature.properties.libelle_du + "</b>");
        }
    }
);

//--------------------------------------------------------------------------------------------//
//-------------------------------------MAP INITIALIZATION-------------------------------------//
var initParam = function () {
    console.log("fonction initParam !");
    thalesMarker.addTo(mymap);
    zonesLargesTLSJson.addTo(mymap);
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
    if (!myUrlRegexDev.test(myCurrentUrl) && !myUrlRegexProd.test(myCurrentUrl)) {
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

//--------------------------------------------------------------------------------------------//
//---------------------------------------MAP PROPERTIES---------------------------------------//
mymap.setView([43.599560, 1.441079], 12).setMaxBounds(bounds);
mymap.options.minZoom = 12;

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
    "Thalès Service Labège": thalesMarker,
    "Zones Larges Toulouse": zonesLargesTLSJson,
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

L.easyButton('fa fa-sign-in', function (btn, mymap) {
    $('#loginModal').modal('show');
}).addTo(mymap);

// Send a mail with a link and the coordinates in the url
L.easyButton('fa fa-envelope-o', function (btn, mymap) {
    $('#emailLink').val(window.location.href);
    $('#sendMailModal').modal('show');
}).addTo(mymap);

var onclickSendMailButton = function () {
    var receiver = $("#emailAdress").val(),
        senderName = $("#emailSender").val(),
        senderMail = $("#emailSenderMail").val(),
        senderMessage = $("#emailContent").val(),
        senderLink = $("#emailLink").val(),
        bodyOfMailToLink = encodeURI("Hey c'est " + senderName + " (mail : " + senderMail + " ) ! " + senderMessage + senderLink ),
        mailToLink = "mailto:" + receiver + "?Subject=Mappart?body=" + bodyOfMailToLink;

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

function onMapClick(e) {
    mapClickEvent = e;
    L.popup()
        .setLatLng(e.latlng)
        .setContent(onclickPopupContainer[0])
        .openOn(mymap);
}
mymap.on('click', onMapClick);
//--------------------------------------------------------------------------------------------//
//------------------------------------------SANDBOX-------------------------------------------//
//Go searching for openData from Toulouse Metropole
var fromPointFeatureToLayer = function (featuresCreated, openDataName) {
    var myData = L.geoJson(
        featuresCreated,
        {
            pointToLayer: function (feature, latlng) {
                return new L.marker((latlng), {icon : transportMarkerSymbol});
            },
            onEachFeature: function (feature, layer) {
                var featureAttributes = "", attr;
                for (attr in feature.properties) {
                    if (typeof (feature.properties[attr]) !== "object") {
                        featureAttributes += attr + " : " + feature.properties[attr] + "<br />";
                    }
                }
                layer.bindPopup(featureAttributes);
            }
        }
    );
    addingData(myData, openDataName);
};

var fromPolygonFeatureToLayer = function (featuresCreated, openDataName) {
    var myData = L.geoJson(
        featuresCreated,
        {
            style: polygonStyle,
            onEachFeature: function (feature, layer) {
                var featureAttributes = "", attr;
                for (attr in feature.properties) {
                    if (typeof (feature.properties[attr]) !== "object") {
                        featureAttributes += attr + " : " + feature.properties[attr] + "<br />";
                    }
                }
                layer.bindPopup(featureAttributes);
            }
        }
    );
    addingData(myData, openDataName);
};

var fromFeatureToFeatureType = function (featuresCreated, typeOfGeomArray, openDataName) {
    console.log(featuresCreated, typeOfGeomArray, openDataName);
    if (typeOfGeomArray.length !== 1) {
        console.log("Il y a un problème avec le type de géométrie");
    }
    switch (typeOfGeomArray[0]) {
    case "Point":
        fromPointFeatureToLayer(featuresCreated, openDataName);
        break;
    case "LineString":
        console.log("Hey c'est une LineString !");
        break;
    case "Polygon":
        fromPolygonFeatureToLayer(featuresCreated, openDataName);
        break;
    case "MultiPoint":
        fromPointFeatureToLayer(featuresCreated, openDataName);
        break;
    case "MultiLineString":
        console.log("Hey c'est une MultiLineString !");
        break;
    case "MultiPolygon":
        fromPolygonFeatureToLayer(featuresCreated, openDataName);
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

var fromXhrToFeature = function (myResponse, openDataName) {
    var i,
        typeOfGeomArray = [],
        featuresCreated = {
            "type" : "FeatureCollection",
            "features" : []
        };
    
    for (i = 0; i < myResponse.records.length; i += 1) {
        var typeOfGeom = myResponse.records[i].record.fields.geo_shape.geometry.type,
            theGeom = myResponse.records[i].record.fields.geo_shape.geometry.coordinates,
            featureObject = new FeatureConstructor(
                {
                    type : typeOfGeom,
                    coordinates : theGeom
                },
                myResponse.records[i].record.fields
            );
        if (typeOfGeomArray.indexOf(typeOfGeom) === -1) {
            typeOfGeomArray.push(typeOfGeom);
        }
        featuresCreated.features.push(featureObject);
    }
    fromFeatureToFeatureType(featuresCreated, typeOfGeomArray, openDataName);
};

var myXHRSender = function (openData) {
    var openDataLink = openData[0],
        openDataName = openData[1],
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
                fromXhrToFeature(myResponse, openDataName);
            } else {
                console.log("openDataXHR", openDataXHR.statusText);
            }
        }
    });
};

var openDataDistricts = ['https://data.toulouse-metropole.fr/api/v2/catalog/datasets/recensement-population-2012-grands-quartiers-logement/records?rows=100&fields=code_insee%2Creg2016%2Cdep%2Clibelle_du_grand_quartier%2Cgeo_shape&pretty=true&timezone=UTC', "Grands quartiers"],
    openDataSubwayStations = ['https://data.toulouse-metropole.fr/api/v2/catalog/datasets/stations-de-metro/records?rows=100&pretty=true&timezone=UTC', "Stations de métro"];
myXHRSender(openDataDistricts);
myXHRSender(openDataSubwayStations);


//Login with firebase
    /**
     * Handles the sign in button press.
     */
function toggleSignIn() {
    if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
    } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
        } else {
        alert(errorMessage);
        }
        console.log(error);
        document.getElementById('quickstart-sign-in').disabled = false;
        // [END_EXCLUDE]
    });
    // [END authwithemail]
    }
    document.getElementById('quickstart-sign-in').disabled = true;
}
/**
    * Handles the sign up button press.
    */
function handleSignUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
    alert('Please enter an email address.');
    return;
    }
    if (password.length < 4) {
    alert('Please enter a password.');
    return;
    }
    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
    } else {
        alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
    });
    // [END createwithemail]
}
/**
    * Sends an email verification to the user.
    */
function sendEmailVerification() {
    // [START sendemailverification]
    firebase.auth().currentUser.sendEmailVerification().then(function() {
    // Email Verification sent!
    // [START_EXCLUDE]
    alert('Email Verification Sent!');
    // [END_EXCLUDE]
    });
    // [END sendemailverification]
}
function sendPasswordReset() {
    var email = document.getElementById('email').value;
    // [START sendpasswordemail]
    firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
    }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
        alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
        alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
    });
    // [END sendpasswordemail];
}
/**
    * initApp handles setting up UI event listeners and registering Firebase auth listeners:
    *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
    *    out, and that is where we update the UI.
    */
function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    document.getElementById('quickstart-verify-email').disabled = true;
    // [END_EXCLUDE]
    if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        // [START_EXCLUDE]
        document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
        document.getElementById('quickstart-sign-in').textContent = 'Sign out';
        document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
        if (!emailVerified) {
        document.getElementById('quickstart-verify-email').disabled = false;
        }
        // [END_EXCLUDE]
    } else {
        // User is signed out.
        // [START_EXCLUDE]
        document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
        document.getElementById('quickstart-sign-in').textContent = 'Sign in';
        document.getElementById('quickstart-account-details').textContent = 'null';
        // [END_EXCLUDE]
    }
    // [START_EXCLUDE silent]
    document.getElementById('quickstart-sign-in').disabled = false;
    // [END_EXCLUDE]
    });
    // [END authstatelistener]
    document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
    document.getElementById('quickstart-sign-up').addEventListener('click', handleSignUp, false);
    document.getElementById('quickstart-verify-email').addEventListener('click', sendEmailVerification, false);
    document.getElementById('quickstart-password-reset').addEventListener('click', sendPasswordReset, false);
}
window.onload = function() {
    initApp();
};
