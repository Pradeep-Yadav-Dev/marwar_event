"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
  Database,
  RefreshCw,
} from "lucide-react";
import SocialIcon, { SOCIAL_PLATFORMS } from "@/components/SocialIcon";
import { notifyAdminUpdate } from "@/components/SiteSettingsContext";

interface SocialLink {
  platform: string;
  url: string;
}

interface SettingsForm {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  metaTitle: string;
  metaDesc: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  footerAbout: string;
  footerCopyright: string;
  socialLinks: SocialLink[];
}

const EMPTY: SettingsForm = {
  siteName: "",
  tagline: "",
  logo: "",
  favicon: "",
  metaTitle: "",
  metaDesc: "",
  metaKeywords: "",
  ogImage: "",
  canonicalUrl: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  footerAbout: "",
  footerCopyright: "",
  socialLinks: [],
};

type TextKey = Exclude<keyof SettingsForm, "socialLinks" | "logo" | "favicon">;

/* ---------------- Image picker (logo / favicon) ---------------- */
function ImagePicker({
  id,
  label,
  hint,
  preview,
  fileName,
  onPick,
  onRemove,
  dark,
  square,
}: {
  id: string;
  label: string;
  hint: string;
  preview: string;
  fileName?: string;
  onPick: (f: File) => void;
  onRemove: () => void;
  dark?: boolean;
  square?: boolean;
}) {
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <div className="adm-upload-zone">
        {preview ? (
          <div
            className="adm-upload-preview"
            style={{
              background: dark ? "#28080f" : "#f6f8fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 12,
              minHeight: 90,
            }}
          >
            { }
            <img
              src={preview}
              alt={`${label} preview`}
              style={{
                maxHeight: square ? 56 : 70,
                maxWidth: "100%",
                width: square ? 56 : "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        ) : (
          <div className="adm-upload-empty">
            <ImageIcon size={26} />
            <span>No image — default will be used</span>
          </div>
        )}
        <div className="adm-upload-actions">
          <label
            htmlFor={id}
            className="adm-btn adm-btn-sm adm-btn-primary"
            style={{ cursor: "pointer", margin: 0 }}
          >
            <Upload size={14} /> Choose file
          </label>
          <input
            id={id}
            type="file"
            accept="image/*,.ico,.svg"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
          {preview && (
            <button
              type="button"
              className="adm-btn adm-btn-sm adm-btn-danger-soft"
              onClick={onRemove}
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
        <p className="adm-upload-path">
          {fileName ? (
            <>
              New upload: <b>{fileName}</b> → saved to{" "}
              <code>/uploads/settings/</code>
            </>
          ) : (
            hint
          )}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Main panel ---------------- */
export default function SettingsPanel({
  fetchEndpoint,
  showToast,
}: {
  fetchEndpoint: (subPath: string, init?: RequestInit) => Promise<Response>;
  showToast: (msg: string) => void;
}) {
  const [form, setForm] = useState<SettingsForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [removeLogo, setRemoveLogo] = useState(false);

  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState("");
  const [removeFavicon, setRemoveFavicon] = useState(false);

  const applyLoaded = (d: Partial<SettingsForm>) => {
    const next: SettingsForm = {
      ...EMPTY,
      ...d,
      socialLinks: Array.isArray(d.socialLinks) ? d.socialLinks : [],
    } as SettingsForm;
    setForm(next);
    setLogoPreview(next.logo || "");
    setFaviconPreview(next.favicon || "");
    setLogoFile(null);
    setFaviconFile(null);
    setRemoveLogo(false);
    setRemoveFavicon(false);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchEndpoint("/settings");
      const d = await res.json();
      if (d.success && d.data) applyLoaded(d.data);
    } catch {
      showToast("Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      void load();
    });
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setText =
    (key: TextKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* Social links */
  const addSocial = () =>
    setForm((prev) => {
      const used = new Set(prev.socialLinks.map((l) => l.platform));
      const nextPlatform =
        SOCIAL_PLATFORMS.find((p) => !used.has(p.value))?.value || "website";
      return {
        ...prev,
        socialLinks: [...prev.socialLinks, { platform: nextPlatform, url: "" }],
      };
    });
  const updateSocial = (idx: number, patch: Partial<SocialLink>) =>
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((l, i) =>
        i === idx ? { ...l, ...patch } : l,
      ),
    }));
  const removeSocial = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      (Object.keys(EMPTY) as (keyof SettingsForm)[]).forEach((k) => {
        if (k === "socialLinks" || k === "logo" || k === "favicon") return;
        fd.append(k, String(form[k] ?? ""));
      });
      fd.append(
        "socialLinks",
        JSON.stringify(form.socialLinks.filter((l) => l.url.trim())),
      );
      if (logoFile) fd.append("logoFile", logoFile);
      if (faviconFile) fd.append("faviconFile", faviconFile);
      fd.append("removeLogo", String(removeLogo && !logoFile));
      fd.append("removeFavicon", String(removeFavicon && !faviconFile));

      const res = await fetchEndpoint("/settings", { method: "PUT", body: fd });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      applyLoaded(d.data);
      await notifyAdminUpdate(d.data);
      showToast("Website settings saved & updated live");
    } catch {
      showToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const metaTitleLen = form.metaTitle.length;
  const metaDescLen = form.metaDesc.length;

  if (loading) {
    return (
      <div className="adm-card adm-card-pad adm-fade" style={{ maxWidth: 900 }}>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={16} className="adm-spin" /> Loading settings…
        </p>
      </div>
    );
  }

  return (
    <form
      className="adm-stack adm-fade"
      style={{ maxWidth: "full" }}
      onSubmit={handleSave}
    >
      {/* ---------- BRANDING ---------- */}
      <section className="adm-card adm-card-pad">
        <h2 className="adm-card-title">Branding</h2>
        <p className="adm-card-sub" style={{ marginBottom: 14 }}>
          Website name, logo and browser favicon
        </p>
        <div className="adm-form-grid">
          <div className="adm-field">
            <label htmlFor="st-name">Website name *</label>
            <input
              id="st-name"
              type="text"
              required
              placeholder="e.g. Marwar Event"
              value={form.siteName}
              onChange={setText("siteName")}
            />
            <p className="hint">
              Shown as text logo when no logo image is set.
            </p>
          </div>
          <div className="adm-field">
            <label htmlFor="st-tagline">Tagline</label>
            <input
              id="st-tagline"
              type="text"
              placeholder="e.g. Royal Rajasthani Celebrations"
              value={form.tagline}
              onChange={setText("tagline")}
            />
          </div>
        </div>
        <div className="adm-form-grid" style={{ marginTop: 14 }}>
          <ImagePicker
            id="st-logo"
            label="Website logo"
            hint="PNG / SVG with transparent background works best (shown on dark header)."
            preview={logoPreview}
            fileName={logoFile?.name}
            dark
            onPick={(f) => {
              setLogoFile(f);
              setRemoveLogo(false);
              setLogoPreview(URL.createObjectURL(f));
            }}
            onRemove={() => {
              setLogoFile(null);
              setLogoPreview("");
              setRemoveLogo(true);
            }}
          />
          <ImagePicker
            id="st-favicon"
            label="Favicon"
            hint="Square .ico / .png (32×32 or 64×64). Shown in the browser tab."
            preview={faviconPreview}
            fileName={faviconFile?.name}
            square
            onPick={(f) => {
              setFaviconFile(f);
              setRemoveFavicon(false);
              setFaviconPreview(URL.createObjectURL(f));
            }}
            onRemove={() => {
              setFaviconFile(null);
              setFaviconPreview("");
              setRemoveFavicon(true);
            }}
          />
        </div>
      </section>

      {/* ---------- SEO ---------- */}
      <section className="adm-card adm-card-pad">
        <h2 className="adm-card-title">SEO &amp; Meta tags</h2>
        <p className="adm-card-sub" style={{ marginBottom: 14 }}>
          How your website appears on Google and when shared on WhatsApp /
          Facebook
        </p>
        <div className="adm-stack" style={{ gap: 14 }}>
          <div className="adm-field">
            <label htmlFor="st-mtitle">Meta title</label>
            <input
              id="st-mtitle"
              type="text"
              maxLength={120}
              placeholder="Marwar Event — Royal Rajasthani Weddings & Celebrations"
              value={form.metaTitle}
              onChange={setText("metaTitle")}
            />
            <p
              className="hint"
              style={{ color: metaTitleLen > 60 ? "#c27a12" : undefined }}
            >
              {metaTitleLen}/60 characters recommended
            </p>
          </div>
          <div className="adm-field">
            <label htmlFor="st-mdesc">Meta description</label>
            <textarea
              id="st-mdesc"
              rows={3}
              maxLength={320}
              placeholder="Short summary shown under your link in Google results…"
              value={form.metaDesc}
              onChange={setText("metaDesc")}
            />
            <p
              className="hint"
              style={{ color: metaDescLen > 160 ? "#c27a12" : undefined }}
            >
              {metaDescLen}/160 characters recommended
            </p>
          </div>
          <div className="adm-field">
            <label htmlFor="st-mkeys">Meta keywords</label>
            <input
              id="st-mkeys"
              type="text"
              placeholder="royal wedding jodhpur, rajasthani event planner, destination wedding"
              value={form.metaKeywords}
              onChange={setText("metaKeywords")}
            />
            <p className="hint">Comma separated</p>
          </div>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label htmlFor="st-canon">Website URL (canonical)</label>
              <input
                id="st-canon"
                type="url"
                placeholder="https://marwarevent.com"
                value={form.canonicalUrl}
                onChange={setText("canonicalUrl")}
              />
            </div>
            <div className="adm-field">
              <label htmlFor="st-og">Social share image (OG image)</label>
              <input
                id="st-og"
                type="text"
                placeholder="/assets/hero-palace.jpg or https://…"
                value={form.ogImage}
                onChange={setText("ogImage")}
              />
              <p className="hint">Recommended 1200×630</p>
            </div>
          </div>

          {/* Google preview */}
          <div
            style={{
              border: "1px solid #e3e8ee",
              borderRadius: 12,
              padding: 14,
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 11, color: "#6b7785", marginBottom: 6 }}>
              GOOGLE PREVIEW
            </p>
            <p style={{ fontSize: 12.5, color: "#202124" }}>
              {form.canonicalUrl || "https://marwarevent.com"}
            </p>
            <p
              style={{
                fontSize: 18,
                color: "#1a0dab",
                margin: "2px 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {form.metaTitle || form.siteName || "Website title"}
            </p>
            <p style={{ fontSize: 13, color: "#4d5156", lineHeight: 1.5 }}>
              {(form.metaDesc || "Meta description will appear here.").slice(
                0,
                160,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section className="adm-card adm-card-pad">
        <h2 className="adm-card-title">Contact details</h2>
        <p className="adm-card-sub" style={{ marginBottom: 14 }}>
          Used in the footer and the floating Call / WhatsApp buttons
        </p>
        <div className="adm-form-grid">
          <div className="adm-field">
            <label htmlFor="st-email">Email address</label>
            <input
              id="st-email"
              type="email"
              placeholder="hello@marwarevent.com"
              value={form.email}
              onChange={setText("email")}
            />
          </div>
          <div className="adm-field">
            <label htmlFor="st-phone">Mobile number</label>
            <input
              id="st-phone"
              type="tel"
              placeholder="+91 98290 00000"
              value={form.phone}
              onChange={setText("phone")}
            />
          </div>
          <div className="adm-field">
            <label htmlFor="st-wa">WhatsApp number</label>
            <input
              id="st-wa"
              type="tel"
              placeholder="+91 98290 00000 (leave empty to use mobile)"
              value={form.whatsapp}
              onChange={setText("whatsapp")}
            />
            <p className="hint">Include country code, e.g. +91</p>
          </div>
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <label htmlFor="st-address">Address</label>
          <textarea
            id="st-address"
            rows={2}
            placeholder="Pal Road, Jodhpur, Rajasthan 342008"
            value={form.address}
            onChange={setText("address")}
          />
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <section className="adm-card adm-card-pad">
        <h2 className="adm-card-title">Footer</h2>
        <p className="adm-card-sub" style={{ marginBottom: 14 }}>
          Text shown at the bottom of every page
        </p>
        <div className="adm-field">
          <label htmlFor="st-fabout">Footer about text</label>
          <textarea
            id="st-fabout"
            rows={3}
            placeholder="Royal Rajasthani event craftsmanship — …"
            value={form.footerAbout}
            onChange={setText("footerAbout")}
          />
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <label htmlFor="st-fcopy">Copyright line</label>
          <input
            id="st-fcopy"
            type="text"
            placeholder={`© ${new Date().getFullYear()} ${form.siteName || "Marwar Event"} · All rights reserved`}
            value={form.footerCopyright}
            onChange={setText("footerCopyright")}
          />
          <p className="hint">
            Leave empty to auto-generate with current year.
          </p>
        </div>
      </section>

      {/* ---------- SOCIAL LINKS ---------- */}
      <section className="adm-card adm-card-pad">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div>
            <h2 className="adm-card-title">Social links</h2>
            <p className="adm-card-sub">
              Icons shown in the footer (Instagram also powers the floating
              button)
            </p>
          </div>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-primary"
            onClick={addSocial}
          >
            <Plus size={14} /> Add social link
          </button>
        </div>

        {form.socialLinks.length === 0 ? (
          <div className="adm-empty" style={{ padding: "22px 10px" }}>
            No social links added yet.
          </div>
        ) : (
          <div className="adm-stack" style={{ gap: 10 }}>
            {form.socialLinks.map((link, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 8,
                  padding: 10,
                  border: "1px solid #e3e8ee",
                  borderRadius: 12,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#f1f6f8",
                    color: "#0e3b49",
                    flexShrink: 0,
                  }}
                >
                  <SocialIcon platform={link.platform} size={18} />
                </span>
                <div
                  className="adm-field"
                  style={{ flex: "1 1 140px", minWidth: 130 }}
                >
                  <select
                    aria-label="Platform"
                    value={link.platform}
                    onChange={(e) =>
                      updateSocial(idx, { platform: e.target.value })
                    }
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className="adm-field"
                  style={{ flex: "3 1 220px", minWidth: 0 }}
                >
                  <input
                    aria-label="Profile URL"
                    type="url"
                    placeholder="https://instagram.com/marwarevent"
                    value={link.url}
                    onChange={(e) => updateSocial(idx, { url: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="adm-btn adm-btn-icon adm-btn-danger-soft"
                  aria-label="Remove social link"
                  title="Remove"
                  onClick={() => removeSocial(idx)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- DATABASE INFO ---------- */}
      <section className="adm-dark">
        <div className="adm-dark-head">
          <span>
            <Database size={16} color="#f2b25c" /> phpMyAdmin / MySQL
          </span>
          <span className="adm-tag">Prisma</span>
        </div>
        <p style={{ fontSize: 13 }}>
          Connection string in your project root{" "}
          <code style={{ color: "#f2b25c" }}>.env</code>:
        </p>
        <pre className="adm-code">
          DATABASE_URL=&quot;mysql://root:@localhost:3306/marwar_events&quot;
        </pre>
        <p style={{ fontSize: 12, color: "#7fa3ad" }}>
          Sync tables to phpMyAdmin:{" "}
          <code style={{ color: "#fff" }}>npx prisma db push</code>
        </p>
      </section>

      <div
        className="adm-form-actions"
        style={{
          position: "sticky",
          bottom: 0,
          padding: "12px 0",
          background:
            "linear-gradient(to top, var(--adm-bg, #f4f6f8) 70%, transparent)",
          zIndex: 5,
        }}
      >
        <button type="button" className="adm-btn adm-btn-soft" onClick={load}>
          Reset
        </button>
        <button
          type="submit"
          className="adm-btn adm-btn-primary"
          disabled={saving}
        >
          <Save size={15} /> {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
