import type { ContentProvider } from "../types";

export function getCmsProvider(): ContentProvider {
  return {
    getAllPosts() {
      return [];
    },
    getPostBySlug() {
      return null;
    },
    getAllPostSlugs() {
      return [];
    },
  };
}
