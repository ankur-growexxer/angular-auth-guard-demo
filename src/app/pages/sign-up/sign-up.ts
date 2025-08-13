import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth'
import { AuthFormComponent } from '../../auth-form/auth-form';

@Component({
  standalone: true,
  selector: 'app-sign-up',
  template: `
    <app-auth-form
      [title]="'Sign Up'"
      [buttonText]="'Register'"
      [showLinkText]="'Already registered?'"
      [showLinkRoute]="'/sign-in'"
      [showLinkLabel]="'Sign In'"
      [error]="error"
      (formSubmit)="signUp($event)"
    ></app-auth-form>
  `,
  imports: [AuthFormComponent],
})
export class SignUpComponent {
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  signUp($event: { email: string; password: string }) {
    const { email, password } = $event;
    const success = this.authService.register(email, password);
    success.subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Registration failed. Please try again.';
      }
    });
  }
}
