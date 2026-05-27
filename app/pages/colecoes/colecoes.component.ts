import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

type ModalTipo = 'login' | 'register' | 'cart' | 'profileWelcome' | 'profileEdit' | null;

export interface ConfigColecoes {
  bannerImagem: string;
  dropTitulo: string;
  dropSubtitulo: string;
  dropDescricao: string;
  dataLancamento: string;
}

@Component({
  selector: 'app-colecoes',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
  templateUrl: './colecoes.component.html',
  styleUrls: ['./colecoes.component.css']
})
export class ColecoesComponent implements OnInit, OnDestroy {
  modalAberto: ModalTipo = null;

  meses = '00';
  dias = '00';
  horas = '00';
  minutos = '00';
  segundos = '00';

  private intervalId: ReturnType<typeof setInterval> | null = null;

  config: ConfigColecoes = {
    bannerImagem: 'assets/img/banner-colecoes.png',
    dropTitulo: 'DROP 01:',
    dropSubtitulo: 'OFF-GRID',
    dropDescricao: 'O OFF-GRID é um mergulho na textura brutalista da cidade. Criamos uma fusão entre a estética utilitária das ruas e o acabamento premium.',
    dataLancamento: ''
  };

  launchDate = new Date();

  ngOnInit(): void {
    const salvo = localStorage.getItem('configColecoes');
    if (salvo) {
      this.config = { ...this.config, ...JSON.parse(salvo) };
    }

    if (this.config.dataLancamento) {
      this.launchDate = new Date(this.config.dataLancamento);
    } else {
      this.launchDate = new Date();
      this.launchDate.setMonth(this.launchDate.getMonth() + 1);
      this.launchDate.setHours(12, 45, 9, 0);
    }

    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
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

  private formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }

  private updateCountdown(): void {
    const distance = this.launchDate.getTime() - new Date().getTime();

    if (distance <= 0) {
      this.meses = this.dias = this.horas = this.minutos = this.segundos = '00';
      return;
    }

    const totalDays = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.meses = this.formatNumber(Math.floor(totalDays / 30));
    this.dias = this.formatNumber(totalDays % 30);
    this.horas = this.formatNumber(Math.floor((distance / (1000 * 60 * 60)) % 24));
    this.minutos = this.formatNumber(Math.floor((distance / (1000 * 60)) % 60));
    this.segundos = this.formatNumber(Math.floor((distance / 1000) % 60));
  }
}