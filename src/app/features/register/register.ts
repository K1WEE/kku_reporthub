import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Supabase } from '../../shared/services/supabase';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  fb = inject(FormBuilder);
  router = inject(Router);
  supabase = inject(Supabase); 

  signUpForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  })
  loading = false;
  errorMessage: string | null = null;

  constructor() {}
  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = null;

      const email = this.signUpForm.value.email as string;
      const password = this.signUpForm.value.password as string;

      // if (password !== confirmPassword) {
      //   this.errorMessage = 'Passwords do not match';
      //   return;
      // }

      console.log('Registering user:', email);
      console.log('Password:', password);

      const { error } = await this.supabase.signUp(email, password);
      if (error) {
        this.errorMessage = error.message;
        return;
      }

      alert('Registration successful! Please check your email for confirmation.');
      this.router.navigateByUrl('/login');
    } catch (error) {

    }
    // const rawForm = this.signUpForm.getRawValue();
    // this.supabase
    //   .register(rawForm.email, rawForm.username, rawForm.password)
    //   .subscribe((result) => {
    //     if (result.error) {
    //       this.errorMessage = result.error.message;
    //     } else {
    //       this.router.navigateByUrl('/');
    //     }
    //   });
  }
}
