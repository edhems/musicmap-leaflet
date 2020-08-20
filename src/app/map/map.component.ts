import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../_services/marker.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  private map;

  constructor(private markerService: MarkerService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.markerService.makeEventMarkers(this.map);
  }
  private initMap(): void {
    this.map = L.map('map', {
      center: [47.8235, 13.0393],
      zoom: 10,
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

    L.control.layers(baseMaps).addTo(this.map);
    cartoTiles.addTo(this.map);
  }
}
