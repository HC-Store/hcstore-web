import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigHome, DestaqueProduto } from '../../home/home.component';

@Component({
  selector: 'app-config-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-home.component.html',
  styleUrls: ['./config-home.component.css']
})
export class ConfigHomeComponent implements OnInit {

  sucesso = '';
  erro = '';

  config: ConfigHome = {
    videoUrl: 'assets/video/banner-home.mp4',
    banner1: 'assets/img/nikegreen.jpg',
    banner2: 'assets/img/brinco.jpg',
    banner3: 'assets/img/baseball.webp',
    destaques: [
      { id: 1, titulo: 'CALÇA CARGO OVERSIZED', imagem: 'assets/img/calça.png' },
      { id: 2, titulo: 'CALÇA ALFAIATARIA', imagem: 'assets/img/outfit.png' },
      { id: 3, titulo: "CONJUNTOS OVERSIZED's", imagem: 'assets/img/oversized.png' }
    ],
    lancamentos: [
      { id: 4, titulo: 'Lançamento 1', imagem: 'assets/img/baseball.webp' },
      { id: 5, titulo: 'Lançamento 2', imagem: 'assets/img/outfit.png' }
    ]
  };

  ngOnInit(): void {
    const salvo = localStorage.getItem('configHome');
    if (salvo) {
      this.config = { ...this.config, ...JSON.parse(salvo) };
    }
  }

  salvar(): void {
    try {
      localStorage.setItem('configHome', JSON.stringify(this.config));
      this.sucesso = 'Configurações salvas com sucesso!';
      setTimeout(() => this.sucesso = '', 3000);
    } catch {
      this.erro = 'Erro ao salvar configurações.';
    }
  }

  adicionarDestaque(): void {
    this.config.destaques.push({ id: 0, titulo: '', imagem: '' });
  }

  removerDestaque(index: number): void {
    this.config.destaques.splice(index, 1);
  }

  adicionarLancamento(): void {
    this.config.lancamentos.push({ id: 0, titulo: '', imagem: '' });
  }

  removerLancamento(index: number): void {
    this.config.lancamentos.splice(index, 1);
  }
}
