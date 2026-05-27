import { Component, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  platformId = inject(PLATFORM_ID);
  chart: any;

  // 🔥 PRODUTOS (FALTAVA)
  products = [
    {
      name: 'Adidas Ultra boost',
      price: 126.5,
      sales: 999,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'
    },
    {
      name: 'Nike Air Max',
      price: 149.9,
      sales: 850,
      image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=100'
    }
  ];

  // 🔥 MODAL
  showReport = false;

  openReport() {
    this.showReport = true;
  }

  closeReport() {
    this.showReport = false;
  }

  // 🔥 PEDIDOS (FALTAVA)
  orders = [
    {
      product: 'Adidas Ultra boost',
      id: 25426,
      date: 'Jan 8th, 2022',
      name: 'Leo Gouse',
      status: 'Entrega',
      price: 200
    },
    {
      product: 'Nike Air Max',
      id: 25425,
      date: 'Jan 7th, 2022',
      name: 'Jaxson Korsgaard',
      status: 'Cancelado',
      price: 180
    }
  ];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  createChart() {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Vendas',
          data: [10, 30, 20, 40, 25, 50],
          backgroundColor: '#25df14',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#eee' } }
        }
      }
    });
  }

}
