export interface IRedirect {
  from: string; // e.g. /old-product-url
  to: string; // e.g. /products/new-slug
  statusCode: 301 | 302;
  note?: string;
  hitCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
