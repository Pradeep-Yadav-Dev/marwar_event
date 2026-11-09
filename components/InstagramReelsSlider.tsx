"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Pause } from "lucide-react";

export interface ReelSlideItem {
  id: number;
  image?: string;
  videoUrl?: string;
  shortcode?: string | null;
  handle: string;
  caption: string;
  url: string;
  posterHeadline?: string;
  audioAuthor?: string;
}

export interface InstagramReelsSliderProps {
  initialReels?: ReelSlideItem[];
  badgeText?: string;
  title?: string;
  subtitle?: string;
}

interface RawReelRecord {
  id: number;
  handle?: string;
  url: string;
  caption?: string;
  sortOrder?: number;
  status?: string;
}

export function extractInstagramShortcode(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i
  );
  return match?.[1] || null;
}

export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url.trim()) ||
    url.trim().startsWith("/uploads/")
  );
}

export function mapDbReels(raw: RawReelRecord[]): ReelSlideItem[] {
  return raw
    .filter((r) => r && (r.status === undefined || r.status === "active"))
    .map((r, idx) => {
      const cleanUrl = String(r.url || "").trim();
      const shortcode = extractInstagramShortcode(cleanUrl);
      const directVideo = isDirectVideoUrl(cleanUrl) ? cleanUrl : undefined;
      return {
        id: r.id ?? idx + 1,
        shortcode,
        videoUrl: directVideo,
        handle: String(r.handle || "marwarevent").replace(/^@+/, ""),
        caption: r.caption || "",
        url: cleanUrl || "https://www.instagram.com/marwarevent/",
      };
    });
}

