import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { dbService } from "../server/src/lib/prisma";
import {
  GET as getServicesHandler,
  POST as postServiceHandler,
} from "../app/api/services/route";
import {
  GET as getSingleServiceHandler,
  PUT as putServiceHandler,
  DELETE as deleteServiceHandler,
} from "../app/api/services/[id]/route";

describe("Module 3: Services / Packages Unit Test Suite", () => {
  let weddingServiceId = 0;
  let corporateDraftId = 0;

  describe("1. Data Access Layer (dbService)", () => {
    it("creates a service package, trims fields, and auto-generates slug and defaults", async () => {
      const svc = await dbService.createService({
        title: "  Shahi Rajwada Shaadi & Vivaah  ",
        category: "  Wedding  ",
        price: "  ₹15,00,000 Onwards  ",
        shortDesc: "  3-Day Palace Wedding Experience  ",
        description:
          "  Complete royal wedding orchestration with vintage car baraat, folk artists, and Marwari banquet.  ",
        features: ["Palace Venue", "Shehnai & Folk Artists", "Royal Banquet"] as any,
        isPopular: true,
      });

      assert.ok(svc.id > 0);
      weddingServiceId = svc.id;

      assert.equal(svc.title, "Shahi Rajwada Shaadi & Vivaah");
      assert.equal(svc.slug, "shahi-rajwada-shaadi-vivaah");
      assert.equal(svc.category, "Wedding");
      assert.equal(svc.price, "₹15,00,000 Onwards");
      assert.equal(svc.shortDesc, "3-Day Palace Wedding Experience");
      assert.equal(svc.icon, "Sparkles");
      assert.equal(svc.isPopular, true);
      assert.equal(svc.status, "active");
      assert.equal(svc.metaTitle, "Shahi Rajwada Shaadi & Vivaah");
      assert.equal(svc.metaDesc, "3-Day Palace Wedding Experience");
      assert.deepEqual(JSON.parse(svc.features), [
        "Palace Venue",
        "Shehnai & Folk Artists",
        "Royal Banquet",
      ]);
    });

    it("applies default category, price, shortDesc, and normalizes custom slug", async () => {
      const draftSvc = await dbService.createService({
        title: "Maharaja Corporate Conclave",
        slug: "  Maharaja & Corporate Conclave!! ",
        category: "Corporate",
        description: "Heritage fort corporate gala and leadership summit.",
        status: "draft",
      });

      corporateDraftId = draftSvc.id;
      assert.equal(draftSvc.slug, "maharaja-corporate-conclave");
      assert.equal(draftSvc.price, "₹50,000");
      assert.equal(draftSvc.shortDesc, "Maharaja Corporate Conclave");
      assert.equal(draftSvc.status, "draft");
    });

    it("retrieves service by numeric ID and returns null for invalid/missing IDs", async () => {
      const found = await dbService.getServiceById(weddingServiceId);
      assert.ok(found);
      assert.equal(found?.title, "Shahi Rajwada Shaadi & Vivaah");

      assert.equal(await dbService.getServiceById(0), null);
      assert.equal(await dbService.getServiceById(-10), null);
      assert.equal(await dbService.getServiceById(999999), null);
    });

    it("retrieves service by slug (case-insensitive) and returns null for missing slug", async () => {
      const found = await dbService.getServiceBySlug(
        "SHAHI-RAJWADA-SHAADI-VIVAAH"
      );
      assert.ok(found);
      assert.equal(found?.id, weddingServiceId);

      assert.equal(await dbService.getServiceBySlug(""), null);
      assert.equal(await dbService.getServiceBySlug("non-existent-slug"), null);
    });

    it("filters services by category and status accurately", async () => {
      const all = await dbService.getServices();
      const allExplicit = await dbService.getServices("All", "all");
      assert.ok(all.length >= 2);
      assert.equal(all.length, allExplicit.length);

      const activeWeddings = await dbService.getServices("wedding", "active");
      assert.ok(activeWeddings.some((s) => s.id === weddingServiceId));
      assert.ok(
        activeWeddings.every(
          (s) =>
            s.category.toLowerCase() === "wedding" && s.status === "active"
        )
      );

      const drafts = await dbService.getServices(undefined, "draft");
      assert.ok(drafts.some((s) => s.id === corporateDraftId));
      assert.ok(drafts.every((s) => s.status === "draft"));
    });

    it("updates service package fields and normalizes updated slug", async () => {
      const updated = await dbService.updateService(weddingServiceId, {
        title: "Grand Shahi Rajwada Vivaah",
        slug: "Grand Shahi Rajwada Vivaah!",
        price: "₹18,00,000 Onwards",
        features: "Palace Courtyard, Vintage Baraat, Royal Feast",
      });

      assert.ok(updated);
      assert.equal(updated?.title, "Grand Shahi Rajwada Vivaah");
      assert.equal(updated?.slug, "grand-shahi-rajwada-vivaah");
      assert.equal(updated?.price, "₹18,00,000 Onwards");
      assert.equal(
        updated?.features,
        "Palace Courtyard, Vintage Baraat, Royal Feast"
      );
    });

    it("reflects totalServices in getDashboardStats()", async () => {
      const stats = await dbService.getDashboardStats();
      assert.ok(stats.totalServices >= 2);
    });

    it("deletes service package and returns false for non-existent ID", async () => {
      const deleted = await dbService.deleteService(corporateDraftId);
      assert.equal(deleted, true);

      const deletedAgain = await dbService.deleteService(corporateDraftId);
      assert.equal(deletedAgain, false);
    });
  });

  describe("2. Next.js API Route Handlers (/api/services)", () => {
    let apiServiceId = 0;

    it("POST /api/services rejects missing or whitespace-only title/description with 400", async () => {
      const missingTitleReq = new NextRequest(
        "http://localhost:3000/api/services",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "   ",
            description: "Valid description",
          }),
        }
      );
      const res1 = await postServiceHandler(missingTitleReq);
      assert.equal(res1.status, 400);

      const missingDescReq = new NextRequest(
        "http://localhost:3000/api/services",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Valid Title",
            description: "   ",
          }),
        }
      );
      const res2 = await postServiceHandler(missingDescReq);
      assert.equal(res2.status, 400);
    });

    it("POST /api/services creates a new service package and returns 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Royal Sangeet & Dhol Night",
          category: "Wedding",
          price: "₹4,50,000 Onwards",
          shortDesc: "Manganiyar folk fusion and celebrity choreography",
          description:
            "Staged under starlit palace courtyards with acoustic folk ensembles and LED concert lighting.",
          image: "/assets/service-sangeet-PuIPsslO.jpg",
          features: "Manganiyar Troupe, Royal Stage, Concert Sound",
          status: "active",
        }),
      });

      const res = await postServiceHandler(req);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data?.id > 0);
      assert.equal(body.data.slug, "royal-sangeet-dhol-night");
      apiServiceId = body.data.id;
    });

    it("GET /api/services supports ?category= and ?status= query filters", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/services?category=Wedding&status=active"
      );
      const res = await getServicesHandler(req);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.count >= 2);
      assert.ok(body.data.some((s: any) => s.id === apiServiceId));
    });

    it("GET /api/services/[id] fetches service by numeric ID or slug and returns 404 when missing", async () => {
      // By ID
      const byIdRes = await getSingleServiceHandler(
        new NextRequest(`http://localhost:3000/api/services/${apiServiceId}`),
        { params: Promise.resolve({ id: String(apiServiceId) }) }
      );
      const byIdBody = await byIdRes.json();
      assert.equal(byIdRes.status, 200);
      assert.equal(byIdBody.data.id, apiServiceId);

      // By Slug
      const bySlugRes = await getSingleServiceHandler(
        new NextRequest(
          "http://localhost:3000/api/services/royal-sangeet-dhol-night"
        ),
        { params: Promise.resolve({ id: "royal-sangeet-dhol-night" }) }
      );
      const bySlugBody = await bySlugRes.json();
      assert.equal(bySlugRes.status, 200);
      assert.equal(bySlugBody.data.id, apiServiceId);

      // Missing -> 404
      const missingRes = await getSingleServiceHandler(
        new NextRequest("http://localhost:3000/api/services/missing-package"),
        { params: Promise.resolve({ id: "missing-package" }) }
      );
      assert.equal(missingRes.status, 404);
    });

    it("PUT /api/services/[id] validates empty title/description (400), missing ID (404), and updates package (200)", async () => {
      // Empty title -> 400
      const emptyTitleRes = await putServiceHandler(
        new NextRequest(`http://localhost:3000/api/services/${apiServiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "   " }),
        }),
        { params: Promise.resolve({ id: String(apiServiceId) }) }
      );
      assert.equal(emptyTitleRes.status, 400);

      // Missing ID -> 404
      const missingRes = await putServiceHandler(
        new NextRequest("http://localhost:3000/api/services/999999", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: "₹5,00,000" }),
        }),
        { params: Promise.resolve({ id: "999999" }) }
      );
      assert.equal(missingRes.status, 404);

      // Valid update -> 200
      const updateRes = await putServiceHandler(
        new NextRequest(`http://localhost:3000/api/services/${apiServiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: "₹5,25,000 Onwards",
            status: "draft",
          }),
        }),
        { params: Promise.resolve({ id: String(apiServiceId) }) }
      );
      const updateBody = await updateRes.json();
      assert.equal(updateRes.status, 200);
      assert.equal(updateBody.data.price, "₹5,25,000 Onwards");
      assert.equal(updateBody.data.status, "draft");
    });

    it("DELETE /api/services/[id] deletes package (200), returns 404 on repeat delete, and 400 on invalid ID", async () => {
      const invalidIdRes = await deleteServiceHandler(
        new NextRequest("http://localhost:3000/api/services/abc", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: "abc" }) }
      );
      assert.equal(invalidIdRes.status, 400);

      const delReq = new NextRequest(
        `http://localhost:3000/api/services/${apiServiceId}`,
        { method: "DELETE" }
      );
      const delRes = await deleteServiceHandler(delReq, {
        params: Promise.resolve({ id: String(apiServiceId) }),
      });
      assert.equal(delRes.status, 200);

      const delAgainRes = await deleteServiceHandler(delReq, {
        params: Promise.resolve({ id: String(apiServiceId) }),
      });
      assert.equal(delAgainRes.status, 404);

      // Clean up first test service
      await dbService.deleteService(weddingServiceId);
    });
  });
});

