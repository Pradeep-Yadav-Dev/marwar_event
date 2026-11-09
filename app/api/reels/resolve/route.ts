import { NextRequest, NextResponse } from "next/server";

interface ResolvedReelMedia {
  shortcode: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  embedUrl: string;
}

const cache = new Map<
  string,
  { data: ResolvedReelMedia; expiresAt: number }
>();

function unescapeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw
      .replace(/\\u0026/g, "&")
      .replace(/\\u003C/g, "<")
      .replace(/\\u003E/g, ">")
      .replace(/\\\//g, "/")
      .replace(/&amp;/g, "&");
  }
}

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&#x26;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&quot;/g, '"');
}

export function extractShortcode(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{5,25}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i
  );
  return match?.[1] || null;
}

function parseInstagramHtml(html: string): {
  videoUrl: string | null;
  thumbnailUrl: string | null;
} {
  let videoUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  // 1. Check contextJSON inside embed page
  const contextMatch = html.match(/"contextJSON"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (contextMatch?.[1]) {
    try {
      const decodedContext = JSON.parse(`"${contextMatch[1]}"`);
      const contextObj = JSON.parse(decodedContext);
      const media =
        contextObj?.gql_data?.shortcode_media ||
        contextObj?.gql_data?.xdt_shortcode_media ||
        contextObj?.shortcode_media;
      if (media) {
        if (typeof media.video_url === "string" && media.video_url) {
          videoUrl = media.video_url;
        }
        if (typeof media.display_url === "string" && media.display_url) {
          thumbnailUrl = media.display_url;
        } else if (
          typeof media.thumbnail_src === "string" &&
          media.thumbnail_src
        ) {
          thumbnailUrl = media.thumbnail_src;
        }
      }
    } catch {
      // Continue with regex extraction
    }
  }

  // 2. Check Polaris video_versions JSON array
  if (!videoUrl) {
    const versionsMatch = html.match(
      /"video_versions"\s*:\s*\[\s*\{[^[\]]*?"url"\s*:\s*"((?:\\.|[^"\\])+)"/
    );
    if (versionsMatch?.[1]) {
      videoUrl = unescapeJsonString(versionsMatch[1]);
    }
  }

  // 3. Check direct video_url property in page/embed scripts
  if (!videoUrl) {
    const directVideoMatch = html.match(
      /"video_url"\s*:\s*"(https?:\\?\/\\?\/(?:\\.|[^"\\])+)"/
    );
    if (directVideoMatch?.[1]) {
      videoUrl = unescapeJsonString(directVideoMatch[1]);
    }
  }

  // 4. Check og:video meta tags
  if (!videoUrl) {
    const ogVideoMatch =
      html.match(
        /<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::secure_url)?["']/i
      );
    if (ogVideoMatch?.[1]) {
      videoUrl = decodeHtmlEntities(ogVideoMatch[1]);
    }
  }

  // 5. Extract thumbnail image if not found yet
  if (!thumbnailUrl) {
    const embedImgMatch = html.match(
      /class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]+src=["']([^"']+)["']/i
    );
    if (embedImgMatch?.[1]) {
      thumbnailUrl = decodeHtmlEntities(embedImgMatch[1]);
    }
  }

  if (!thumbnailUrl) {
    const displayUrlMatch = html.match(
      /"display_url"\s*:\s*"(https?:\\?\/\\?\/(?:\\.|[^"\\])+)"/
    );
    if (displayUrlMatch?.[1]) {
      thumbnailUrl = unescapeJsonString(displayUrlMatch[1]);
    }
  }

  if (!thumbnailUrl) {
    const ogImgMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );
    if (ogImgMatch?.[1]) {
      thumbnailUrl = decodeHtmlEntities(ogImgMatch[1]);
    }
  }

  return { videoUrl, thumbnailUrl };
}

export async function GET(req: NextRequest) {
  const rawInput =
    req.nextUrl.searchParams.get("shortcode") ||
    req.nextUrl.searchParams.get("url") ||
    "";
  const shortcode = extractShortcode(rawInput);

  if (!shortcode) {
    return NextResponse.json(
      { success: false, message: "Invalid Instagram reel URL or shortcode" },
      { status: 400 }
    );
  }

  const now = Date.now();
  const cached = cache.get(shortcode);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ success: true, data: cached.data });
  }

  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;
  let videoUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  const endpoints = [
    {
      url: `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    {
      url: `https://www.instagram.com/reel/${shortcode}/embed/`,
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
    {
      url: `https://www.instagram.com/reel/${shortcode}/`,
      ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    },
  ];

  for (const ep of endpoints) {
    if (videoUrl && thumbnailUrl) break;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(ep.url, {
        headers: {
          "User-Agent": ep.ua,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        const parsed = parseInstagramHtml(html);
        if (!videoUrl && parsed.videoUrl) videoUrl = parsed.videoUrl;
        if (!thumbnailUrl && parsed.thumbnailUrl)
          thumbnailUrl = parsed.thumbnailUrl;
      }
    } catch {
      // Try next endpoint
    }
  }

  const proxiedVideoUrl = videoUrl
    ? `/api/reels/media?url=${encodeURIComponent(videoUrl)}`
    : null;
  const proxiedThumbnailUrl = thumbnailUrl
    ? `/api/reels/media?url=${encodeURIComponent(thumbnailUrl)}`
    : null;

  const resolved: ResolvedReelMedia = {
    shortcode,
    videoUrl: proxiedVideoUrl,
    thumbnailUrl: proxiedThumbnailUrl,
    embedUrl,
  };

  cache.set(shortcode, {
    data: resolved,
    expiresAt: now + (proxiedVideoUrl ? 15 * 60 * 1000 : 60 * 1000),
  });

  return NextResponse.json({
    success: true,
    data: resolved,
  });
}

