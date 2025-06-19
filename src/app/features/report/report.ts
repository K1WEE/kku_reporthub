import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';
import { Maps } from '../../shared/services/maps';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../shared/services/supabase';

@Component({
  selector: 'app-report',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './report.html',
  styleUrl: './report.css'
})
export class Report {
  problemForm!: FormGroup;
  selectedFileName: string = '';
  isGettingLocation: boolean = false;
  isSubmitting: boolean = false; // เพิ่มสำหรับ loading state
  
  currentLocation: any = null;
  locationError = '';
  submitError = ''; // เพิ่มสำหรับแสดง error
  
  map: google.maps.Map | null = null;
  categories: string[] = []; // เก็บรายการหมวดหมู่

  // Services
  private supabaseService = inject(Supabase);
  mapservice = inject(Maps);
  cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  private loader = new Loader({
    apiKey: environment.googleMapsApiKey, 
    version: 'weekly',
    libraries: ['places', 'geometry']
  });

  constructor(private fb: FormBuilder) {}

  async ngOnInit() {
    this.initializeForm();
    await this.loadCategories();
  }

  initializeForm() {
    this.problemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      image: [''],
      location: ['']
    });
  }

  // โหลดหมวดหมู่จาก database
  async loadCategories() {
    try {
      const { data, error } = await this.supabaseService['supabase']
        .from('report_categories')
        .select('name')
        .order('name');

      if (!error && data) {
        this.categories = data.map(cat => cat.name);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
        return;
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      this.selectedFileName = file.name;
      this.problemForm.patchValue({
        image: file
      });
    }
  }

  async getCurrentLocation() {
    this.ngZone.run(() => {
      this.isGettingLocation = true;
      this.locationError = '';
    });

    try {
      await this.loader.load();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            this.ngZone.run(async () => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              this.currentLocation = {
                latitude: lat,
                longitude: lng,
                accuracy: Math.round(position.coords.accuracy)
              };

              this.problemForm.patchValue({
                location: this.currentLocation
              });

              this.isGettingLocation = false;
              this.cdr.detectChanges();
            });
          },
          (error) => {
            this.ngZone.run(() => {
              this.handleLocationError(error);
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      } else {
        this.ngZone.run(() => {
          this.locationError = 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง';
          this.isGettingLocation = false;
        });
      }
    } catch (error) {
      this.ngZone.run(() => {
        this.locationError = 'ไม่สามารถโหลด Google Maps API ได้';
        this.isGettingLocation = false;
      });
    }
  }

  private handleLocationError(error: GeolocationPositionError) {
    this.isGettingLocation = false;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.locationError = 'ไม่อนุญาตให้เข้าถึงตำแหน่ง';
        break;
      case error.POSITION_UNAVAILABLE:
        this.locationError = 'ไม่สามารถระบุตำแหน่งได้';
        break;
      case error.TIMEOUT:
        this.locationError = 'หมดเวลาในการระบุตำแหน่ง';
        break;
      default:
        this.locationError = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
        break;
    }
  }

  async onSubmit() {
    if (!this.problemForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.supabaseService.isAuthenticated) {
      alert('กรุณาเข้าสู่ระบบก่อนส่งรายงาน');
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      const { data: { user }, error: userError } = await this.supabaseService['supabase'].auth.getUser();
    
    if (userError || !user) {
      throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
      let imageUrl = null;

      if (this.problemForm.value.image) {
        const file = this.problemForm.value.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error: uploadError } = await this.supabaseService['supabase'].storage
          .from('report-images')
          .upload(fileName, file);
          
        if (uploadError) {
          throw new Error(`ไม่สามารถอัปโหลดรูปภาพได้: ${uploadError.message}`);
        }

        if (data) {
          imageUrl = fileName;
        }
      }

      // บันทึกข้อมูลรายงาน
      const reportData = {
        title: this.problemForm.value.title.trim(),
        description: this.problemForm.value.description.trim(),
        category: this.problemForm.value.category,
        image_url: imageUrl,
        latitude: this.currentLocation?.latitude || null,
        longitude: this.currentLocation?.longitude || null,
        user_id: user.id,
      };

      const { data, error } = await this.supabaseService['supabase']
        .from('reports')
        .insert(reportData)
        .select();

      if (error) {
        throw new Error(`ไม่สามารถบันทึกรายงานได้: ${error.message}`);
      }

      alert('ส่งรายงานของท่านเข้าระบบเรียบร้อยแล้ว');
      this.resetForm();

    } catch (error: any) {
      console.error('Error submitting report:', error);
      this.submitError = error.message || 'เกิดข้อผิดพลาดในการส่งรายงาน';
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.problemForm.controls).forEach(key => {
      const control = this.problemForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.problemForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} จำเป็นต้องกรอก`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} ต้องมีอย่างน้อย ${requiredLength} ตัวอักษร`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: {[key: string]: string} = {
      'title': 'หัวข้อ',
      'description': 'รายละเอียด',
      'category': 'หมวดหมู่'
    };
    return labels[fieldName] || fieldName;
  }

  resetForm() {
    this.problemForm.reset();
    this.selectedFileName = '';
    this.currentLocation = null;
    this.locationError = '';
    this.submitError = '';
  }

  getImageUrl(fileName: string): string {
    if (!fileName) return '';
    
    const { data } = this.supabaseService['supabase'].storage
      .from('report-images')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  }
}