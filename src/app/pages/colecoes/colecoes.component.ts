import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-colecoes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalsComponent
  ],
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

  launchDate = new Date();

  constructor() {
    this.launchDate.setDate(this.launchDate.getDate() + 4);
    this.launchDate.setHours(12, 45, 9, 0);
  }

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  abrirLogin(): void {
    this.modalAberto = 'login';
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

  private formatNumber(number: number): string {
    return String(number).padStart(2, '0');
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.launchDate.getTime() - now;

    if (distance <= 0) {
      this.meses = '00';
      this.dias = '00';
      this.horas = '00';
      this.minutos = '00';
      this.segundos = '00';
      return;
    }

    const totalDays = Math.floor(distance / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    this.meses = this.formatNumber(months);
    this.dias = this.formatNumber(days);
    this.horas = this.formatNumber(hours);
    this.minutos = this.formatNumber(minutes);
    this.segundos = this.formatNumber(seconds);
  }
}
