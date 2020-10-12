import { AfterViewInit, Component, NgModule } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../_services/marker.service';
import 'leaflet-search';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    this.markerService.makeEventMarkers(this.map);
    this.markerService.makeOrganizerMarkers(this.map);
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
    var baseMaps = {
      'Carto Light': cartoTiles,
      'Open Street Map': osm,
      'Basemap.at': BasemapAT_grau,
      Orthophoto: BasemapAT_orthofoto,
    };

    var overlays = {
      Organizers: this.markerService.organizers_grp,
      Events: this.markerService.events_grp,
    };
     
    L.control.layers(baseMaps, overlays).addTo(this.map);
    cartoTiles.addTo(this.map);



    //TODO: Search through dates, solve multi date error
    var searchLayer1 = this.markerService.events_grp;
    var searchLayer2 = this.markerService.jsonTest;
    var search = new L.Control.Search({
      position: 'topleft',
      layer: searchLayer1,
      propertyName: 'organizer',
    });

    this.map.addControl(search);
   
  }

  CheckStatus() {
    var status = this.markerService.isRunning;
    return status;
  }
}
