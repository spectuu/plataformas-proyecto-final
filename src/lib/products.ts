import { supabaseBrowser } from "./supabase-browser";
import { IMAGE_BUCKET, type Product, type ProductInput } from "./types";

/**
 * Client-side product data access used by the admin portal.
 * Every call goes through the anon key + RLS, so it only succeeds for a
 * logged-in admin (writes) or anyone (reads).
 */

/** Fetch every product, newest first. */
export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabaseBrowser
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Upload an image file to Supabase Storage and return its public URL.
 * Files are given a random name to avoid collisions.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseBrowser.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  return supabaseBrowser.storage.from(IMAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

/**
 * Best-effort deletion of a product image from Storage.
 * Parses the storage path out of the public URL. Errors are swallowed: a
 * leftover image is harmless and must never block deleting the product row.
 */
export async function deleteImage(publicUrl: string | null): Promise<void> {
  if (!publicUrl) return;
  const marker = `/${IMAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;
  const path = publicUrl.slice(index + marker.length);
  await supabaseBrowser.storage.from(IMAGE_BUCKET).remove([path]);
}

/** Create a new product row. */
export async function createProduct(input: ProductInput): Promise<void> {
  const { error } = await supabaseBrowser.from("products").insert(input);
  if (error) throw error;
}

/** Update an existing product row by id. */
export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<void> {
  const { error } = await supabaseBrowser
    .from("products")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

/** Delete a product row by id. */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabaseBrowser.from("products").delete().eq("id", id);
  if (error) throw error;
}
