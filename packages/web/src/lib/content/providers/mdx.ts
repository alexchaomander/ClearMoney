import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentProvider, Post, PostMeta } from "../types";

const postsDirectory = path.join(process.cwd(), "src/content/blog");

function ensureDirectoryExists() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

function loadPostMeta(fileName: string): PostMeta {
  const slug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title || "Untitled",
    description: data.description || "",
    date: data.date || new Date().toISOString(),
    author: data.author || "ClearMoney Team",
    tags: data.tags || [],
    readingTime: data.readingTime,
    tool: data.tool,
  };
}

export function getMdxProvider(): ContentProvider {
  return {
    getAllPosts(): PostMeta[] {
      ensureDirectoryExists();
      const fileNames = fs.readdirSync(postsDirectory);
      const allPosts = fileNames
        .filter((fileName) => fileName.endsWith(".mdx"))
        .map(loadPostMeta);

      return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1));
    },

    getPostBySlug(slug: string): Post | null {
      ensureDirectoryExists();
      try {
        const fullPath = path.join(postsDirectory, `${slug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
          slug,
          title: data.title || "Untitled",
          description: data.description || "",
          date: data.date || new Date().toISOString(),
          author: data.author || "ClearMoney Team",
          tags: data.tags || [],
          readingTime: data.readingTime,
          tool: data.tool,
          content,
        };
      } catch {
        return null;
      }
    },

    getAllPostSlugs(): string[] {
      ensureDirectoryExists();
      const fileNames = fs.readdirSync(postsDirectory);
      return fileNames
        .filter((fileName) => fileName.endsWith(".mdx"))
        .map((fileName) => fileName.replace(/\.mdx$/, ""));
    },
  };
}
