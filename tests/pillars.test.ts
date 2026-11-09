import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { dbService } from "../server/src/lib/prisma";
import {
  GET as getPillarsHandler,
  POST as postPillarHandler,
} from "../app/api/pillars/route";
import {
  PUT as putPillarHandler,
  DELETE as deletePillarHandler,
} from "../app/api/pillars/[id]/route";

describe("Module 5: Why Marwar (Signature Pillars) Unit Test Suite", () => {
  let activePillarId = 0;
  let draftPillarId = 0;

  describe("1. Data Access Layer (dbService)", () => {
    it("creates a signature pillar, trims fields, and applies defaults (num '01', icon 'Landmark')", async () => {
      const pil = await dbService.createPillar({
        hindi: "  शाही विरासत  ",
        title: "  Heritage Palace Venues  ",
        tag: "  50+ Royal Forts & Havelis  ",
        text: "  Exclusive access to historic forts, royal courtyards, and heritage havelis across Jodhpur, Udaipur, and Jaipur.  ",
      });

      assert.ok(pil.id > 0);
      activePillarId = pil.id;

      assert.equal(pil.num, "01");
      assert.equal(pil.hindi, "शाही विरासत");
      assert.equal(pil.title, "Heritage Palace Venues");
      assert.equal(pil.tag, "50+ Royal Forts & Havelis");
      assert.equal(
        pil.text,
        "Exclusive access to historic forts, royal courtyards, and heritage havelis across Jodhpur, Udaipur, and Jaipur."
      );
      assert.equal(pil.icon, "Landmark");
      assert.equal(pil.status, "active");
    });

    it("supports custom icon (Lucide name, emoji, or image URL) and draft status", async () => {
      const draftPil = await dbService.createPillar({
        num: " 02 ",
        hindi: "",
        title: "Royal Marwari Rasoi",
        tag: "",
        text: "Authentic khansama-crafted feasts served on silver thalis.",
        icon: "  UtensilsCrossed  ",
        status: "draft",
      });

      draftPillarId = draftPil.id;
      assert.equal(draftPil.num, "02");
      assert.equal(draftPil.hindi, null);
      assert.equal(draftPil.tag, null);
      assert.equal(draftPil.icon, "UtensilsCrossed");
      assert.equal(draftPil.status, "draft");
    });

    it("retrieves pillar by ID and returns null for invalid/missing IDs", async () => {
      const found = await dbService.getPillarById(activePillarId);
      assert.ok(found);
      assert.equal(found?.title, "Heritage Palace Venues");

      assert.equal(await dbService.getPillarById(0), null);
      assert.equal(await dbService.getPillarById(-3), null);
      assert.equal(await dbService.getPillarById(999999), null);
    });

    it("lists pillars and filters accurately by status ('active', 'draft', 'all')", async () => {
      const all = await dbService.getPillars();
      const allExplicit = await dbService.getPillars("all");
      assert.ok(all.length >= 2);
      assert.equal(all.length, allExplicit.length);

      const active = await dbService.getPillars("active");
      assert.ok(active.some((p) => p.id === activePillarId));
      assert.ok(active.every((p) => p.status === "active"));

      const drafts = await dbService.getPillars("draft");
      assert.ok(drafts.some((p) => p.id === draftPillarId));
      assert.ok(drafts.every((p) => p.status === "draft"));
    });

    it("updates pillar fields, supports custom icon change, and falls back to 'Landmark' if icon cleared", async () => {
      const updated = await dbService.updatePillar(activePillarId, {
        num: "01",
        title: "Grand Heritage Forts & Palaces",
        icon: "Crown",
        hindi: "राजपूताना शान",
      });

      assert.ok(updated);
      assert.equal(updated?.title, "Grand Heritage Forts & Palaces");
      assert.equal(updated?.icon, "Crown");
      assert.equal(updated?.hindi, "राजपूताना शान");

      const fallbackIcon = await dbService.updatePillar(activePillarId, {
        icon: "   ",
      });
      assert.equal(fallbackIcon?.icon, "Landmark");
    });

    it("deletes pillar and returns false for non-existent ID", async () => {
      const deleted = await dbService.deletePillar(draftPillarId);
      assert.equal(deleted, true);

      const deletedAgain = await dbService.deletePillar(draftPillarId);
      assert.equal(deletedAgain, false);
    });
  });

  describe("2. Next.js API Route Handlers (/api/pillars)", () => {
    let apiPillarId = 0;

    it("POST /api/pillars rejects missing or whitespace-only title/text with 400", async () => {
      const missingTitleRes = await postPillarHandler(
        new NextRequest("http://localhost:3000/api/pillars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "   ",
            text: "Valid description",
          }),
        })
      );
      assert.equal(missingTitleRes.status, 400);

      const missingTextRes = await postPillarHandler(
        new NextRequest("http://localhost:3000/api/pillars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Valid Pillar Title",
            text: "   ",
          }),
        })
      );
      assert.equal(missingTextRes.status, 400);
    });

    it("POST /api/pillars creates a new signature pillar and returns 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num: "03",
          hindi: "लोक संगीत",
          title: "Folk & Royal Entertainment",
          tag: "Manganiyar & Langa",
          text: "Soul-stirring Manganiyar ensembles, Kalbelia dancers, and royal Lawazma processions.",
          icon: "Music",
          status: "active",
        }),
      });

      const res = await postPillarHandler(req);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data?.id > 0);
      assert.equal(body.data.icon, "Music");
      assert.equal(body.data.num, "03");
      apiPillarId = body.data.id;
    });

    it("GET /api/pillars returns pillars and supports ?status=active", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/pillars?status=active"
      );
      const res = await getPillarsHandler(req);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.count >= 2);
      assert.ok(body.data.some((p: any) => p.id === apiPillarId));
    });

    it("PUT /api/pillars/[id] validates empty title/text (400), missing ID (404), and updates pillar + icon (200)", async () => {
      // Empty title -> 400
      const emptyTitleRes = await putPillarHandler(
        new NextRequest(`http://localhost:3000/api/pillars/${apiPillarId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "   " }),
        }),
        { params: Promise.resolve({ id: String(apiPillarId) }) }
      );
      assert.equal(emptyTitleRes.status, 400);

      // Missing ID -> 404
      const missingRes = await putPillarHandler(
        new NextRequest("http://localhost:3000/api/pillars/999999", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ icon: "Sparkles" }),
        }),
        { params: Promise.resolve({ id: "999999" }) }
      );
      assert.equal(missingRes.status, 404);

      // Valid update (including icon change) -> 200
      const updateRes = await putPillarHandler(
        new NextRequest(`http://localhost:3000/api/pillars/${apiPillarId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            icon: "Sparkles",
            tag: "100+ Folk Artists",
            status: "draft",
          }),
        }),
        { params: Promise.resolve({ id: String(apiPillarId) }) }
      );
      const updateBody = await updateRes.json();

      assert.equal(updateRes.status, 200);
      assert.equal(updateBody.success, true);
      assert.equal(updateBody.data.icon, "Sparkles");
      assert.equal(updateBody.data.tag, "100+ Folk Artists");
      assert.equal(updateBody.data.status, "draft");
    });

    it("DELETE /api/pillars/[id] deletes pillar (200), returns 404 on repeat delete, and 400 on invalid ID", async () => {
      const invalidIdRes = await deletePillarHandler(
        new NextRequest("http://localhost:3000/api/pillars/invalid", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: "invalid" }) }
      );
      assert.equal(invalidIdRes.status, 400);

      const delReq = new NextRequest(
        `http://localhost:3000/api/pillars/${apiPillarId}`,
        { method: "DELETE" }
      );
      const delRes = await deletePillarHandler(delReq, {
        params: Promise.resolve({ id: String(apiPillarId) }),
      });
      assert.equal(delRes.status, 200);

      const delAgainRes = await deletePillarHandler(delReq, {
        params: Promise.resolve({ id: String(apiPillarId) }),
      });
      assert.equal(delAgainRes.status, 404);

      // Clean up first test pillar
      await dbService.deletePillar(activePillarId);
    });
  });
});

