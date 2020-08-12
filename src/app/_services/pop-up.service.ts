import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopUpService {

  constructor() { }

  makeEventPopup(feature: any): string {
    var dates= feature.properties.dates
    // remove json parentheses 
    var formatDates = dates.replace('[', '').replace(']', '').replace('{', '').replace('}', '')
    return `` +
      `<div>Title: ${ feature.properties.name }</div>` +
      `<div>Dates: ${ formatDates}</div>` +
      `<div>Place: ${ feature.properties.town }</div>`
  }
}