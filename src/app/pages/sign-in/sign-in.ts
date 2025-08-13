import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth'
import { AuthFormComponent } from '../../auth-form/auth-form';

@Component({
  standalone: true,
  selector: 'app-sign-in',
  template: `
    <app-auth-form
      [title]="'Sign In'"
      [buttonText]="'Login'"
      [showLinkText]="'New user?   '"
      [showLinkRoute]="'/sign-up'"
      [showLinkLabel]="'Sign Up'"
      [error]="error"
      (formSubmit)="signIn($event)"
    ></app-auth-form>
  `,
  imports: [AuthFormComponent],
})
export class SignInComponent {
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  signIn({ email, password }: { email: string; password: string }) {
    const token = this.authService.login(email, password);
    token.subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Invalid email or password';
      }
    });
  }
}
