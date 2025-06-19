import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Map } from '../map/map';
import { Supabase } from '../../shared/services/supabase';
import { Problem } from '../../shared/models/problem.models';

 

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Map],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  supabase = inject(Supabase);
  router = inject(Router);

  problems = signal<Problem[]>([
    {
      id: 1,
      title: 'Sample Problem 1',
      description: 'This is a sample problem description.',
      location: { lat: 13.7563, lng: 100.5018 },
      status: 'รอการแก้ไข',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      title: 'test',
      description: 'test',
      location: { lat: 13.7563, lng: 100.5018 },
      status: 'รอการแก้ไข',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  

  async ngOnInit(): Promise<void> {
    await this.supabase.getSession();
  }

  async logout() {
    try {
      await this.supabase.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}