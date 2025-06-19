import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { GoogleMap, MapMarker, MapInfoWindow } from '@angular/google-maps';

interface MarkerWithStatus {
  position: google.maps.LatLngLiteral;
  status: 'completed' | 'in-progress' | 'fixing';
  id: string;
  title?: string;
}

@Component({
  selector: 'app-map',
  imports: [GoogleMap, MapMarker, DecimalPipe],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class Map implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;
  
  center: google.maps.LatLngLiteral = { lat: 16.4752579359857, lng: 102.82227752824912 };
  zoom = 15;
  display: google.maps.LatLngLiteral | null = null;
  isGoogleMapsLoaded = false;
  isBrowser = false; 

  mapLoadError = false;
  
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    clickableIcons: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        stylers: [
          { visibility: 'off' }
        ]
      }
    ]
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.waitForGoogleMaps();
    }
  }

  private waitForGoogleMaps(): void {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && 
          typeof google !== 'undefined' &&
          google.maps && 
          google.maps.SymbolPath) {
        this.isGoogleMapsLoaded = true;
        console.log('Google Maps API โหลดสำเร็จแล้ว');
        setTimeout(() => {
        }, 100);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }

  markerPositions: MarkerWithStatus[] = [
    {
      position: { lat: 16.4752579359857, lng: 102.82227752824912 },
      status: 'fixing',
      id: '1',
      title: 'จุดที่ 1'
    },
    {
      position: { lat: 16.4762579359857, lng: 102.82327752824912 },
      status: 'in-progress',
      id: '2',
      title: 'จุดที่ 2'
    },
    {
      position: { lat: 16.4742579359857, lng: 102.82127752824912 },
      status: 'completed',
      id: '3',
      title: 'จุดที่ 3'
    }
  ];

  statusConfig = {
    'completed': {
      color: '#4CAF50', 
      icon: 'done',
      label: 'แก้ไขแล้ว'
    },
    'in-progress': {
      color: '#2196F3', 
      icon: 'schedule',
      label: 'กำลังดำเนินการ'
    },
    'fixing': {
      color: '#F44336', 
      icon: 'build',
      label: 'กำลังแก้ไข'
    }
  };

  move(event: google.maps.MapMouseEvent) {
    if (this.isBrowser && this.isGoogleMapsLoaded && typeof google !== 'undefined' && event.latLng) {
      this.display = event.latLng.toJSON();
    }
  }

  getMarkerOptions(marker: MarkerWithStatus): google.maps.MarkerOptions {
    if (!this.isBrowser || !this.isGoogleMapsLoaded || typeof google === 'undefined') {
      return {};
    }

    const config = this.statusConfig[marker.status];
    
    return {
      title: `${marker.title} - ${config.label}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: config.color,
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    };
  }

  getMarkersByStatus(status: 'completed' | 'in-progress' | 'fixing'): MarkerWithStatus[] {
    return this.markerPositions.filter(marker => marker.status === status);
  }

  getAllMarkers(): MarkerWithStatus[]{
    return this.markerPositions;
  }

  changeMarkerStatus(markerId: string, newStatus: 'completed' | 'in-progress' | 'fixing') {
    const marker = this.markerPositions.find(m => m.id === markerId);
    if (marker) {
      marker.status = newStatus;
    }
  }

  onMarkerClick(marker: MarkerWithStatus) {
    if (!this.isBrowser || !this.isGoogleMapsLoaded || typeof google === 'undefined') return;
    
    const statuses: ('fixing' | 'in-progress' | 'completed')[] = ['fixing', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(marker.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    this.changeMarkerStatus(marker.id, statuses[nextIndex]);
  }
}