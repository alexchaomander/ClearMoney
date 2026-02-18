import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogPageClient } from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog - Independent Research & Analysis",
  description:
    "Unbiased opinions on credit cards, points valuations, and the rewards industry. No affiliate bias, no fluff - just honest analysis.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogPageClient posts={posts} />;
}
