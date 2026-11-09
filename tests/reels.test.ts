import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { dbService } from "../server/src/lib/prisma";
import {
  GET as getReelsRoute,
  POST as postReelRoute,
} from "../app/api/reels/route";
import {
  GET as getReelByIdRoute,
  PUT as putReelRoute,
  DELETE as deleteReelRoute,
} from "../app/api/reels/[id]/route";

describe("Module 6: Instagram Reels Unit Test Suite", () => {
  const createdIds: number[] = [];

  after(async () => {
    for (const id of createdIds) {
      await dbService.deleteReel(id);
    }
  });

  describe("1. Data Access Layer (dbService)", () => {
    it("creates an Instagram reel, strips leading '@', trims fields, and applies defaults", async () => {
      const created = await dbService.createReel({
        handle: "  @@marwarevent_royal  ",
        url: "  https://www.instagram.com/reel/UNIT_TEST_1/  ",
        caption: "  Royal Sangeet Night under the stars  ",
      });
      createdIds.push(created.id);

      assert.ok(created.id > 0);
      assert.equal(created.handle, "marwarevent_royal");
      assert.equal(created.url, "https://www.instagram.com/reel/UNIT_TEST_1/");
      assert.equal(created.caption, "Royal Sangeet Night under the stars");
      assert.equal(created.sortOrder, 0);
      assert.equal(created.status, "active");
      assert.ok(created.createdAt);
      assert.ok(created.updatedAt);
    });

    it("falls back to default handle 'marwarevent' when handle is empty or only '@'", async () => {
      const reelEmpty = await dbService.createReel({
        handle: "   @@@   ",
        url: "https://www.instagram.com/reel/UNIT_TEST_2/",
        sortOrder: 5,
        status: "inactive",
      });
      createdIds.push(reelEmpty.id);

      assert.equal(reelEmpty.handle, "marwarevent");
      assert.equal(reelEmpty.caption, "");
      assert.equal(reelEmpty.sortOrder, 5);
      assert.equal(reelEmpty.status, "inactive");
    });

    it("retrieves reel by ID and returns null for invalid/missing IDs", async () => {
      const targetId = createdIds[0];
      const found = await dbService.getReelById(targetId);
      assert.ok(found);
      assert.equal(found.id, targetId);

      const missing = await dbService.getReelById(99999999);
      assert.equal(missing, null);

      const invalid = await dbService.getReelById(-10);
      assert.equal(invalid, null);
    });

    it("lists reels sorted by sortOrder ASC then id DESC and filters by status ('active', 'inactive', 'all')", async () => {
      const reelEarly = await dbService.createReel({
        url: "https://www.instagram.com/reel/UNIT_SORT_EARLY/",
        sortOrder: -50,
        status: "active",
      });
      createdIds.push(reelEarly.id);

      const all = await dbService.getReels("all");
      const active = await dbService.getReels("active");
      const inactive = await dbService.getReels("inactive");

      assert.ok(all.length >= 3);
      assert.equal(all[0].id, reelEarly.id, "Lowest sortOrder (-50) should appear first");
      assert.ok(active.every((r) => r.status === "active"));
      assert.ok(inactive.every((r) => r.status === "inactive"));
      assert.ok(active.some((r) => r.id === createdIds[0]));
      assert.ok(inactive.some((r) => r.id === createdIds[1]));
    });

    it("updates reel fields, normalizes handle, preserves sortOrder when omitted, and updates status", async () => {
      const targetId = createdIds[0];
      const updated = await dbService.updateReel(targetId, {
        handle: "@royal_jodhpur",
        caption: "Updated Heritage Procession",
        sortOrder: 3,
        status: "inactive",
      });

      assert.ok(updated);
      assert.equal(updated.handle, "royal_jodhpur");
      assert.equal(updated.caption, "Updated Heritage Procession");
      assert.equal(updated.sortOrder, 3);
      assert.equal(updated.status, "inactive");

      // Clearing handle falls back to 'marwarevent' and omitting sortOrder keeps 3
      const fallbackUpdate = await dbService.updateReel(targetId, {
        handle: "   ",
        status: "active",
      });
      assert.ok(fallbackUpdate);
      assert.equal(fallbackUpdate.handle, "marwarevent");
      assert.equal(fallbackUpdate.sortOrder, 3);
      assert.equal(fallbackUpdate.status, "active");
    });

    it("deletes reel and returns false for non-existent ID", async () => {
      const temp = await dbService.createReel({
        url: "https://www.instagram.com/reel/TEMP_DELETE/",
      });
      const deleted = await dbService.deleteReel(temp.id);
      assert.equal(deleted, true);

      const afterDelete = await dbService.getReelById(temp.id);
      assert.equal(afterDelete, null);

      const missingDelete = await dbService.deleteReel(99999999);
      assert.equal(missingDelete, false);
    });
  });

  describe("2. Next.js API Route Handlers (/api/reels)", () => {
    it("POST /api/reels rejects missing or whitespace-only url with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: "@marwarevent",
          url: "   ",
          caption: "Missing URL reel",
        }),
      });

      const res = await postReelRoute(req);
      const json = await res.json();
      assert.equal(res.status, 400);
      assert.equal(json.success, false);
    });

    it("POST /api/reels creates a new Instagram reel and returns 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: "@marwarevent",
          url: "https://www.instagram.com/reel/API_TEST_REEL/",
          caption: "Grand Baraat Welcome at Umaid Bhawan",
          sortOrder: 1,
          status: "active",
        }),
      });

      const res = await postReelRoute(req);
      const json = await res.json();

      assert.equal(res.status, 201);
      assert.equal(json.success, true);
      assert.ok(json.data?.id);
      createdIds.push(json.data.id);
      assert.equal(json.data.handle, "marwarevent");
      assert.equal(json.data.url, "https://www.instagram.com/reel/API_TEST_REEL/");
      assert.equal(json.data.sortOrder, 1);
      assert.equal(json.data.status, "active");
    });

    it("GET /api/reels returns reels and supports ?status=active", async () => {
      const req = new NextRequest("http://localhost:3000/api/reels?status=active");
      const res = await getReelsRoute(req);
      const json = await res.json();

      assert.equal(res.status, 200);
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.every((r: any) => r.status === "active"));
    });

    it("GET & PUT /api/reels/[id] validates empty url (400), missing ID (404), and updates reel (200)", async () => {
      const targetId = createdIds[createdIds.length - 1];

      // GET single reel
      const getRes = await getReelByIdRoute(
        new NextRequest(`http://localhost:3000/api/reels/${targetId}`),
        { params: Promise.resolve({ id: String(targetId) }) }
      );
      assert.equal(getRes.status, 200);

      // 1. Empty URL rejected with 400
      const badReq = new NextRequest(`http://localhost:3000/api/reels/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "   " }),
      });
      const badRes = await putReelRoute(badReq, {
        params: Promise.resolve({ id: String(targetId) }),
      });
      assert.equal(badRes.status, 400);

      // 2. Non-existent ID returns 404
      const notFoundReq = new NextRequest("http://localhost:3000/api/reels/99999999", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: "No such reel" }),
      });
      const notFoundRes = await putReelRoute(notFoundReq, {
        params: Promise.resolve({ id: "99999999" }),
      });
      assert.equal(notFoundRes.status, 404);

      // 3. Valid update returns 200
      const okReq = new NextRequest(`http://localhost:3000/api/reels/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: "@marwarevent_live",
          caption: "Updated Grand Baraat Welcome",
          sortOrder: 2,
          status: "inactive",
        }),
      });
      const okRes = await putReelRoute(okReq, {
        params: Promise.resolve({ id: String(targetId) }),
      });
      const okJson = await okRes.json();
      assert.equal(okRes.status, 200);
      assert.equal(okJson.success, true);
      assert.equal(okJson.data.handle, "marwarevent_live");
      assert.equal(okJson.data.caption, "Updated Grand Baraat Welcome");
      assert.equal(okJson.data.sortOrder, 2);
      assert.equal(okJson.data.status, "inactive");
    });

    it("DELETE /api/reels/[id] deletes reel (200), returns 404 on repeat delete, and 400 on invalid ID", async () => {
      const targetId = createdIds.pop()!;

      const delReq = new NextRequest(`http://localhost:3000/api/reels/${targetId}`, {
        method: "DELETE",
      });
      const delRes = await deleteReelRoute(delReq, {
        params: Promise.resolve({ id: String(targetId) }),
      });
      assert.equal(delRes.status, 200);

      const repeatRes = await deleteReelRoute(delReq, {
        params: Promise.resolve({ id: String(targetId) }),
      });
      assert.equal(repeatRes.status, 404);

      const invalidRes = await deleteReelRoute(delReq, {
        params: Promise.resolve({ id: "abc" }),
      });
      assert.equal(invalidRes.status, 400);
    });
  });
});

