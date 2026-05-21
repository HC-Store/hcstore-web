import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private api: ApiService, private router: Router) {}

login(email: string, senha: string) {
  return this.api.login({ email, senha }).pipe(
    tap((res: any) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    })
  );
}

register(nome: string, sobrenome: string, email: string, senha: string, cpf: string, telefone: string, sexo: string, dataNascimento: string) {
  return this.api.register({ nome, sobrenome, email, senha, cpf, telefone, sexo, dataNascimento });
}

  logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') ||
      localStorage.getItem('usuarioLogado') === 'true' ||
      !!localStorage.getItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
