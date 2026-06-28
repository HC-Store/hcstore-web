import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigColecoes } from '../../colecoes/colecoes.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-config-colecoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-colecoes.component.html',
  styleUrls: ['./config-colecoes.component.css']
})
export class ConfigColecoesComponent implements OnInit {

  sucesso = '';
  erro = '';

  config: ConfigColecoes = {
    bannerImagem: 'assets/img/banner-colecoes.png',
    dropTitulo: 'DROP 01:',
    dropSubtitulo: 'OFF-GRID',
    dropDescricao: 'O OFF-GRID é um mergulho na textura brutalista da cidade.',
    dataLancamento: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarConfig();
  }

  carregarConfig(): void {
    this.api.getSiteConfig().subscribe({
      next: (res) => {
        if (res?.colecoes) {
          this.config = { ...this.config, ...res.colecoes };
        }
      },
      error: () => {
        this.erro = 'Erro ao carregar configurações das coleções.';
      }
    });
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    this.api.getSiteConfig().subscribe({
      next: (siteConfig) => {
        const body = {
          ...(siteConfig || {}),
          colecoes: this.config
        };

        this.api.salvarSiteConfig(body).subscribe({
          next: () => {
            this.sucesso = 'Configurações salvas com sucesso!';
            setTimeout(() => this.sucesso = '', 3000);
          },
          error: () => {
            this.erro = 'Erro ao salvar configurações.';
          }
        });
      },
      error: () => {
        this.erro = 'Erro ao buscar configuração atual.';
      }
    });
  }
}
