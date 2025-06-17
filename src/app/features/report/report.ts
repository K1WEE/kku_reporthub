import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';
import { Maps } from '../../shared/services/maps';

@Component({
  selector: 'app-report',
  imports: [ReactiveFormsModule],
  templateUrl: './report.html',
  styleUrl: './report.css'
})
export class Report {
  problemForm!: FormGroup;
  selectedFileName: string = '';
  // currentLocation: any = null;
  // locationError: string = '';
  isGettingLocation: boolean = false;

  currentLocation: any = null;
  locationError = '';

  map: google.maps.Map | null = null;

  mapservice = inject(Maps);

  private loader = new Loader({
    apiKey: environment.googleMapsApiKey, 
    version: 'weekly',
    libraries: ['places', 'geometry']
  });


  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.problemForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      image: [''],
      location: ['']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.problemForm.patchValue({
        image: file
      });
    }
  }

  async getCurrentLocation() {

    this.isGettingLocation = true;
    this.locationError = '';

    try {
      await this.loader.load();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            this.currentLocation = {
              latitude: lat,
              longitude: lng,
              accuracy: Math.round(position.coords.accuracy)
            };

            // ใช้ Google Maps Geocoding API เพื่อแปลง coordinates เป็น address
            await this.reverseGeocode(lat, lng);

            this.problemForm.patchValue({
              location: this.currentLocation
            });

            this.isGettingLocation = false;
          },
          (error) => {
            this.handleLocationError(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        this.locationError = 'Geolocation is not supported by this browser';
        this.isGettingLocation = false;
      }
    } catch (error) {
      this.locationError = 'Failed to load Google Maps API';
      this.isGettingLocation = false;
    }
    

    // if (!navigator.geolocation) {
    //   this.locationError = 'this browser does not support Geolocation';
    //   return;
    // }

    // this.isGettingLocation = true;
    // this.locationError = '';

    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(position => {
    //     this.currentLocation = {
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //       accuracy: Math.round(position.coords.accuracy)
    //     };
    //   });
    // }
    // else {
    //   alert("Geolocation is not supported by this browser.");
    // }

    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     this.currentLocation = {
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //       accuracy: Math.round(position.coords.accuracy)
    //     };
        
    //     this.problemForm.patchValue({
    //       location: this.currentLocation
    //     });
        
    //     this.isGettingLocation = false;
    //   },
    //   (error) => {
    //     this.isGettingLocation = false;
    //     switch (error.code) {
    //       case error.PERMISSION_DENIED:
    //         this.locationError = 'the user denied the request for Geolocation';
    //         break;
    //       case error.POSITION_UNAVAILABLE:
    //         this.locationError = 'location not available';
    //         break;
    //       case error.TIMEOUT:
    //         this.locationError = 'timeout occurred while trying to get location';
    //         break;
    //       default:
    //         this.locationError = 'an unknown error occurred while trying to get location';
    //         break;
    //     }
    //   },
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 10000,
    //     maximumAge: 60000
    //   }
    // );
  }

  async reverseGeocode(lat: number, lng: number) {
    try {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat, lng };

      const response = await geocoder.geocode({ location: latlng });
      
      if (response.results && response.results.length > 0) {
        this.currentLocation.address = response.results[0].formatted_address;
        this.currentLocation.placeId = response.results[0].place_id;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  }

  async initMap() {
    if (!this.currentLocation) return;

    try {
      await this.loader.load();

      const centerLocation = {
        lat: this.currentLocation.latitude,
        lng: this.currentLocation.longitude
      };

      this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        zoom: 15,
        center: centerLocation,
      });

      // เพิ่ม marker
      new google.maps.Marker({
        position: centerLocation,
        map: this.map,
        title: 'Your Location'
      });
    } catch (error) {
      console.error('Map initialization failed:', error);
    }
  }

  private handleLocationError(error: GeolocationPositionError) {
    this.isGettingLocation = false;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.locationError = 'User denied the request for Geolocation';
        break;
      case error.POSITION_UNAVAILABLE:
        this.locationError = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        this.locationError = 'The request to get user location timed out';
        break;
      default:
        this.locationError = 'An unknown error occurred';
        break;
    }
  }

  onSubmit() {
    if (this.problemForm.valid) {
      const formData = {
        title: this.problemForm.value.title,
        description: this.problemForm.value.description,
        category: this.problemForm.value.category,
        image: this.problemForm.value.image,
        location: this.currentLocation,
        timestamp: new Date().toISOString()
      };

      console.log('data:', formData);
      alert('Done!');
      
      this.resetForm();
    }
  }

  resetForm() {
    this.problemForm.reset();
    this.selectedFileName = '';
    this.currentLocation = null;
    this.locationError = '';
  }

}
