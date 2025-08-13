import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-form',
  templateUrl: './auth-form.html',
  styleUrls: ['./auth-form.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AuthFormComponent {
  @Input() title: string = '';
  @Input() buttonText: string = '';
  @Input() showLinkText: string = '';
  @Input() showLinkRoute: string = '';
  @Input() showLinkLabel: string = '';
  @Input() error: string = '';

  @Output() formSubmit = new EventEmitter<{ email: string; password: string }>();

  email = '';
  password = '';

  submit() {
    this.formSubmit.emit({ email: this.email, password: this.password });
  }
}
