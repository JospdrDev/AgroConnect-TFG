import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-finca-map',
  standalone: true,
  templateUrl: './finca-map.html',
  styleUrl: './finca-map.css'
})
export class FincaMap implements OnInit {
  private map: any;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Coordenadas de Murcia
    this.map = L.map('map').setView([37.9922, -1.1307], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }
}