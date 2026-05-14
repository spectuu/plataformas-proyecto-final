/** A product row as stored in the Supabase `products` table. */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  stock: number;
  created_at: string;
}

/** Fields accepted when creating or updating a product from the admin portal. */
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
}

/** Number of products shown per page in the public catalog. */
export const PAGE_SIZE = 8;

/** Supabase Storage bucket that holds product images. */
export const IMAGE_BUCKET = "product-images";
