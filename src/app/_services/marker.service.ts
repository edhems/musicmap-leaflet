import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { PopUpService } from './pop-up.service';
import 'leaflet.markercluster';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {
  // add &maxFeatures=50 to URL to limit no of features
  events: string = 'http://human.zgis.at/geoserver/music_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=music_map:salzburg_info_api&outputFormat=application%2Fjson';

  constructor(private http: HttpClient,
          private popupService: PopUpService) {  }

  makeEventMarkers(map: L.map): void {
    var cluster = L.markerClusterGroup();
    this.http.get(this.events).subscribe((res: any) => {
      for (const c of res.features) {
        const lat = c.geometry.coordinates[0];
        const lon = c.geometry.coordinates[1];
        //const circle = L.circleMarker([lon, lat]).addTo(map);
        const marker = L.marker([lon, lat])

        cluster.bindPopup(this.popupService.makeEventPopup(c));
        //marker.addTo(map);
        cluster.addTo(map);
        cluster.addLayer(L.marker([lon, lat]));
        console.log('Draw marker at ' + lat + ' ' + lon);
  }
});
  
}
}