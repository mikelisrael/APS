import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  let url = "";

  try {
    url = req.nextUrl.searchParams.get("url") || "";
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; APS/1.0; +http://localhost)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({
        title: url,
        description: "Link preview not available",
        image: "",
        url
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      $("h1").first().text() ||
      url;

    let description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    let image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('link[rel="image_src"]').attr("href") ||
      "";

    if (image && !image.startsWith("http")) {
      const siteUrl = new URL(url);
      image = image.startsWith("/")
        ? `${siteUrl.protocol}//${siteUrl.host}${image}`
        : `${siteUrl.protocol}//${siteUrl.host}/${image}`;
    }

    return NextResponse.json({
      title: title.trim() || "No title available",
      description: description.trim() || "No description available",
      image: image || "",
      url
    });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return NextResponse.json({
      title: url,
      description: "Preview unavailable",
      image: "",
      url
    });
  }
}
