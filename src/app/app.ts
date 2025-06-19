import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Supabase } from './shared/services/supabase';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'kku_reporthub';
  session: any = null;

  authService = inject(Supabase);

  async ngOnInit(): Promise<void> {
    const session = await this.authService.getSession();
    // if (session) {
    //   console.log('User is already logged in');
    //   console.log('Access Token:', this.authService.accessToken);
    // }

    // this.authService.authChanges((event, session) => {
    //   if (event === 'SIGNED_IN') {
    //     console.log('User signed in:', session?.user);
    //     console.log('Access Token:', this.authService.accessToken);
    //   } else if (event === 'SIGNED_OUT') {
    //     console.log('User signed out');
    //   }
    // });
  }
}
