import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { FincaService } from '../../core/services/finca.service';
import { Finca } from '../../core/models/finca';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  fincas: Finca[] = [];
  loading = true;

  totalFincas = 0;
  totalHectareas = 0;
  cultivosActivos = 0;
  alertasPendientes = 3;

  // Datos para gráficas
  evolutionChartData: any;
  distributionChartData: any;

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(139,195,74,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(139,195,74,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } },
        beginAtZero: true
      }
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 4, hoverRadius: 6 }
    }
  };

  doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255,255,255,0.7)',
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
          padding: 15
        }
      }
    }
  };

  constructor(private fincaService: FincaService) { }

  ngOnInit() {
    this.fincaService.getFincas().subscribe(data => {
      this.fincas = data;
      this.calculateStats();
      this.initCharts();
      this.loading = false;
    });
  }

  calculateStats() {
    this.totalFincas = this.fincas.length;
    this.totalHectareas = this.fincas.reduce((sum, f) => sum + f.hectareas, 0);
    this.cultivosActivos = new Set(this.fincas.map(f => f.cultivo)).size;
  }

  initCharts() {
    // Agrupar hectáreas por cultivo
    const cultivoMap = new Map<string, number>();
    this.fincas.forEach(f => {
      cultivoMap.set(f.cultivo, (cultivoMap.get(f.cultivo) || 0) + f.hectareas);
    });

    const labels = Array.from(cultivoMap.keys());
    const values = Array.from(cultivoMap.values());

    // Gráfica de distribución (doughnut)
    this.distributionChartData = {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#4CAF50',
          '#8BC34A',
          '#66BB6A',
          '#388E3C',
          '#81C784',
          '#2E7D32'
        ],
        borderWidth: 0
      }]
    };

    // Gráfica de evolución - datos reales basados en histórico mock
    const currentTotal = this.totalHectareas;
    const sixMonthsAgo = currentTotal * 0.77; // ~120 ha
    const growth = (currentTotal - sixMonthsAgo) / 5;

    this.evolutionChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Hectáreas',
        data: [
          Math.round(sixMonthsAgo),
          Math.round(sixMonthsAgo + growth),
          Math.round(sixMonthsAgo + growth * 2),
          Math.round(sixMonthsAgo + growth * 3),
          Math.round(sixMonthsAgo + growth * 4),
          currentTotal
        ],
        borderColor: '#8BC34A',
        backgroundColor: 'rgba(139, 195, 74, 0.1)',
        fill: true,
        borderWidth: 2
      }]
    };
  }

  get recentFincas(): Finca[] {
    return this.fincas.slice(0, 5);
  }
}
