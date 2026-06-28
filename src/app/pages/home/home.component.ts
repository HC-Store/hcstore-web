import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';

type ModalTipo = 'login' | 'register' | 'cart' | 'profileWelcome' | 'profileEdit' | null;

export interface DestaqueProduto {
  id: number;
  titulo: string;
  imagem: string;
}

export interface ConfigHome {
  videoUrl: string;
  banner1: string;
  banner2: string;
  banner3: string;
  destaques: DestaqueProduto[];
  lancamentos: DestaqueProduto[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  modalAberto: ModalTipo = null;
  indiceLancamento = 0;

  config: ConfigHome = {
    videoUrl: 'assets/video/banner-home.mp4',
    banner1: 'assets/img/nikegreen.jpg',
    banner2: 'assets/img/brinco.jpg',
    banner3: 'assets/img/baseball.webp',
    destaques: [],
    lancamentos: []
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarConfigHome();
  }

  private carregarConfigHome(): void {
    this.api.getSiteConfig().subscribe({
      next: (res) => {
        if (res?.home) {
          this.config = {
            ...this.config,
            ...res.home,
            destaques: Array.isArray(res.home.destaques) ? res.home.destaques : [],
            lancamentos: Array.isArray(res.home.lancamentos) ? res.home.lancamentos : []
          };
        }

        this.indiceLancamento = 0;
      },
      error: (err) => {
        console.error('Erro ao carregar configurações da Home:', err);
      }
    });
  }

  get lancamentosVisiveis(): DestaqueProduto[] {
    const lancamentos = this.config.lancamentos || [];

    if (lancamentos.length <= 2) {
      return lancamentos;
    }

    return [
      lancamentos[this.indiceLancamento],
      lancamentos[(this.indiceLancamento + 1) % lancamentos.length]
    ];
  }

  anteriorLancamento(): void {
    const total = this.config.lancamentos.length;
    if (total <= 2) return;

    this.indiceLancamento = (this.indiceLancamento - 1 + total) % total;
  }

  proximoLancamento(): void {
    const total = this.config.lancamentos.length;
    if (total <= 2) return;

    this.indiceLancamento = (this.indiceLancamento + 1) % total;
  }

  abrirLogin(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token || user) {
      this.modalAberto = 'profileWelcome';
    } else {
      this.modalAberto = 'login';
    }
  }

  abrirRegister(): void {
    this.modalAberto = 'register';
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fecharModal(): void {
    this.modalAberto = null;
  }
}
