import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Maps {

  private isLoaded = false;
  private loadPromise: Promise<any> | null = null;

  constructor() {}

  loadGoogleMaps(): Promise<any> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry`;
      script.onload = () => {
        this.isLoaded = true;
        resolve(true);
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded;
  }
}
