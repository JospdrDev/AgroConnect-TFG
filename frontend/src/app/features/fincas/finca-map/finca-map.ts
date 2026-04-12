import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../shared/navbar/navbar';
import * as L from 'leaflet';

@Component({
  selector: 'app-finca-map',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './finca-map.html',
  styleUrl: './finca-map.css'
})
export class FincaMap implements OnInit, OnDestroy {
  private map!: L.Map;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([37.9922, -1.1307], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
