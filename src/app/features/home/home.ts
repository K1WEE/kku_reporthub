import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Map } from '../map/map';
import { Supabase } from '../../shared/services/supabase';

@Component({
  selector: 'app-home',
  imports: [RouterLink,Map],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  supabase = inject(Supabase);
  

  
  logout() {
    this.supabase.signOut();
  }


  loadProblems() {
    console.log('Loading problems...');
  }
}
