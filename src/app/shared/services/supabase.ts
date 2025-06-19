import { Injectable, signal } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../../../environments/environment'

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  currentUser = signal<{email: string} | null>(null);
  public supabase: SupabaseClient // เปลี่ยนเป็น public เพื่อให้เข้าถึงได้
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    this.initAuthListener();
  }

  private initAuthListener() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session = session;

      if (event === 'SIGNED_IN' && session?.user?.email) {
        this.currentUser.set({
          email: session.user.email
        });
      } else if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
      }
    });
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await this.supabase.auth.getSession();
    this._session = data.session;
    
    if (this._session?.user?.email) {
      this.currentUser.set({
        email: this._session.user.email
      });
    }
    
    return this._session;
  }

  get accessToken(): string | null {
    return this._session?.access_token ?? null;
  }

  get isAuthenticated(): boolean {
    return this._session !== null;
  }

  // เพิ่ม method สำหรับจัดการ reports
  async createReport(reportData: {
    title: string;
    description: string;
    category: string;
    image_url?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) {
    return this.supabase
      .from('reports')
      .insert(reportData)
      .select();
  }

  async getReports(filters?: {
    status?: string;
    category?: string;
    limit?: number;
  }) {
    let query = this.supabase
      .from('reports')
      .select(`
        *,
        report_categories(name, description)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query;
  }

  async getReportById(id: string) {
    return this.supabase
      .from('reports')
      .select(`
        *,
        report_categories(name, description),
        report_status_history(*)
      `)
      .eq('id', id)
      .single();
  }

  async updateReportStatus(reportId: string, status: 'in_progress' | 'fixing' | 'completed', note?: string) {
    if (note) {
      // ใช้ function ที่มี note
      return this.supabase.rpc('update_report_status', {
        report_uuid: reportId,
        new_status: status,
        status_note: note
      });
    } else {
      // อัปเดตธรรมดา
      return this.supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);
    }
  }

  async getCategories() {
    return this.supabase
      .from('report_categories')
      .select('*')
      .order('name');
  }

  async getReportStatistics() {
    return this.supabase
      .from('report_statistics')
      .select('*');
  }

  async getCategoryStatistics() {
    return this.supabase
      .from('category_statistics')
      .select('*');
  }

  async getNearbyReports(latitude: number, longitude: number, radiusKm: number = 5) {
    return this.supabase.rpc('get_nearby_reports', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radiusKm
    });
  }

  // Image/File management
  async uploadReportImage(file: File): Promise<{fileName: string | null, error: any}> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await this.supabase.storage
        .from('report-images')
        .upload(fileName, file);

      return {
        fileName: error ? null : fileName,
        error
      };
    } catch (error) {
      return {
        fileName: null,
        error
      };
    }
  }

  getReportImageUrl(fileName: string): string {
    if (!fileName) return '';
    
    const { data } = this.supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  }

  async deleteReportImage(fileName: string) {
    return this.supabase.storage
      .from('report-images')
      .remove([fileName]);
  }

  // Storage methods (existing)
  get storage() {
    return this.supabase.storage;
  }

  // Database methods for direct access
  from(table: string) {
    return this.supabase.from(table);
  }

  // Auth methods (existing)
  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      this._session = session;

      if (event === 'SIGNED_IN' && session?.user?.email) {
        this.currentUser.set({
          email: session.user.email
        });
      } else if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
      }
      
      callback(event, session);
    });
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
    })
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password})
  }

  async signOut() {
    const result = await this.supabase.auth.signOut();
    // รีเซ็ต local state
    this._session = null;
    this.currentUser.set(null);
    return result;
  }

  getCurrentUser() {
    return this.supabase.auth.getUser().then(({ data }) => {
      return data.user
    })
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return this.supabase.from('profiles').upsert(update)
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file)
  }
}