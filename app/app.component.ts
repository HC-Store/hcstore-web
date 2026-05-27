import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getProdutos().subscribe({
      next: (res) => console.log('✅ Produtos:', res),
      error: (err) => console.error('❌ Erro:', err)
    });
  }
}
