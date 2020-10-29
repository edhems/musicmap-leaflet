import { AfterViewInit, Component, NgModule } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../_services/marker.service';
import 'leaflet-search';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})

export class MapComponent implements AfterViewInit {
  private map;
  constructor(private http: HttpClient, private markerService: MarkerService) {}
  ngAfterViewInit(): void {
    this.initMap();
    //this.markerService.makeEventMarkers(this.map);
    this.markerService.makeOrganizerMarkers(this.map);
    // Calling the makeHeatMap functions which will make a heat map and store it in the Heatmap layerGroup
    this.markerService.makeHeatMap(this.map);
    //this.EnableSearch();
  }
  private initMap(): void {
    this.map = L.map('map', {
      center: [47.799896, 13.046367],
      zoom: 12,
    });

    const cartoTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    );
    const osm = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    const BasemapAT_grau = L.tileLayer(
      'https://maps{s}.wien.gv.at/basemap/bmapgrau/{type}/google3857/{z}/{y}/{x}.{format}',
      {
        maxZoom: 19,
        attribution:
          'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
        subdomains: ['', '1', '2', '3', '4'],
        type: 'normal',
        format: 'png',
        bounds: [
          [46.35877, 8.782379],
          [49.037872, 17.189532],
        ],
      }
    );

    const BasemapAT_orthofoto = L.tileLayer(
      'https://maps{s}.wien.gv.at/basemap/bmaporthofoto30cm/{type}/google3857/{z}/{y}/{x}.{format}',
      {
        maxZoom: 20,
        attribution:
          'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
        subdomains: ['', '1', '2', '3', '4'],
        type: 'normal',
        format: 'jpeg',
        bounds: [
          [46.35877, 8.782379],
          [49.037872, 17.189532],
        ],
      }
    );

    this.markerService.events

    var baseMaps = {
      'Carto Light': cartoTiles,
      'Open Street Map': osm,
      'Basemap.at': BasemapAT_grau,
      Orthophoto: BasemapAT_orthofoto,
    };

    var overlays = {
      Organizers: this.markerService.organizers_grp,
      Events: this.markerService.events_grp,
      HeatMap: this.markerService.heat_grp,
    };
     
    L.control.layers(baseMaps, overlays).addTo(this.map);
    cartoTiles.addTo(this.map);
    var search = this.markerService.makeEventMarkers(this.map);
    this.EnableSearch();
    

    //TODO: Search through dates, solve multi date error
    
  //   for (const i in searchLayer1) {
  //     const title = searchLayer1[i].getLayer(i);  // value searched
  //     console.log("Tilte: " +title);
  //     console.log(searchLayer1[i]);
  //     searchLayer1.title= searchLayer1.title || 'Default title' // !!!!!!!!!!!check and default value
  //     const lat = searchLayer1[i].geometry.coordinates[0];      // position found
  //     console.log(lat);
  //     const lon = searchLayer1[i].coordinates[1];   
  //        // position found
  //     const marker1 = L.marker([lon,lat], { 'title': title }) // se property searched
  //     marker1.bindPopup('title: ' + title)
  //     searchLayer1.addLayer(marker1)
  // }

  }
  
  CheckStatus() {
    var status = this.markerService.isRunning;
    return status;
  }

  async EnableSearch(): Promise<void> {
    ///////////////////////////////
      console.log("Marker");
      await this.markerService.makeEventMarkers(this.map);
      var gJ = new L.geoJSON(this.markerService.events_grp.toGeoJSON());
      console.log(gJ);
      var searchControl = new L.Control.Search({
        layer: gJ,//this.markerService.makeEventMarkers(this.map),
        propertyName: 'name',
        //marker: false,
        moveToLocation: function(latlng, title, map) {
          map.fitBounds( latlng.layer.getBounds() );
          var zoom = map.getBoundsZoom(latlng.layer.getBounds());
            map.setView(latlng, zoom); // access the zoom
        }
  
      });
      /////////////////////////////////
      this.map.addControl(searchControl);
      console.log("Search Enableed.")
      // var searchLayer1 = await this.markerService.makeEventMarkers(this.map);
      // var searchLayer2 = this.markerService.jsonTest;
      // var search = new L.Control.Search({
      //   position: 'topleft',
      //   layer: searchLayer1,
      //   propertyName: 'name',
      // });
      // this.map.addControl(search);
    }
}
