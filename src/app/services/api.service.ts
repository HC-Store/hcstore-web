import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // AUTENTICAÇÃO
  register(body: any): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, body);
  }

  login(body: any): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, body);
  }

  enviarCodigoRecuperacao(body: any): Observable<any> {
    return this.http.post(`${this.base}/auth/forgot-password`, body);
  }

  confirmarCodigoRecuperacao(body: any): Observable<any> {
    return this.http.post(`${this.base}/auth/verify-reset-code`, body);
  }

  redefinirSenha(body: any): Observable<any> {
    return this.http.post(`${this.base}/auth/reset-password`, body);
  }

  // USUÁRIOS
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.base}/usuarios`, {
      headers: this.headers()
    });
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.base}/usuarios/${id}`, {
      headers: this.headers()
    });
  }

  createUsuario(body: any): Observable<any> {
    return this.http.post(`${this.base}/usuarios`, body, {
      headers: this.headers()
    });
  }

  updateUsuario(id: number, body: any): Observable<any> {
    return this.http.put(`${this.base}/usuarios/${id}`, body, {
      headers: this.headers()
    });
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.patch(`${this.base}/usuarios/${id}/desativar`, {}, {
      headers: this.headers()
    });
  }

  // PRODUTOS
  getProdutos(): Observable<any> {
    return this.http.get(`${this.base}/produtos`);
  }

  createProduto(body: any): Observable<any> {
    return this.http.post(`${this.base}/produtos`, body, {
      headers: this.headers()
    });
  }

  updateProduto(id: number, body: any): Observable<any> {
    return this.http.patch(`${this.base}/produtos/${id}`, body, {
      headers: this.headers()
    });
  }

  deleteProduto(id: number): Observable<any> {
    return this.http.delete(`${this.base}/produtos/${id}`, {
      headers: this.headers()
    });
  }

  // IMAGEM PRODUTO
  getProdutoImagens(): Observable<any> {
    return this.http.get(`${this.base}/produto-imagem`, {
      headers: this.headers()
    });
  }

  createProdutoImagem(body: any): Observable<any> {
    return this.http.post(`${this.base}/produto-imagem`, body, {
      headers: this.headers()
    });
  }

  deleteProdutoImagem(id: number): Observable<any> {
    return this.http.delete(`${this.base}/produto-imagem/${id}`, {
      headers: this.headers()
    });
  }

  // CATEGORIAS
  getCategorias(): Observable<any> {
    return this.http.get(`${this.base}/categorias`);
  }

  createCategoria(body: any): Observable<any> {
    return this.http.post(`${this.base}/categorias`, body, {
      headers: this.headers()
    });
  }

  // CARRINHO
  getCarrinho(): Observable<any> {
    return this.http.get(`${this.base}/carrinho`, {
      headers: this.headers()
    });
  }

  getCarrinhoById(id: number): Observable<any> {
    return this.http.get(`${this.base}/carrinho/${id}`, {
      headers: this.headers()
    });
  }

  createCarrinho(body: any): Observable<any> {
    return this.http.post(`${this.base}/carrinho`, body, {
      headers: this.headers()
    });
  }

  // ITEM CARRINHO
  getItensCarrinho(): Observable<any> {
    return this.http.get(`${this.base}/itemcarrinho`, {
      headers: this.headers()
    });
  }

  addItemCarrinho(body: any): Observable<any> {
    return this.http.post(`${this.base}/itemcarrinho`, body, {
      headers: this.headers()
    });
  }

  deleteItemCarrinho(id: number): Observable<any> {
    return this.http.delete(`${this.base}/itemcarrinho/${id}`, {
      headers: this.headers()
    });
  }

  // ENDEREÇOS
  getEnderecos(): Observable<any> {
    return this.http.get(`${this.base}/enderecos`, {
      headers: this.headers()
    });
  }

  createEndereco(body: any): Observable<any> {
    return this.http.post(`${this.base}/enderecos`, body, {
      headers: this.headers()
    });
  }

  // PEDIDOS
  getPedidos(): Observable<any> {
    return this.http.get(`${this.base}/pedidos`, {
      headers: this.headers()
    });
  }

  createPedido(body: any): Observable<any> {
    return this.http.post(`${this.base}/pedidos`, body, {
      headers: this.headers()
    });
  }

  updatePedido(id: number, body: any): Observable<any> {
    return this.http.patch(`${this.base}/pedidos/${id}`, body, {
      headers: this.headers()
    });
  }
  uploadImagem(body: FormData): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
  return this.http.post(`${this.base}/upload`, body, { headers });
}

getCupons(): Observable<any> {
  return this.http.get(`${this.base}/cupons`, {
    headers: this.headers()
  });
}

createCupom(body: any): Observable<any> {
  return this.http.post(`${this.base}/cupons`, body, {
    headers: this.headers()
  });
}

validarCupom(body: any): Observable<any> {
  return this.http.post(`${this.base}/cupons/validar`, body);
}

criarCheckoutPagBank(body: any): Observable<any> {
  return this.http.post(`${this.base}/pagamentos/checkout`, body, {
    headers: this.headers()
  });
}
}
