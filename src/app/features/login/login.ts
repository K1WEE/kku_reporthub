import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule,FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Supabase } from '../../shared/services/supabase';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  fb = inject(FormBuilder);
  router = inject(Router);
  loading = false
  signInForm = this.fb.group({
    email: '',
    password: ''
  })
  constructor(
    private readonly supabase: Supabase,
  ) {}
  async onSubmit(): Promise<void> {
    try {
      this.loading = true
      const email = this.signInForm.value.email as string
      const password = this.signInForm.value.password as string
      const { error } = await this.supabase.signIn(email,password)
      if (error) throw error
      console.log('logged in');
      this.router.navigate(['/']).then();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      this.signInForm.reset()
      this.loading = false
    }
  }
}
