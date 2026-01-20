import { Component } from '@angular/core';
import { Navbar } from './shared/navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Navbar, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'AgroConnect';
}