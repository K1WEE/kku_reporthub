import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'kku_reporthub';

}
