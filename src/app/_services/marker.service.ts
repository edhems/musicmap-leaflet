import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { PopUpService } from './pop-up.service';
import 'leaflet.markercluster';
import * as moment from 'moment';
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.js';
import 'leaflet.heat';


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
  events_grp2 = L.layerGroup();
  // SearchLayerTesting

  heat_grp = L.layerGroup();
  jsonTest = L.geoJson();
  jsonTest1 = L.geoJson();
  isRunning: boolean = true;
  //searchControl: any;

  // returnFeaureJson() {
  //   var markerCount = 0;
  //       var date;
  //       var today = moment().format('YYYY-MM-DD');
  //       let cluster = L.markerClusterGroup ({
  //       });
  //       console.log('Creating markers...');

  //         this.http.get(this.events).subscribe((res: any) => {
  //         this.jsonTest1 = res;
  //         console.log(JSON.stringify(res));
  //         for (const c of res.features) {
  //           const datesJson = JSON.parse(c.properties.dates);
  //           for (let i = 0; i < datesJson.length; i++) {
  //             date = datesJson[i];
  //           }
  //           // If the event hasent happend yet it will be considerd for heatmap generation.
  //           if (date.to > today) {
  //             markerCount++;
  //             // Getting the lat and lon
  //             const lat = c.geometry.coordinates[0];
  //             const lon = c.geometry.coordinates[1];
  //             // Using another list to store each coordinate pair seperate.
  //             let innerlist = [lon,lat,0.4];
  //           } else {
  //             console.log('event is in the past');
  //           }
  //           for (let i = 0; i<markerCount; i++){
  //           }
  //         }
          
  //         console.log('Created ' + markerCount + ' heat points');
  //         this.isRunning = false;
  //         return Promise.resolve(this.jsonTest1);
  //       });
        
  //       return Promise.resolve(this.jsonTest1);
  //       // Adding the cluster to a groupedLayer.
  // }
  
  
  ///Function to make a Heatmap from the events. Uses leaflet.heat plugin for the heatmap.
  makeHeatMap(map: L.map): void {
    
        var markerCount = 0;
        var date;
        var today = moment().format('YYYY-MM-DD');
        // Mother array wich will store as many array's as there are uptodate-events.
        let heatPointArray = [];
        
        let cluster = L.markerClusterGroup ({
         
        });
    
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
        // Creating the actuall heatmap using the L.heatLayer function. Data intake should be of format: [[lon,lat,intesity][lon,lat,intesity][..]]
        // styling of the heatmap gradient can be done after the coordinates. For help visit https://github.com/Leaflet/Leaflet.heat 
        var heat = L.heatLayer(heatPointArray,
              {radius: 25,
              minOpacity: 0.4,
              maxZoom: 19,
              0: 'blue',
              0.65: 'lime',
              1: 'red'
              }).addTo(cluster);
        // Adding the cluster to a groupedLayer.
        this.heat_grp.addLayer(cluster);
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

      let cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
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
            const marker = L.marker([lon, lat], { icon: eventMarkerIcon, title: c.properties.name });
          
            var ball = this.popupService.makeEventPopup(c);
            // cluster.addLayer(marker);
            cluster.addLayer(
              L.geoJSON(c, {
                pointToLayer: function(c, latlng) {
                  return L.marker(latlng, {
                    icon: eventMarkerIcon,
                  }).bindPopup(ball,popupOptions
                  //   '<div><img class="popupimg" src= '+ c.properties.images +'; alt="no image" ><div' +
                  // '<div id=name>Title: '+c.properties.name +'</div>' +
                  // '<div><b>Start:</b>'+ c.properties.dates[0].from    +'</div>' +
                  // '<div><b>End:  </b>'+ c.properties.to    +'</div>' +
                  // '<div><b>Time: </b>'+ c.properties.timeBegin+'</div>'
                  );
                }
              }));
            
            this.events_grp.addLayer(cluster);
            // this.events_grp2.addLayer(L.geoJSON(c));
            markerCount++;
          } else {
            console.log('event is in the past');
          }
      
        // this.events_grp2.addLayer(c);
        
        }
        // var geoLayer = new L.geoJSON(this.events_grp.toGeoJSON());
        var search = new L.Control.Search({
          position: 'topleft',
          layer: L.geoJSON(this.events_grp.toGeoJSON()),
          propertyName: 'name',//'additionalInfos'
        });
        map.addControl(search);
        console.log(L.Icon.Default.prototype._getIconUrl());
        console.log('Created ' + markerCount + ' event markers');
        this.isRunning = false;
      });
      
      console.log("Return:");
      console.log(this.events_grp);
  };
  

  // EnableSearch(map: L.map) {     
  //     var markerCount = 0;
  //       var date;
  //       var today = moment().format('YYYY-MM-DD');
  //       let cluster = L.markerClusterGroup ({
  //       });
  //       console.log('Creating markers...');

  //         this.http.get(this.events).subscribe((res: any) => {
  //         this.jsonTest1 = res;
  //         //console.log(JSON.stringify(res));
  //         for (const c of res.features) {
  //           const datesJson = JSON.parse(c.properties.dates);
  //           for (let i = 0; i < datesJson.length; i++) {
  //             date = datesJson[i];
  //           }
  //           // If the event hasent happend yet it will be considerd for heatmap generation.
  //           if (date.to > today) {
  //             markerCount++;
  //             // Getting the lat and lon
  //             const lat = c.geometry.coordinates[0];
  //             const lon = c.geometry.coordinates[1];
  //             // Using another list to store each coordinate pair seperate.
  //             let innerlist = [lon,lat,0.4];
  //           } else {
  //             console.log('event is in the past');
  //           }
  //           for (let i = 0; i<markerCount; i++){
  //           }
  //         }
          
  //         console.log('Created ' + markerCount + ' search points');
  //         console.log(res);
          
  //         this.searchControl = new L.Control.Search({
  //           layer: res, //L.layerGroup(this.events_grp),//this.markerService.makeEventMarkers(this.map),
  //          propertyName: 'name',
  //          //marker: false,
  //          moveToLocation: function(latlng, title, map) {
  //            map.fitBounds( latlng.layer.getBounds() );
  //            var zoom = map.getBoundsZoom(latlng.layer.getBounds());
  //            map.setView(latlng, zoom); // access the zoom
  //          }
         
  //         });
        
         
  //        console.log("Search Enabled.")
  //        console.log("RES: ");
  //        console.log(res)
  //        this.isRunning = false;
  //       });
  // }


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
