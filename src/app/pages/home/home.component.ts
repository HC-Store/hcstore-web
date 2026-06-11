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

  config: ConfigHome = {
    videoUrl: 'assets/video/banner-home.mp4',
    banner1: 'assets/img/nikegreen.jpg',
    banner2: 'assets/img/brinco.jpg',
    banner3: 'assets/img/baseball.webp',
    destaques: [],
    lancamentos: [
      { id: 4, titulo: 'Lançamento 1', imagem: 'assets/img/baseball.webp' },
      { id: 5, titulo: 'Lançamento 2', imagem: 'assets/img/outfit.png' }
    ]
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const salvo = localStorage.getItem('configHome');
    if (salvo) {
      this.config = { ...this.config, ...JSON.parse(salvo) };
    }

    this.carregarDestaquesBanco();
  }

  private carregarDestaquesBanco(): void {
    this.api.getProdutos().subscribe({
      next: (res) => {
        const produtos = Array.isArray(res) ? res : [];

        this.config.destaques = produtos
          .filter((produto: any) => produto?.id && produto?.nome)
          .slice(0, 3)
          .map((produto: any) => ({
            id: produto.id,
            titulo: produto.nome,
            imagem: produto.imagens?.[0]?.url || produto.imagem || 'assets/img/sem-imagem.png'
          }));
      },
      error: (err) => console.error('Erro ao carregar destaques da home:', err)
    });
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

  abrirRegister(): void { this.modalAberto = 'register'; }
  abrirCart(): void { this.modalAberto = 'cart'; }
  fecharModal(): void { this.modalAberto = null; }
}
