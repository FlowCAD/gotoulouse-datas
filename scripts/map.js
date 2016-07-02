//Déclare la map
var mymap = L.map('mapId').setView([44.83688, -0.57129], 12);


//Ajoute un fond de plan
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(mymap);


//Ajoute un marker sur le lieu de travail...
var marker = L.marker([44.805458, -0.559889]).addTo(mymap);


//... et la popup associée
marker.bindPopup("<b>Travail</b><br>Lieu de travail actuel").openPopup();


//Evénement de click sur la map
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("Ici, les coordonnées sont : " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);