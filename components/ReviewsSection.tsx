"use client";

import { useCallback, useEffect, useState } from "react";

export interface ReviewDisplayItem {
  id?: number;
  initials: string;
  bg: string;
  text: string;
  name: string;
  meta: string;
  quote: string;
  rating: number;
}

const AVATAR_PALETTE = [
  { bg: "#fde2e4", text: "#5c1624" },
  { bg: "#fde6b8", text: "#4a2c0a" },
  { bg: "#cdece6", text: "#0f3d36" },
  { bg: "#e6dffb", text: "#351b66" },
];

interface RawReviewRecord {
  id?: number;
  initials?: string | null;
  name?: string;
  event?: string;
  meta?: string;
  quote?: string;
  rating?: number;
  status?: string;
}

function mapRawReviews(rawList: RawReviewRecord[]): ReviewDisplayItem[] {
  return rawList
    .filter((r) => r && (r.status === undefined || r.status === "active"))
    .map((rev, idx) => {
      const tone = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
      const nameStr = String(rev.name || "Royal Guest").trim();
      const derivedInitials =
        (rev.initials && String(rev.initials).trim()) ||
        nameStr
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("") ||
        "ME";
      return {
        id: rev.id ?? idx + 1,
        initials: derivedInitials,
        bg: tone.bg,
        text: tone.text,
        name: nameStr,
        meta: rev.event || rev.meta || "Royal Celebration • Rajasthan",
        quote: rev.quote || "",
        rating: Math.min(5, Math.max(1, Number(rev.rating) || 5)),
      };
    });
}

export default function ReviewsSection({
  initialReviews,
}: {
  initialReviews: ReviewDisplayItem[];
}) {
  const [memoirs, setMemoirs] = useState<ReviewDisplayItem[]>(initialReviews);

  const refreshReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?status=active", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setMemoirs(mapRawReviews(json.data as RawReviewRecord[]));
        }
      }
    } catch {
      // Keep current reviews on network error
    }
  }, []);

  useEffect(() => {
    const initId = window.requestAnimationFrame(() => {
      void refreshReviews();
    });

    const onUpdate = () => {
      void refreshReviews();
    };
    window.addEventListener("marwar:admin-updated", onUpdate);
    window.addEventListener("focus", onUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("marwar_site_settings");
      bc.onmessage = () => {
        void refreshReviews();
      };
    } catch {}

    return () => {
      window.cancelAnimationFrame(initId);
      window.removeEventListener("marwar:admin-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
      try {
        bc?.close();
      } catch {}
    };
  }, [refreshReviews]);

  if (memoirs.length === 0) return null;

  // Repeat base items enough times so each half of the infinite marquee fills wide screens
  const minCardsPerHalf = 4;
  const halfTrack: ReviewDisplayItem[] = [];
  while (halfTrack.length < minCardsPerHalf) {
    halfTrack.push(...memoirs);
  }
  const trackItems = [...halfTrack, ...halfTrack];

  const avgRating = (
    memoirs.reduce((sum, item) => sum + (item.rating || 5), 0) / memoirs.length
  ).toFixed(1);

  return (
    <section id="memoirs" className="memoirs-section scroll-mt-20">
      <div className="memoirs-head-wrap">
        <div className="memoirs-head">
          <div>
            <p className="memoirs-eyebrow">आशीर्वाद व स्नेह</p>
            <h2 className="memoirs-title">Memoirs of Royal Hospitality</h2>
          </div>

          <div className="memoirs-rating">
            <span
              className="memoirs-stars"
              aria-label={`${avgRating} out of 5 stars`}
            >
              {[0, 1, 2, 3, 4].map((idx) => (
                <svg
                  key={idx}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </span>
            <span className="memoirs-standard">
              {avgRating} HISTORIC STANDARD
            </span>
          </div>
        </div>
      </div>

      <div
        className="memoirs-viewport"
        aria-label="Client testimonials auto-sliding carousel"
      >
        <div className="memoirs-track">
          {trackItems.map((item, idx) => (
            <article
              key={`${item.id ?? item.initials}-${idx}`}
              className="memoirs-card"
            >
              <div>
                <div
                  className="memoirs-stars"
                  style={{ marginBottom: "0.75rem" }}
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <svg
                      key={starIdx}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={starIdx < item.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="memoirs-quote">“{item.quote}”</p>
              </div>

              <div className="memoirs-author">
                <span
                  className="memoirs-avatar"
                  style={{ backgroundColor: item.bg, color: item.text }}
                >
                  {item.initials}
                </span>
                <div>
                  <p className="memoirs-name">{item.name}</p>
                  <p className="memoirs-meta">{item.meta}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
