import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  sizes = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44'];
  selectedSizes: string[] = [];

  images: string[] = [];

  toggleSize(size: string) {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    } else {
      this.selectedSizes.push(size);
    }
  }

  onMultipleSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) return;

    Array.from(files).forEach((file) => {
      this.readFile(file);
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    const files = event.dataTransfer?.files;

    if (!files) return;

    Array.from(files).forEach((file) => {
      this.readFile(file);
    });
  }

  readFile(file: File) {
    if (!file.type.startsWith('image/')) return;

    if (this.images.length >= 5) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.images.push(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }
}
