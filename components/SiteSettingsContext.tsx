"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { SiteSettingsItem } from "@/server/src/lib/seedData";

export type PublicSiteSettings = SiteSettingsItem;

const SiteSettingsContext = createContext<PublicSiteSettings | null>(null);

const CHANNEL_NAME = "marwar_live_sync";

/**
 * Call this after any create / update / delete in the Admin Panel.
 * It revalidates Next.js server cache and notifies all open website tabs
 * to refresh their settings and server components immediately.
 */
export async function notifyAdminUpdate(nextSettings?: PublicSiteSettings) {
  try {
    await fetch("/api/revalidate", { method: "POST", cache: "no-store" });
  } catch {}

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CHANNEL_NAME, String(Date.now()));
    } catch {}
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: "refresh", settings: nextSettings });
        bc.close();
      }
    } catch {}
    window.dispatchEvent(
      new CustomEvent(CHANNEL_NAME, { detail: { settings: nextSettings } })
    );
  }
}

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: PublicSiteSettings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<PublicSiteSettings>(value);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/service/admin") ||
    pathname?.startsWith("/services/admin");

  // Sync when server-rendered prop changes
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setSettings(value));
    return () => window.cancelAnimationFrame(id);
  }, [value]);

  const fetchLatestSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          setSettings(d.data);
        }
      }
    } catch {}
  }, []);

  // Fetch latest settings on mount and listen for live Admin updates
  useEffect(() => {
    const initId = window.requestAnimationFrame(() => {
      void fetchLatestSettings();
    });

    const handleSync = (incoming?: PublicSiteSettings) => {
      if (incoming) setSettings(incoming);
      else void fetchLatestSettings();
      if (!isAdmin) {
        router.refresh();
      }
    };

    const onCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      handleSync(detail?.settings);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === CHANNEL_NAME) handleSync();
    };

    const onFocus = () => {
      fetchLatestSettings();
      if (!isAdmin) router.refresh();
    };

    window.addEventListener(CHANNEL_NAME, onCustomEvent);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel(CHANNEL_NAME);
        bc.onmessage = (ev) => handleSync(ev.data?.settings);
      } catch {}
    }

    return () => {
      window.cancelAnimationFrame(initId);
      window.removeEventListener(CHANNEL_NAME, onCustomEvent);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      if (bc) bc.close();
    };
  }, [fetchLatestSettings, isAdmin, router]);

  // Dynamically update favicon and document title in the DOM when settings change
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isAdmin && settings?.metaTitle) {
      document.title = settings.metaTitle;
    }
    const href = settings?.favicon || "/favicon.ico";
    const rels = ["icon", "shortcut icon", "apple-touch-icon"];
    rels.forEach((rel) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      if (link.getAttribute("href") !== href) {
        link.href = href;
      }
    });
  }, [settings?.favicon, settings?.metaTitle, isAdmin]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

/** Website settings (logo, contact, footer, social links) managed from Admin → Website settings */
export function useSiteSettings(): PublicSiteSettings | null {
  return useContext(SiteSettingsContext);
}

/** "+91 98290 00000" -> "919829000000" */
export const digitsOnly = (v: string) => (v || "").replace(/[^0-9]/g, "");