function ReelCard({
  reel,
  isActivePlaying,
  isMuted,
  onTogglePlay,
  onStartPlay,
  onStopPlay,
  onToggleMute,
  onHoverChange,
}: {
  reel: ReelSlideItem;
  isActivePlaying: boolean;
  isMuted: boolean;
  onTogglePlay: (id: number) => void;
  onStartPlay: (id: number) => void;
  onStopPlay: (id: number) => void;
  onToggleMute: (e: React.MouseEvent) => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasEnteredRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [resolvedThumbUrl, setResolvedThumbUrl] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const shortcode = reel.shortcode ?? extractInstagramShortcode(reel.url);
  const effectiveVideoUrl = reel.videoUrl || resolvedVideoUrl;
  const effectiveThumbUrl = reel.image || resolvedThumbUrl;
  const cleanHandle = (reel.handle || "marwarevent").replace(/^@+/, "");
  const avatarLetter = (cleanHandle.charAt(0) || "M").toUpperCase();
  const audioLabel =
    reel.audioAuthor ||
    cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);

  // Resolve direct Instagram video stream & thumbnail from DB-saved Instagram Reel URL
  useEffect(() => {
    if (reel.videoUrl || !shortcode) return;

    let cancelled = false;
    fetch(`/api/reels/resolve?shortcode=${encodeURIComponent(shortcode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.success || !json.data) return;
        if (json.data.videoUrl) {
          setResolvedVideoUrl(json.data.videoUrl);
        }
        if (json.data.thumbnailUrl) {
          setResolvedThumbUrl(json.data.thumbnailUrl);
        }
      })
      .catch(() => {
        // Fallback to live Instagram embed iframe
      });

    return () => {
      cancelled = true;
    };
  }, [shortcode, reel.videoUrl]);

  // Keep native video mute state synced
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = isMuted;
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Synchronize native <video> playback when effectiveVideoUrl is available
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !effectiveVideoUrl) return;

    if (isActivePlaying) {
      v.defaultMuted = isMuted;
      v.muted = isMuted;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          v.defaultMuted = true;
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [isActivePlaying, isMuted, effectiveVideoUrl]);

  const startHoverPlayback = () => {
    hasEnteredRef.current = true;
    setIsHovered(true);
    onHoverChange(true);
    onStartPlay(reel.id);

    const v = videoRef.current;
    if (v && effectiveVideoUrl) {
      v.defaultMuted = isMuted;
      v.muted = isMuted;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  };

  const handleMouseEnter = () => {
    startHoverPlayback();
  };

  const handleMouseMove = () => {
    if (!hasEnteredRef.current) {
      startHoverPlayback();
    }
  };

  const handleMouseLeave = () => {
    hasEnteredRef.current = false;
    setIsHovered(false);
    setProgress(0);
    onHoverChange(false);
    onStopPlay(reel.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!effectiveVideoUrl && shortcode) {
      // Let clicks pass through to the embedded Instagram player
      return;
    }
    e.stopPropagation();
    onTogglePlay(reel.id);
  };

  const reelLink = reel.url || "https://www.instagram.com/marwarevent/";
  const embedSrc = shortcode
    ? `https://www.instagram.com/reel/${shortcode}/embed/`
    : null;
  const usingEmbedFallback = Boolean(embedSrc && !effectiveVideoUrl);

  return (
    <article
      className={`asc-reel-slide ${isHovered ? "is-hovered" : ""} ${
        isActivePlaying ? "is-playing" : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onPointerEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="asc-reel-card"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`${
          isActivePlaying ? "Pause" : "Play"
        } reel by @${cleanHandle}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTogglePlay(reel.id);
          }
        }}
      >
        {/* Resolved Thumbnail Image (if available) */}
        {effectiveThumbUrl && (
          <img
            src={effectiveThumbUrl}
            width={900}
            height={1600}
            loading="eager"
            alt={reel.caption || `@${cleanHandle} Instagram Reel`}
            className="asc-reel-img"
            draggable={false}
          />
        )}

        {/* Live Instagram Reel Embed Player for DB Instagram URLs */}
        {embedSrc && (
          <div
            className={`asc-reel-embed-wrap ${
              effectiveVideoUrl && isVideoReady && isActivePlaying
                ? "is-hidden"
                : ""
            }`}
          >
            <iframe
              src={embedSrc}
              title={reel.caption || `Instagram Reel ${shortcode}`}
              className="asc-reel-iframe"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {/* Direct / Resolved MP4 Video Player (auto-plays on hover) */}
        {effectiveVideoUrl && (
          <video
            ref={videoRef}
            src={effectiveVideoUrl}
            poster={effectiveThumbUrl || undefined}
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoReady(true)}
            onPlaying={() => setIsVideoReady(true)}
            onTimeUpdate={(e) => {
              const vid = e.currentTarget;
              if (vid.duration > 0) {
                setProgress((vid.currentTime / vid.duration) * 100);
              }
            }}
            className={`asc-reel-video ${
              isActivePlaying || isVideoReady ? "is-visible" : ""
            }`}
          />
        )}

        {/* Top & Bottom Dark Gradient Overlay */}
        <div className="asc-reel-shade" />

        {/* Top Instagram Reels Bar: "Reels" | "Following · For You" | Camera Icon */}
        <div className="asc-reel-topbar" onClick={(e) => e.stopPropagation()}>
          <span className="asc-reel-brand">Reels</span>

          <div className="asc-reel-tabs">
            <span className="asc-reel-tab-muted">Following</span>
            <span className="asc-reel-tab-dot">·</span>
            <span className="asc-reel-tab-active">
              For You
              <span className="asc-reel-red-dot" />
            </span>
          </div>

          <div className="asc-reel-top-actions">
            {effectiveVideoUrl && isActivePlaying && (
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                title={isMuted ? "Unmute" : "Mute"}
                className="asc-reel-mute-btn"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <a
              href={reelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="asc-reel-cam"
              aria-label="Open Reel on Instagram"
              title="Open on Instagram"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Center Play / Pause Icon Overlay (shown when playing direct/resolved video) */}
        {!usingEmbedFallback && (
          <button
            type="button"
            onClick={handleCardClick}
            aria-label={isActivePlaying ? "Pause video" : "Play video"}
            className={`asc-reel-play-wrap ${
              isActivePlaying ? "is-playing" : ""
            }`}
          >
            {isActivePlaying ? (
              <span className="asc-reel-pause-pill">
                <Pause className="w-6 h-6 text-white fill-white" />
              </span>
            ) : (
              <svg
                width="72"
                height="72"
                viewBox="0 0 68 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="asc-reel-play-svg"
              >
                <path
                  d="M20 14.5C20 11.5 23.3 9.7 25.8 11.3L54.5 29.8C56.8 31.3 56.8 34.7 54.5 36.2L25.8 54.7C23.3 56.3 20 54.5 20 51.5V14.5Z"
                  fill="white"
                  fillOpacity="0.92"
                />
              </svg>
            )}
          </button>
        )}

        {/* Right Side Vertical Action Buttons (Heart, Comment, Share, Save) */}
        <div
          className="asc-reel-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`asc-reel-action-btn ${liked ? "is-liked" : ""}`}
            aria-label="Like reel"
            onClick={() => setLiked((p) => !p)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <a
            href={reelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="asc-reel-action-btn"
            aria-label="Comment on Instagram"
            title="View on Instagram"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>

          <a
            href={reelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="asc-reel-action-btn"
            aria-label="Share Instagram Reel"
            title="Share / Open on Instagram"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </a>

          <button
            type="button"
            className={`asc-reel-action-btn ${saved ? "is-saved" : ""}`}
            aria-label="Save reel"
            onClick={() => setSaved((p) => !p)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Bottom Overlay: Avatar + @handle, Caption, and Original Audio Row */}
        <div className="asc-reel-bottom" onClick={(e) => e.stopPropagation()}>
          <a
            href={reelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="asc-reel-user"
          >
            <span className="asc-reel-avatar">{avatarLetter}</span>
            <span className="asc-reel-handle">@{cleanHandle}</span>
          </a>

          {reel.caption && (
            <a
              href={reelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="asc-reel-caption-link"
            >
              <p className="asc-reel-caption">{reel.caption}</p>
            </a>
          )}

          <div className="asc-reel-audio">
            <span className="asc-reel-audio-left">
              {isActivePlaying ? (
                <span className="asc-reel-eq" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <span className="asc-reel-note">♫</span>
              )}
              <span>dio · {audioLabel}</span>
            </span>
            <span className="asc-reel-audio-right">
              Original Audio - {audioLabel.slice(0, 2)}
            </span>
          </div>
        </div>

        {/* Instagram Reels Bottom Video Progress Bar */}
        {effectiveVideoUrl && (
          <div className="asc-reel-progress-track" aria-hidden="true">
            <div
              className="asc-reel-progress-bar"
              style={{
                width: isActivePlaying ? `${progress}%` : "0%",
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default function InstagramReelsSlider({
  initialReels = [],
  badgeText = "INSTAGRAM",
  title = "From Instagram",
  subtitle = "Short reels from our community and celebration moments.",
}: InstagramReelsSliderProps) {
  const [reels, setReels] = useState<ReelSlideItem[]>(initialReels);
  const [activePlayingId, setActivePlayingId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPausedByHover, setIsPausedByHover] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const refreshReels = useCallback(async () => {
    try {
      const res = await fetch("/api/reels?status=active", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setReels(mapDbReels(json.data as RawReelRecord[]));
        }
      }
    } catch {
      // Keep current reels
    }
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      void refreshReels();
    });

    const onUpdate = () => {
      void refreshReels();
    };
    window.addEventListener("marwar:admin-updated", onUpdate);
    window.addEventListener("focus", onUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("marwar_live_sync");
      bc.onmessage = () => {
        void refreshReels();
      };
    } catch {}

    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("marwar:admin-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
      try {
        bc?.close();
      } catch {}
    };
  }, [refreshReels]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>(".asc-reel-slide");
    const gap = 20;
    const step = firstCard ? firstCard.offsetWidth + gap : 290;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction === 1 && track.scrollLeft >= maxScroll - 12) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && track.scrollLeft <= 12) {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * step, behavior: "smooth" });
    }
  }, []);

  // Auto-advance carousel when idle
  useEffect(() => {
    if (isPausedByHover || activePlayingId !== null || reels.length <= 1) return;
    const timer = window.setInterval(() => {
      scrollByCard(1);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPausedByHover, activePlayingId, reels.length, scrollByCard]);

  // Toggle play/pause and automatically pause any other playing video
  const handleTogglePlay = useCallback((id: number) => {
    setActivePlayingId((prev) => (prev === id ? null : id));
  }, []);

  const handleStartPlay = useCallback((id: number) => {
    setActivePlayingId(id);
  }, []);

  const handleStopPlay = useCallback((id: number) => {
    setActivePlayingId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  // Mouse drag-to-scroll support alongside native mobile touch swipe
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    isPointerDownRef.current = true;
    startXRef.current = e.pageX - track.offsetLeft;
    scrollLeftRef.current = track.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const x = e.pageX - track.offsetLeft;
    const delta = x - startXRef.current;
    if (Math.abs(delta) < 8) return;
    e.preventDefault();
    track.scrollLeft = scrollLeftRef.current - delta * 1.25;
  };

  const handleMouseUpOrLeave = () => {
    isPointerDownRef.current = false;
  };

  return (
    <div className="asc-ig-container">
      {/* Header matching Ascenteers UI */}
      <div className="asc-ig-header">
        <div className="asc-ig-header-left">
          <span className="asc-ig-pill">{badgeText}</span>
          <h2 className="asc-ig-title">
            <span className="asc-ig-title-highlight">{title}</span>
          </h2>
          <p className="asc-ig-subtitle">{subtitle}</p>
        </div>

        {reels.length > 0 && (
          <div className="asc-ig-nav">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous reel"
              className="asc-ig-nav-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next reel"
              className="asc-ig-nav-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Carousel Slider Track */}
      {reels.length > 0 ? (
        <div className="asc-ig-viewport">
          <div
            ref={trackRef}
            className="asc-ig-track"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                isActivePlaying={activePlayingId === reel.id}
                isMuted={isMuted}
                onTogglePlay={handleTogglePlay}
                onStartPlay={handleStartPlay}
                onStopPlay={handleStopPlay}
                onToggleMute={toggleMute}
                onHoverChange={setIsPausedByHover}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No Instagram reels added yet. Add reels from the Admin Panel.
        </p>
      )}
    </div>
  );
}
