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
    var jsonDates = JSON.parse(dates.replace('"', '"')); //replace probably not necessary
    for (let i = 0; i < jsonDates.length; i++) {
      eventDate = jsonDates[i];
    }
    var img = feature.properties.images;
    //removes the tick marks so the link is "clean"
    var imgLink = img.slice(1, -1);

    return (
      `` +
      `<div><img class="popupimg" src= ${imgLink}; alt="no image" ><div>` +
      `<div id=name>Title: ${feature.properties.name}</div>` +
      //`<div>Dates Raw: ${feature.properties.dates}</div>` +
      `<div><b>Start:</b> ${eventDate.from}</div>` +
      `<div><b>End:</b> ${eventDate.to}</div>` +
      `<div><b>Time:</b> ${eventDate.timeBegin}</div>`
      //`<div>Place: ${feature.properties.town}</div>` TODO: Specify address
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
