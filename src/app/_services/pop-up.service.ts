import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  constructor() {}

  makeEventPopup(feature: any): string {
    var eventDate;
    //the dates are an array of jsons, so this loop parses and extracts the start and end date and the time
    var dates = feature.properties.dates;
    var jsonDates = JSON.parse(dates.replace('"', '"'));
    for (let i = 0; i < jsonDates.length; i++) {
      eventDate = jsonDates[i];
    }

    var img = feature.properties.images;

    var imgLink = img.slice(1, -1);
    //console.log(imgLink);
    return (
      `` +
      `<div><img src= ${imgLink}; alt="no image" style='height: 100%; width: 100%; object-fit: contain'><div>` +
      `<div>Title: ${feature.properties.name}</div>` +
      `<div>Dates Raw: ${feature.properties.dates}</div>` +
      `<div>Start: ${eventDate.from} End: ${eventDate.to} Time: ${eventDate.timeBegin} </div>` +
      `<div>Place: ${feature.properties.town}</div>`
    );
    //`<div>Event ID: ${ feature.properties.raw_data }</div>`
  }

  makeOrganizerPopup(feature: any): string {
    return (
      `` +
      `<div><b>${feature.properties.organizer}</b></div>` +
      `<div>Address: ${feature.properties.address}</div>` +
      `<div>Tel: ${feature.properties.tel}</div>` +
      `<div>Email: ${feature.properties.email}</div>`
    );

  }
}
