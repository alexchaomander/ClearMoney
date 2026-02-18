import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog";
import { categories } from "@/lib/site-config";
import { BlogPostClient } from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Try matching each tag against known categories (tags may not be in category-id format)
  const category = post.tags.reduce<(typeof categories)[number] | undefined>(
    (found, tag) => found || categories.find((c) => c.id === tag.toLowerCase().replace(/\s+/g, "-")),
    undefined,
  ) || categories[0];
  const colorMap: Record<string, string> = {
    brand: "#0ea5e9",
    emerald: "#10b981",
    violet: "#8b5cf6",
    sky: "#0ea5e9",
    amber: "#f59e0b",
    rose: "#f43f5e",
    purple: "#a855f7",
  };
  const accentColor = (category?.color && colorMap[category.color]) || "#10b981";
  const categoryName = category?.name || post.tags[0] || "General";

  return (
    <BlogPostClient
      post={post}
      accentColor={accentColor}
      categoryName={categoryName}
    />
  );
}
