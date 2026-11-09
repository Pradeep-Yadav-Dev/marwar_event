import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { dbService } from "../server/src/lib/prisma";
import {
  GET as getReviewsHandler,
  POST as postReviewHandler,
} from "../app/api/reviews/route";
import {
  PUT as putReviewHandler,
  DELETE as deleteReviewHandler,
} from "../app/api/reviews/[id]/route";

describe("Module 4: Reviews Unit Test Suite", () => {
  let activeRevId = 0;
  let draftRevId = 0;

  describe("1. Data Access Layer (dbService)", () => {
    it("creates a review, trims fields, and auto-derives 2-letter uppercase initials", async () => {
      const rev = await dbService.createReview({
        name: "  Ranvijay Singh Rathore  ",
        event: "  Royal Wedding • Mehrangarh, Jodhpur  ",
        quote:
          "  Marwar Event orchestrated our 3-day palace wedding with unforgettable Marwari hospitality!  ",
      });

      assert.ok(rev.id > 0);
      activeRevId = rev.id;

      assert.equal(rev.name, "Ranvijay Singh Rathore");
      assert.equal(rev.event, "Royal Wedding • Mehrangarh, Jodhpur");
      assert.equal(
        rev.quote,
        "Marwar Event orchestrated our 3-day palace wedding with unforgettable Marwari hospitality!"
      );
      assert.equal(rev.initials, "RS");
      assert.equal(rev.rating, 5);
      assert.equal(rev.status, "active");
    });

    it("clamps rating strictly between 1 and 5 and uppercases custom initials", async () => {
      const lowRated = await dbService.createReview({
        name: "Devika Shekhawat",
        event: "Sangeet Night • Udaipur",
        quote: "Magical décor and folk performances.",
        rating: 0,
        initials: " ds ",
        status: "draft",
      });

      draftRevId = lowRated.id;
      assert.equal(lowRated.rating, 1, "Expected rating 0 to clamp to 1");
      assert.equal(lowRated.initials, "DS");
      assert.equal(lowRated.status, "draft");

      const highRated = await dbService.updateReview(draftRevId, {
        rating: 99,
      });
      assert.equal(highRated?.rating, 5, "Expected rating 99 to clamp to 5");
    });

    it("retrieves review by ID and returns null for invalid/missing IDs", async () => {
      const found = await dbService.getReviewById(activeRevId);
      assert.ok(found);
      assert.equal(found?.name, "Ranvijay Singh Rathore");

      assert.equal(await dbService.getReviewById(0), null);
      assert.equal(await dbService.getReviewById(-7), null);
      assert.equal(await dbService.getReviewById(999999), null);
    });

    it("lists reviews and filters accurately by status ('active', 'draft', 'all')", async () => {
      const all = await dbService.getReviews();
      const allExplicit = await dbService.getReviews("all");
      assert.ok(all.length >= 2);
      assert.equal(all.length, allExplicit.length);

      const active = await dbService.getReviews("active");
      assert.ok(active.some((r) => r.id === activeRevId));
      assert.ok(active.every((r) => r.status === "active"));

      const drafts = await dbService.getReviews("draft");
      assert.ok(drafts.some((r) => r.id === draftRevId));
      assert.ok(drafts.every((r) => r.status === "draft"));
    });

    it("updates review fields and re-derives initials when initials are cleared", async () => {
      const updated = await dbService.updateReview(activeRevId, {
        name: "Maharani Gayatri Devi",
        event: "Heritage Gala • Jaipur",
        quote: "Timeless elegance and royal precision.",
        rating: 4,
        initials: "",
      });

      assert.ok(updated);
      assert.equal(updated?.name, "Maharani Gayatri Devi");
      assert.equal(updated?.event, "Heritage Gala • Jaipur");
      assert.equal(updated?.quote, "Timeless elegance and royal precision.");
      assert.equal(updated?.rating, 4);
      assert.equal(updated?.initials, "MG");
    });

    it("deletes review and returns false for non-existent ID", async () => {
      const deleted = await dbService.deleteReview(draftRevId);
      assert.equal(deleted, true);

      const deletedAgain = await dbService.deleteReview(draftRevId);
      assert.equal(deletedAgain, false);
    });
  });

  describe("2. Next.js API Route Handlers (/api/reviews)", () => {
    let apiRevId = 0;

    it("POST /api/reviews rejects missing or whitespace-only name/quote with 400", async () => {
      const missingNameRes = await postReviewHandler(
        new NextRequest("http://localhost:3000/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "   ",
            quote: "Wonderful celebration!",
          }),
        })
      );
      assert.equal(missingNameRes.status, 400);

      const missingQuoteRes = await postReviewHandler(
        new NextRequest("http://localhost:3000/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Thakur Harshvardhan",
            quote: "   ",
          }),
        })
      );
      assert.equal(missingQuoteRes.status, 400);
    });

    it("POST /api/reviews creates a new review and returns 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Thakur Harshvardhan Singh",
          event: "Silver Jubilee • Umaid Bhawan, Jodhpur",
          quote:
            "Every guest felt like royalty from the welcome dhol to the farewell feast.",
          rating: 5,
          status: "active",
        }),
      });

      const res = await postReviewHandler(req);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data?.id > 0);
      assert.equal(body.data.initials, "TH");
      assert.equal(body.data.rating, 5);
      apiRevId = body.data.id;
    });

    it("GET /api/reviews returns reviews and supports ?status=active", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/reviews?status=active"
      );
      const res = await getReviewsHandler(req);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.count >= 2);
      assert.ok(body.data.some((r: any) => r.id === apiRevId));
    });

    it("PUT /api/reviews/[id] validates empty name/quote (400), missing ID (404), and updates review (200)", async () => {
      // Empty quote -> 400
      const emptyQuoteRes = await putReviewHandler(
        new NextRequest(`http://localhost:3000/api/reviews/${apiRevId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote: "   " }),
        }),
        { params: Promise.resolve({ id: String(apiRevId) }) }
      );
      assert.equal(emptyQuoteRes.status, 400);

      // Non-existent ID -> 404
      const missingRes = await putReviewHandler(
        new NextRequest("http://localhost:3000/api/reviews/999999", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: 5 }),
        }),
        { params: Promise.resolve({ id: "999999" }) }
      );
      assert.equal(missingRes.status, 404);

      // Valid update -> 200
      const updateRes = await putReviewHandler(
        new NextRequest(`http://localhost:3000/api/reviews/${apiRevId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote: "Updated testimonial quote for homepage Memoirs slider.",
            rating: 5,
            status: "draft",
          }),
        }),
        { params: Promise.resolve({ id: String(apiRevId) }) }
      );
      const updateBody = await updateRes.json();

      assert.equal(updateRes.status, 200);
      assert.equal(updateBody.success, true);
      assert.equal(
        updateBody.data.quote,
        "Updated testimonial quote for homepage Memoirs slider."
      );
      assert.equal(updateBody.data.status, "draft");
    });

    it("DELETE /api/reviews/[id] deletes review (200), returns 404 on repeat delete, and 400 on invalid ID", async () => {
      const invalidIdRes = await deleteReviewHandler(
        new NextRequest("http://localhost:3000/api/reviews/invalid", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: "invalid" }) }
      );
      assert.equal(invalidIdRes.status, 400);

      const delReq = new NextRequest(
        `http://localhost:3000/api/reviews/${apiRevId}`,
        { method: "DELETE" }
      );
      const delRes = await deleteReviewHandler(delReq, {
        params: Promise.resolve({ id: String(apiRevId) }),
      });
      assert.equal(delRes.status, 200);

      const delAgainRes = await deleteReviewHandler(delReq, {
        params: Promise.resolve({ id: String(apiRevId) }),
      });
      assert.equal(delAgainRes.status, 404);

      // Clean up first test review
      await dbService.deleteReview(activeRevId);
    });
  });
});

