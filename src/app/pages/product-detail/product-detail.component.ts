import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

interface ProdutoCarrinho {
  name: string;
  price: number;
  size: string;
  qty: number;
  category: string;
  image: string;
}

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalsComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent {
  productName = 'ESSENTIALS "OFF-GRID" OVERSIZED TEE';
  productPrice = 189.9;
  productCategory = 'Camisetas';

  thumbnails: string[] = [
    'assets/image/miniatura1.png',
    'assets/image/miniatura2.png'
  ];

  mainImage: string = this.thumbnails[0];
  selectedSize: string = '';

  modalAberto: ModalTipo = null;

  accordionOpen = {
    material: false,
    lavagem: false,
    envio: true
  };

  trocarImagem(image: string): void {
    this.mainImage = image;
  }

  selecionarTamanho(size: string): void {
    this.selectedSize = size;
  }

  toggleAccordion(section: 'material' | 'lavagem' | 'envio'): void {
    const currentState = this.accordionOpen[section];

    this.accordionOpen = {
      material: false,
      lavagem: false,
      envio: false
    };

    this.accordionOpen[section] = !currentState;
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

  adicionarAoCarrinho(): void {
    if (!this.selectedSize) {
      alert('Selecione um tamanho.');
      return;
    }

    const product: ProdutoCarrinho = {
      name: this.productName,
      price: this.productPrice,
      size: this.selectedSize,
      qty: 1,
      category: this.productCategory,
      image: this.mainImage
    };

    const cart: ProdutoCarrinho[] = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Produto adicionado ao carrinho!');
  }
}
