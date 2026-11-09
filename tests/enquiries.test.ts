import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { dbService } from "../server/src/lib/prisma";
import {
  GET as getInquiriesHandler,
  POST as postInquiryHandler,
} from "../app/api/inquiries/route";
import { PUT as putInquiryStatusHandler } from "../app/api/inquiries/[id]/status/route";
import { DELETE as deleteInquiryHandler } from "../app/api/inquiries/[id]/route";

describe("Module 1: Enquiries (Inquiries) Unit Test Suite", () => {
  let createdId = 0;
  let secondId = 0;

  describe("1. Data Access Layer (dbService)", () => {
    it("creates a new enquiry with default PENDING status and trims whitespace", async () => {
      const inquiry = await dbService.createInquiry({
        name: "  Maharaja Sawai Padmanabh  ",
        email: "  padmanabh@jaipurpalace.in  ",
        phone: "  +91 98290 11223  ",
        serviceName: "  Shaadi & Royal Baraat  ",
        eventDate: "2026-12-18",
        guestCount: "500-800",
        budget: "₹50L - ₹1Cr",
        message: "  Looking for a 3-day heritage palace wedding in Jodhpur.  ",
      });

      assert.ok(inquiry.id > 0, "Expected numeric inquiry ID > 0");
      createdId = inquiry.id;

      assert.equal(inquiry.name, "Maharaja Sawai Padmanabh");
      assert.equal(inquiry.email, "padmanabh@jaipurpalace.in");
      assert.equal(inquiry.phone, "+91 98290 11223");
      assert.equal(inquiry.serviceName, "Shaadi & Royal Baraat");
      assert.equal(inquiry.eventDate, "2026-12-18");
      assert.equal(inquiry.guestCount, "500-800");
      assert.equal(inquiry.budget, "₹50L - ₹1Cr");
      assert.equal(
        inquiry.message,
        "Looking for a 3-day heritage palace wedding in Jodhpur."
      );
      assert.equal(inquiry.status, "PENDING");
    });

    it("applies default serviceName ('General Event') when serviceName is omitted", async () => {
      const second = await dbService.createInquiry({
        name: "Rani Padmini Rathore",
        email: "",
        phone: "9876543210",
        message: "Sangeet night inquiry in Udaipur",
      });

      secondId = second.id;
      assert.equal(second.serviceName, "General Event");
      assert.equal(second.status, "PENDING");
    });

    it("retrieves enquiry by ID via getInquiryById and returns null for invalid ID", async () => {
      const found = await dbService.getInquiryById(createdId);
      assert.ok(found, "Expected inquiry to be found by ID");
      assert.equal(found?.name, "Maharaja Sawai Padmanabh");

      const invalid = await dbService.getInquiryById(-1);
      assert.equal(invalid, null);

      const missing = await dbService.getInquiryById(999999);
      assert.equal(missing, null);
    });

    it("lists all enquiries when status is undefined or 'ALL'", async () => {
      const all = await dbService.getInquiries();
      const allExplicit = await dbService.getInquiries("ALL");

      assert.ok(all.length >= 2);
      assert.equal(all.length, allExplicit.length);
    });

    it("updates enquiry status and saves internal staff notes", async () => {
      const updated = await dbService.updateInquiryStatus(
        createdId,
        "CONTACTED",
        "Spoke with family concierge; shared Umaid Bhawan proposal."
      );

      assert.ok(updated);
      assert.equal(updated?.status, "CONTACTED");
      assert.equal(
        updated?.notes,
        "Spoke with family concierge; shared Umaid Bhawan proposal."
      );
    });

    it("preserves existing staff notes when updating status without passing notes", async () => {
      const updated = await dbService.updateInquiryStatus(
        createdId,
        "CONFIRMED"
      );

      assert.ok(updated);
      assert.equal(updated?.status, "CONFIRMED");
      assert.equal(
        updated?.notes,
        "Spoke with family concierge; shared Umaid Bhawan proposal."
      );
    });

    it("allows clearing staff notes by passing an empty string", async () => {
      const cleared = await dbService.updateInquiryStatus(
        createdId,
        "CONFIRMED",
        ""
      );

      assert.ok(cleared);
      assert.equal(cleared?.notes, "");
    });

    it("filters enquiries accurately by status", async () => {
      const confirmed = await dbService.getInquiries("CONFIRMED");
      assert.ok(confirmed.some((i) => i.id === createdId));
      assert.ok(confirmed.every((i) => i.status === "CONFIRMED"));

      const pending = await dbService.getInquiries("PENDING");
      assert.ok(pending.some((i) => i.id === secondId));
      assert.ok(pending.every((i) => i.status === "PENDING"));
    });

    it("computes dashboard enquiry statistics accurately", async () => {
      const stats = await dbService.getDashboardStats();
      assert.ok(stats.totalInquiries >= 2);
      assert.ok(stats.pendingInquiries >= 1);
      assert.ok(stats.confirmedEvents >= 1);
      assert.ok(Array.isArray(stats.recentInquiries));
    });

    it("deletes an enquiry and returns false when deleting a non-existent ID", async () => {
      const deleted = await dbService.deleteInquiry(secondId);
      assert.equal(deleted, true);

      const deletedAgain = await dbService.deleteInquiry(secondId);
      assert.equal(deletedAgain, false);
    });
  });

  describe("2. Next.js API Route Handlers (/api/inquiries)", () => {
    let apiCreatedId = 0;

    it("POST /api/inquiries rejects missing or whitespace-only required fields with 400", async () => {
      const badReq = new NextRequest("http://localhost:3000/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "   ",
          phone: "9999999999",
          message: "Royal event",
        }),
      });

      const res = await postInquiryHandler(badReq);
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.equal(body.success, false);
    });

    it("POST /api/inquiries creates a new enquiry and returns 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Kunwar Vikramaditya Singh",
          email: "vikram@bikanerhouse.in",
          phone: "+91 94141 55667",
          serviceName: "Heritage Anniversary Gala",
          eventDate: "2026-11-25",
          guestCount: "150-400",
          budget: "₹15L - ₹25L",
          message: "25th Silver Jubilee celebration at Laxmi Niwas Palace.",
        }),
      });

      const res = await postInquiryHandler(req);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data?.id > 0);
      assert.equal(body.data.status, "PENDING");
      apiCreatedId = body.data.id;
    });

    it("GET /api/inquiries returns all enquiries and supports ?status= filter", async () => {
      const getAllReq = new NextRequest("http://localhost:3000/api/inquiries");
      const getAllRes = await getInquiriesHandler(getAllReq);
      const getAllBody = await getAllRes.json();

      assert.equal(getAllRes.status, 200);
      assert.equal(getAllBody.success, true);
      assert.ok(getAllBody.count >= 2);

      const getPendingReq = new NextRequest(
        "http://localhost:3000/api/inquiries?status=PENDING"
      );
      const getPendingRes = await getInquiriesHandler(getPendingReq);
      const getPendingBody = await getPendingRes.json();

      assert.equal(getPendingRes.status, 200);
      assert.ok(
        getPendingBody.data.every((item: any) => item.status === "PENDING")
      );
    });

    it("PUT /api/inquiries/[id]/status validates status and updates status + notes", async () => {
      // Invalid status should return 400
      const invalidReq = new NextRequest(
        `http://localhost:3000/api/inquiries/${apiCreatedId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "UNKNOWN_STATE" }),
        }
      );
      const invalidRes = await putInquiryStatusHandler(invalidReq, {
        params: Promise.resolve({ id: String(apiCreatedId) }),
      });
      assert.equal(invalidRes.status, 400);

      // Valid status (case-insensitive) + notes should return 200
      const validReq = new NextRequest(
        `http://localhost:3000/api/inquiries/${apiCreatedId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            notes: "Event completed with 5-star guest feedback.",
          }),
        }
      );
      const validRes = await putInquiryStatusHandler(validReq, {
        params: Promise.resolve({ id: String(apiCreatedId) }),
      });
      const validBody = await validRes.json();

      assert.equal(validRes.status, 200);
      assert.equal(validBody.success, true);
      assert.equal(validBody.data.status, "COMPLETED");
      assert.equal(
        validBody.data.notes,
        "Event completed with 5-star guest feedback."
      );
    });

    it("PUT /api/inquiries/[id]/status returns 404 for non-existent ID", async () => {
      const notFoundReq = new NextRequest(
        "http://localhost:3000/api/inquiries/999999/status",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );
      const notFoundRes = await putInquiryStatusHandler(notFoundReq, {
        params: Promise.resolve({ id: "999999" }),
      });
      assert.equal(notFoundRes.status, 404);
    });

    it("DELETE /api/inquiries/[id] deletes inquiry (200) and returns 404 on repeat delete", async () => {
      const delReq = new NextRequest(
        `http://localhost:3000/api/inquiries/${apiCreatedId}`,
        { method: "DELETE" }
      );
      const delRes = await deleteInquiryHandler(delReq, {
        params: Promise.resolve({ id: String(apiCreatedId) }),
      });
      const delBody = await delRes.json();

      assert.equal(delRes.status, 200);
      assert.equal(delBody.success, true);

      const delAgainRes = await deleteInquiryHandler(delReq, {
        params: Promise.resolve({ id: String(apiCreatedId) }),
      });
      assert.equal(delAgainRes.status, 404);

      // Clean up first test inquiry as well
      await dbService.deleteInquiry(createdId);
    });
  });
});

