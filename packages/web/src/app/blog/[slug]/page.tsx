import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

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

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
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
          <span>·</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-xl text-neutral-400">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-invert prose-neutral max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-brand-400 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800">
        {/* MDX content would be rendered here - for now using raw markdown */}
        <div
          dangerouslySetInnerHTML={{
            __html: post.content
              .replace(/^# .+\n/, "") // Remove first h1 since we have it in the header
              .replace(/\n## /g, '\n<h2 class="mt-12 mb-4">')
              .replace(/\n### /g, '\n<h3 class="mt-8 mb-3">')
              .replace(/\n\n/g, "</p><p>")
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.+?)\*/g, "<em>$1</em>")
              .replace(/^- (.+)$/gm, "<li>$1</li>")
              .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-6 my-4">$&</ul>')
              .replace(/---/g, '<hr class="my-12 border-neutral-800">')
          }}
        />
      </div>
    </article>
  );
}
