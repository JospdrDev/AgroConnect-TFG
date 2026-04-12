import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Navbar } from '../../../shared/navbar/navbar';
import { FincaService } from '../../../core/services/finca.service';
import { Finca } from '../../../core/models/finca';

@Component({
  selector: 'app-finca-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule,
    InputTextModule, TagModule, IconFieldModule, InputIconModule,
    Navbar
  ],
  templateUrl: './finca-list.html',
  styleUrl: './finca-list.css'
})
export class FincaListComponent implements OnInit {
  fincas: Finca[] = [];
  loading = true;

  constructor(private fincaService: FincaService) {}

  ngOnInit() {
    this.fincaService.getFincas().subscribe(data => {
      this.fincas = data;
      this.loading = false;
    });
  }
}
