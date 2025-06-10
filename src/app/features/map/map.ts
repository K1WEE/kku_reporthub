import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapMarker,MapInfoWindow} from '@angular/google-maps';


@Component({
  selector: 'app-map',
  imports: [GoogleMap, MapMarker],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class Map {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow ;

  center: google.maps.LatLngLiteral = { lat: 16.4752579359857, lng: 102.82227752824912};
  zoom = 15;
  display: google.maps.LatLngLiteral | null = null;
  
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    clickableIcons: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true
  };

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.display = event.latLng.toJSON();
    }
  }
  
  markerPositions: google.maps.LatLngLiteral[] = [{lat: 16.4752579359857, lng: 102.82227752824912}];

  addMarker(event: google.maps.MapMouseEvent) {
    if (!event.latLng) {
      return;
    }
    this.markerPositions.push(event.latLng.toJSON());
    console.log(this.markerPositions);
  }

  
}
