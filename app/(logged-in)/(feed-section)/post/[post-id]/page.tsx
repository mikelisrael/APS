import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import PostDetail from "./post-detail";

interface PageProps {
  params: {
    "post-id": string;
  };
}

async function getPost(postId: string) {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:users!posts_created_by_fkey(id, full_name, avatar_url, username),
      attachments:post_attachments!post_attachments_post_id_fkey(*)
    `
    )
    .eq("id", postId)
    .single();

  return post;
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const postId = params["post-id"];

  try {
    const post = await getPost(postId);

    if (!post) {
      return {
        title: "Post Not Found"
      };
    }

    const firstImage = post.attachments?.[0]?.file_url;

    const description =
      post.content?.slice(0, 160) ||
      post.title ||
      `Post by ${post.author?.full_name || "Unknown User"}`;

    const title =
      post.title ||
      `${post.kind === "event" ? "Event" : post.kind === "article" ? "Article" : "Post"} by ${post.author?.full_name || "Unknown User"}`;

    const siteUrl = "https://uicsproject.vercel.app";
    const postUrl = `${siteUrl}/post/${postId}`;
    // this is how it looks on the address bar when you open a post
    // https://uicsproject.vercel.app/post/f064128b-2d5d-4ca7-af2c-2b61260ff7b5

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: postUrl,
        siteName: "UICS Connect",
        images: firstImage
          ? [
              {
                url: firstImage,
                width: 1200,
                height: 630,
                alt: title
              }
            ]
          : [],
        locale: "en_US",
        type: "article",
        publishedTime: post.created_at,
        authors: [post.author?.full_name || "Unknown User"]
      },
      twitter: {
        card: firstImage ? "summary_large_image" : "summary",
        title,
        description,
        images: firstImage ? [firstImage] : [],
        creator: post.author?.username ? `@${post.author.username}` : undefined
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Post"
    };
  }
}

export default function Page() {
  return <PostDetail />;
}
