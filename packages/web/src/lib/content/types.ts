export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingTime?: string;
  tool?: string; // e.g., "RunwayCalculator", "CardOptimizer"
}

export interface Post extends PostMeta {
  content: string;
}

export interface ContentProvider {
  getAllPosts(): PostMeta[];
  getPostBySlug(slug: string): Post | null;
  getAllPostSlugs(): string[];
}
