import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - Honest Takes on Credit Cards & Points",
  description:
    "Unbiased opinions on credit cards, points valuations, and the rewards industry. No affiliate bias, no fluff - just honest analysis.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white">Blog</h1>
        <p className="mt-4 text-lg text-neutral-400">
          Honest takes on credit cards, points, and the rewards industry.
          No affiliate bias. No 3,000-word articles for simple questions.
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-neutral-400">
              No posts yet. Check back soon for our launch content!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="group transition-all hover:border-neutral-700 hover:bg-neutral-900/80">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        {post.readingTime && (
                          <>
                            <span>·</span>
                            <span>{post.readingTime}</span>
                          </>
                        )}
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-white group-hover:text-brand-400">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                        {post.description}
                      </p>
                      {post.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-all group-hover:bg-brand-600 group-hover:text-white">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
