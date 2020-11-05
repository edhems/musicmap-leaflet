import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { PopUpService } from './pop-up.service';
import 'leaflet.markercluster';
import * as moment from 'moment';
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.js';
import 'leaflet.heat';
import 'leaflet.markercluster.layersupport';
import { icon, Marker } from 'leaflet';
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png'
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  popupAnchor: [0, 0],
  tooltipAnchor: [0, 0],
  shadowSize: [0, 0]
});
Marker.prototype.options.icon = iconDefault;

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  // add &maxFeatures=50 to URL to limit number of features
  // geoserver GeoJSONs for events and organizers - make sure they work if data doesn't load
  events: string =
    'http://human.zgis.at/geoserver/music_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=music_map:salzburg_info_api&outputFormat=application%2Fjson';
  organizers: string =
    'http://human.zgis.at/geoserver/music_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=music_map:musicmap_organizers&outputFormat=application%2Fjson';

  constructor(private http: HttpClient, private popupService: PopUpService) {}
  // Layer Groups for organization and seperate displaying.
  organizers_grp = L.layerGroup();
  events_grp = L.layerGroup();
  heat_grp = L.layerGroup();
  jsonTest = L.geoJson();
  isRunning: boolean = true;
  cluster = L.markerClusterGroup.layerSupport({
    showCoverageOnHover: false,
  });
  ///Function to make a Heatmap from the events. Uses leaflet.heat plugin for the heatmap.
  makeHeatMap(map: L.map): void {
    
        var markerCount = 0;
        var date;
        var today = moment().format('YYYY-MM-DD');
        // Mother array wich will store as many array's as there are uptodate-events.
        let heatPointArray = [];
        console.log('Creating markers...');
        this.http.get(this.events).subscribe((res: any) => {
          this.jsonTest = res;
          //console.log(JSON.stringify(res));
          for (const c of res.features) {
            const datesJson = JSON.parse(c.properties.dates);
            for (let i = 0; i < datesJson.length; i++) {
              date = datesJson[i];
            }
            // If the event hasent happend yet it will be considerd for heatmap generation.
            if (date.to > today) {
              markerCount++;
              // Getting the lat and lon
              const lat = c.geometry.coordinates[0];
              const lon = c.geometry.coordinates[1];
              // Using another list to store each coordinate pair seperate.
              let innerlist = [lon,lat,0.4];
              // Push each of the above created arrays into another array, creating an array of arrays 
              // heatPointArray looking like : [[..][..][..]]
              heatPointArray.push(innerlist);
            } else {
              console.log('event is in the past');
            }
            for (let i = 0; i<markerCount; i++){
            }
          }
          console.log('Created ' + markerCount + ' heat points');
          this.isRunning = false;
        });
        // Creating the actuall heatmap using the L.heatLayer function and adding it to a Layer Group. 
        // Data intake should be of format: [[lon,lat,intesity][lon,lat,intesity][..]]
        // styling of the heatmap gradient can be done after the coordinates. For help visit https://github.com/Leaflet/Leaflet.heat 
        var heat = L.heatLayer(heatPointArray,
              {radius: 25,
              minOpacity: 0.4,
              maxZoom: 19,
              0: 'blue',
              0.65: 'lime',
              1: 'red'
              }).addTo(this.heat_grp);
  }
  
  makeEventMarkers(map: L.map): void {
      const popupOptions = {
        className: 'eventPopup',
      };
      var markerCount = 0;
      var date;
      var today = moment().format('YYYY-MM-DD');
      var eventMarkerIcon = L.ExtraMarkers.icon({
        icon: 'fa-theater-masks',
        markerColor: 'blue',
        prefix: 'fa',
        iconColor: 'white',
      });

      console.log('Creating markers...');
      this.http.get(this.events).subscribe((res: any) => {
        this.jsonTest = res;
        console.log(res);
        for (const c of res.features) {

          const datesJson = JSON.parse(c.properties.dates);
          for (let i = 0; i < datesJson.length; i++) {
            date = datesJson[i];
          }
          //console.log(date.from + 'today is ' + today);
          if (date.to > today) {
            const lat = c.geometry.coordinates[0];
            const lon = c.geometry.coordinates[1];
            //const marker = L.marker([lon, lat], { icon: eventMarkerIcon, title: c.properties.name });
          
            var popupContent = this.popupService.makeEventPopup(c);
            // Creating the markers and adding them to the cluster, and creating the popup in one go
            this.events_grp.addLayer(
              L.geoJSON(c, {
                pointToLayer: function(c, latlng) {
                  return L.marker(latlng, {
                    icon: eventMarkerIcon,
                  }).bindPopup(popupContent,popupOptions);
                }
              }));
            // Adding the cluster to a Layergroup wich can be enabled/disabled
            // this.events_grp.addLayer(this.cluster);
            markerCount++;
          } else {
            console.log('event is in the past');
          }
        }
        console.log("this.cluster");
        console.log(this.cluster);
        this.cluster.addTo(map);
        // The leaflet.markercluster.layersupport lets us use the CheckIn function for passing our LayerGroup to the cluster.
        this.cluster.checkIn(this.events_grp);
        // Implementing the Search Control layer. The layer gets passed as a GeoJSON. Propertyname defines what can be searched.(Must be a Feature propertie.)
        // var searchLayer = L.geoJSON(this.events_grp.toGeoJSON());
        var search = new L.Control.Search({
          position: 'topleft',
          layer: this.events_grp,
          propertyName: 'name',//'additionalInfos'
          initial: false,
          autoCollapse: true,
          //marker: false,
          //marker.icon = false,
          moveToLocation: function(latlng, title, map) {
            //map.fitBounds( latlng.layer.getBounds() );
            //var zoom = map.getBoundsZoom(latlng);
              map.setView(latlng, 20);

              console.log(latlng.layer);
              console.log(title);
              // console.log(L.geoJSON(this.events_grp.toGeoJSON()));
          } // access the zoom
        });
        search.on('search:locationfound', function(event) {
          console.log('search:locationfound');
          // map.removeLayer(this._markerSearch)
          console.log("Marker found");
          // An If clause to check if the Icon is not displayed which means that the marker is still clusterd
          // This will zoom to the cluster, open it (spiderfy) and then open the popup.
          if (!event.layer._icon){
            map.setView(event.latlng, 20);
            setTimeout(() => { event.layer.__parent.spiderfy(); event.layer.openPopup();}, 400);
          }
          // If the Icon allready is displayed, the marker isnt clusterd anymore and we can go ahead and open it up.
          if(event.layer._popup){
            event.layer.openPopup();
          }
        });  
        // Adding the Search to the Map 
        map.addControl(search);
        console.log(L.Icon.Default.prototype._getIconUrl());
        console.log('Created ' + markerCount + ' event markers');
        this.isRunning = false;
      });
  };
  
  makeOrganizerMarkers(): void {
    var orgMarkerIcon = L.ExtraMarkers.icon({
      icon: 'fa-landmark',
      markerColor: '#673ab7',
      prefix: 'fa',
      iconColor: 'white',
    });
    this.http.get(this.organizers).subscribe((org: any) => {
      console.log('creating organizer markers');
      for (const o of org.features) {
        const lat = o.geometry.coordinates[0];
        const lon = o.geometry.coordinates[1];
        const marker = L.marker([lon, lat], { icon: orgMarkerIcon });
        marker.bindPopup(this.popupService.makeOrganizerPopup(o));
        this.organizers_grp.addLayer(marker);
      }
    });
  }
}
