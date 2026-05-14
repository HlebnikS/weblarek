import { IProduct } from "../../../types/index";

export class ProductCatalog {
  protected products: IProduct[] = [];
  protected preview: IProduct | null = null;

  setProducts(products: IProduct[]): void {
    this.products = products;
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProduct(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }

  setPreview(product: IProduct): void {
    this.preview = product;
  }

  getPreview(): IProduct | null {
    return this.preview;
  }
}
