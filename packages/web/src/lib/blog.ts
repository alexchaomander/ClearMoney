import { getContentProvider } from "@/lib/content/provider";
import type { Post, PostMeta } from "@/lib/content/types";

const provider = getContentProvider();

export type { Post, PostMeta };

export function getAllPosts(): PostMeta[] {
  return provider.getAllPosts();
}

export function getPostBySlug(slug: string): Post | null {
  return provider.getPostBySlug(slug);
}

export function getAllPostSlugs(): string[] {
  return provider.getAllPostSlugs();
}
