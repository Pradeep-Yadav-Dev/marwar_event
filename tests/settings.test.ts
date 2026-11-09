import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  dbService,
  getSettingsUploadDir,
  deleteLocalSettingsFile,
} from "../server/src/lib/prisma";
import { buildSettingsUpdate } from "../server/src/lib/settingsForm";
import {
  GET as getSettingsRoute,
  PUT as putSettingsRoute,
} from "../app/api/settings/route";
import type { SiteSettingsItem } from "../server/src/lib/seedData";

describe("Module 7: Website Settings Unit Test Suite", () => {
  let originalSettings: SiteSettingsItem;
  const createdFiles: string[] = [];

  before(async () => {
    originalSettings = await dbService.getSettings();
  });

  after(async () => {
    if (originalSettings) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt: _u, ...restoreData } = originalSettings;
      await dbService.updateSettings(restoreData);
    }
    for (const filePath of createdFiles) {
      deleteLocalSettingsFile(filePath);
    }
  });

  describe("1. Form Builder & File Helpers (buildSettingsUpdate & deleteLocalSettingsFile)", () => {
    it("trims text fields, parses socialLinks, and prioritizes uploadedLogo/uploadedFavicon", () => {
      const map: Record<string, string> = {
        siteName: "  Marwar Royal Heritage  ",
        tagline: "  Bespoke Palace Celebrations  ",
        email: "  concierge@marwarevent.com  ",
        removeLogo: "true",
        socialLinks: JSON.stringify([
          { platform: "  INSTAGRAM ", url: "  https://instagram.com/marwarevent  " },
          { platform: "facebook", url: "   " },
        ]),
      };

      const update = buildSettingsUpdate({
        get: (k) => map[k],
        uploadedLogo: "/uploads/settings/logo-test.png",
        uploadedFavicon: null,
      });

      assert.equal(update.siteName, "Marwar Royal Heritage");
      assert.equal(update.tagline, "Bespoke Palace Celebrations");
      assert.equal(update.email, "concierge@marwarevent.com");
      assert.equal(
        update.logo,
        "/uploads/settings/logo-test.png",
        "uploadedLogo should take priority over removeLogo='true'"
      );
      assert.deepEqual(update.socialLinks, [
        { platform: "instagram", url: "https://instagram.com/marwarevent" },
      ]);
    });

    it("clears logo and favicon when removeLogo='true' and removeFavicon='true'", () => {
      const map: Record<string, string> = {
        removeLogo: "true",
        removeFavicon: "true",
      };
      const update = buildSettingsUpdate({
        get: (k) => map[k],
      });

      assert.equal(update.logo, "");
      assert.equal(update.favicon, "");
    });

    it("safely deletes local files in /uploads/settings/ and ignores external paths", () => {
      const uploadDir = getSettingsUploadDir();
      const fileName = `unit-test-settings-${Date.now()}.png`;
      const diskPath = path.join(uploadDir, fileName);
      fs.writeFileSync(diskPath, Buffer.from("fake-png"));
      assert.equal(fs.existsSync(diskPath), true);

      // Should ignore external paths
      assert.equal(deleteLocalSettingsFile("https://example.com/logo.png"), false);
      assert.equal(deleteLocalSettingsFile("/assets/logo.png"), false);

      // Should delete valid local file
      const publicPath = `/uploads/settings/${fileName}`;
      assert.equal(deleteLocalSettingsFile(publicPath), true);
      assert.equal(fs.existsSync(diskPath), false);
    });
  });

  describe("2. Data Access Layer (dbService)", () => {
    it("retrieves normalized settings with required defaults", async () => {
      const settings = await dbService.getSettings();
      assert.ok(settings.siteName);
      assert.ok(settings.metaTitle);
      assert.ok(Array.isArray(settings.socialLinks));
    });

    it("updates branding, SEO, contact, footer, and socialLinks and persists changes", async () => {
      const updated = await dbService.updateSettings({
        siteName: "Marwar Event Unit Test",
        tagline: "Palace Weddings Across Rajasthan",
        metaTitle: "Marwar Event | Luxury Palace Weddings",
        metaDesc: "Curating royal celebrations in Jodhpur, Udaipur & Jaipur.",
        metaKeywords: "jodhpur wedding, royal event planner",
        email: "royal@marwarevent.com",
        phone: "+91 99999 88888",
        whatsapp: "+91 99999 88888",
        address: "Umaid Bhawan Palace Road, Jodhpur",
        footerAbout: "Crafting timeless royal celebrations.",
        footerCopyright: "© 2026 Marwar Event",
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com/marwarevent" },
          { platform: "youtube", url: "https://youtube.com/@marwarevent" },
        ],
      });

      assert.equal(updated.siteName, "Marwar Event Unit Test");
      assert.equal(updated.tagline, "Palace Weddings Across Rajasthan");
      assert.equal(updated.email, "royal@marwarevent.com");
      assert.equal(updated.phone, "+91 99999 88888");
      assert.equal(updated.socialLinks.length, 2);
      assert.equal(updated.socialLinks[1].platform, "youtube");
    });

    it("automatically deletes old local logo file when replaced or cleared", async () => {
      const uploadDir = getSettingsUploadDir();
      const oldLogoName = `logo-old-${Date.now()}.png`;
      const oldLogoDisk = path.join(uploadDir, oldLogoName);
      fs.writeFileSync(oldLogoDisk, Buffer.from("old-logo-bytes"));
      const oldLogoPublic = `/uploads/settings/${oldLogoName}`;
      createdFiles.push(oldLogoPublic);

      await dbService.updateSettings({ logo: oldLogoPublic });
      assert.equal(fs.existsSync(oldLogoDisk), true);

      // Clearing logo should remove the old file from disk
      const afterClear = await dbService.updateSettings({ logo: "" });
      assert.equal(afterClear.logo, "");
      assert.equal(
        fs.existsSync(oldLogoDisk),
        false,
        "Old local logo file should be deleted when replaced or cleared"
      );
    });
  });

  describe("3. Next.js API Route Handlers (/api/settings)", () => {
    it("GET /api/settings returns 200 with current site settings", async () => {
      const res = await getSettingsRoute();
      const json = await res.json();

      assert.equal(res.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.data.siteName, "Marwar Event Unit Test");
    });

    it("PUT /api/settings (JSON) updates settings including array socialLinks", async () => {
      const req = new NextRequest("http://localhost:3000/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: "Marwar Event JSON API",
          canonicalUrl: "https://www.marwarevent.com",
          socialLinks: [
            { platform: "Instagram", url: "https://instagram.com/marwarevent" },
            { platform: "Facebook", url: "https://facebook.com/marwarevent" },
          ],
        }),
      });

      const res = await putSettingsRoute(req);
      const json = await res.json();

      assert.equal(res.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.data.siteName, "Marwar Event JSON API");
      assert.equal(json.data.canonicalUrl, "https://www.marwarevent.com");
      assert.equal(json.data.socialLinks.length, 2);
      assert.equal(json.data.socialLinks[0].platform, "instagram");
      assert.equal(json.data.socialLinks[1].platform, "facebook");
    });

    it("PUT /api/settings (Multipart FormData) uploads logoFile & faviconFile and removes them when requested", async () => {
      const fd = new FormData();
      fd.append("siteName", "Marwar Event Multipart");
      fd.append("tagline", "Royal Celebrations");
      fd.append(
        "logoFile",
        new File([Buffer.from("fake-logo-png")], "royal-logo.png", {
          type: "image/png",
        })
      );
      fd.append(
        "faviconFile",
        new File([Buffer.from("fake-favicon-ico")], "favicon.ico", {
          type: "image/x-icon",
        })
      );

      const uploadReq = new NextRequest("http://localhost:3000/api/settings", {
        method: "PUT",
        body: fd,
      });
      const uploadRes = await putSettingsRoute(uploadReq);
      const uploadJson = await uploadRes.json();

      assert.equal(uploadRes.status, 200);
      assert.equal(uploadJson.success, true);
      assert.ok(uploadJson.data.logo.startsWith("/uploads/settings/logo-"));
      assert.ok(uploadJson.data.favicon.startsWith("/uploads/settings/favicon-"));

      const uploadedLogoPath: string = uploadJson.data.logo;
      const uploadedFaviconPath: string = uploadJson.data.favicon;
      createdFiles.push(uploadedLogoPath, uploadedFaviconPath);

      const logoDiskPath = path.join(
        getSettingsUploadDir(),
        path.basename(uploadedLogoPath)
      );
      const faviconDiskPath = path.join(
        getSettingsUploadDir(),
        path.basename(uploadedFaviconPath)
      );
      assert.equal(fs.existsSync(logoDiskPath), true);
      assert.equal(fs.existsSync(faviconDiskPath), true);

      // Now remove both logo & favicon via removeLogo='true' and removeFavicon='true'
      const removeFd = new FormData();
      removeFd.append("removeLogo", "true");
      removeFd.append("removeFavicon", "true");

      const removeReq = new NextRequest("http://localhost:3000/api/settings", {
        method: "PUT",
        body: removeFd,
      });
      const removeRes = await putSettingsRoute(removeReq);
      const removeJson = await removeRes.json();

      assert.equal(removeRes.status, 200);
      assert.equal(removeJson.data.logo, "");
      assert.equal(removeJson.data.favicon, "");
      assert.equal(
        fs.existsSync(logoDiskPath),
        false,
        "Uploaded logo file should be unlinked from disk on removeLogo='true'"
      );
      assert.equal(
        fs.existsSync(faviconDiskPath),
        false,
        "Uploaded favicon file should be unlinked from disk on removeFavicon='true'"
      );
    });
  });
});

