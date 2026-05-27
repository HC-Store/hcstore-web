import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigColecoes } from '../../colecoes/colecoes.component';

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

  ngOnInit(): void {
    const salvo = localStorage.getItem('configColecoes');
    if (salvo) {
      this.config = { ...this.config, ...JSON.parse(salvo) };
    }
  }

  salvar(): void {
    try {
      localStorage.setItem('configColecoes', JSON.stringify(this.config));
      this.sucesso = 'Configurações salvas com sucesso!';
      setTimeout(() => this.sucesso = '', 3000);
    } catch {
      this.erro = 'Erro ao salvar configurações.';
    }
  }
}
