import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import {
  dbService,
  getCategoriesUploadDir,
  deleteLocalCategoryImage,
} from "../server/src/lib/prisma";
import {
  GET as getCategoriesHandler,
  POST as postCategoryHandler,
} from "../app/api/categories/route";
import {
  PUT as putCategoryHandler,
  DELETE as deleteCategoryHandler,
} from "../app/api/categories/[id]/route";
import { DELETE as deleteCategoryImageHandler } from "../app/api/categories/[id]/image/route";

describe("Module 2: Categories Unit Test Suite", () => {
  let createdCatId = 0;
  let draftCatId = 0;

  describe("1. Data Access Layer & Local Image Cleanup (dbService)", () => {
    it("ensures local upload directory public/uploads/categories exists", () => {
      const dir = getCategoriesUploadDir();
      assert.ok(fs.existsSync(dir), "Expected upload directory to exist");
      assert.ok(dir.endsWith(path.join("public", "uploads", "categories")));
    });

    it("creates a category, trims fields, and auto-generates kebab-case slug", async () => {
      const cat = await dbService.createCategory({
        name: "  Royal Weddings (Vivaah)  ",
        hindi: "  शाही विवाह  ",
        description: "  Grand palace weddings across Rajasthan  ",
        image: "  /assets/service-wedding-DdBkBope.jpg  ",
      });

      assert.ok(cat.id > 0);
      createdCatId = cat.id;

      assert.equal(cat.name, "Royal Weddings (Vivaah)");
      assert.equal(cat.slug, "royal-weddings-vivaah");
      assert.equal(cat.hindi, "शाही विवाह");
      assert.equal(cat.description, "Grand palace weddings across Rajasthan");
      assert.equal(cat.image, "/assets/service-wedding-DdBkBope.jpg");
      assert.equal(cat.status, "active");
    });

    it("normalizes custom slug and supports draft status", async () => {
      const draftCat = await dbService.createCategory({
        name: "Corporate Galas",
        slug: "  Corporate & Royal Galas!! ",
        hindi: "",
        description: "Executive retreats and heritage conferences",
        image: "",
        status: "draft",
      });

      draftCatId = draftCat.id;
      assert.equal(draftCat.slug, "corporate-royal-galas");
      assert.equal(draftCat.hindi, null);
      assert.equal(draftCat.status, "draft");
    });

    it("retrieves category by ID and returns null for invalid/missing IDs", async () => {
      const found = await dbService.getCategoryById(createdCatId);
      assert.ok(found);
      assert.equal(found?.name, "Royal Weddings (Vivaah)");

      assert.equal(await dbService.getCategoryById(-5), null);
      assert.equal(await dbService.getCategoryById(999999), null);
    });

    it("lists categories and filters accurately by status ('active', 'draft', 'all')", async () => {
      const all = await dbService.getCategories();
      const allExplicit = await dbService.getCategories("all");
      assert.ok(all.length >= 2);
      assert.equal(all.length, allExplicit.length);

      const active = await dbService.getCategories("active");
      assert.ok(active.some((c) => c.id === createdCatId));
      assert.ok(active.every((c) => c.status === "active"));

      const drafts = await dbService.getCategories("draft");
      assert.ok(drafts.some((c) => c.id === draftCatId));
      assert.ok(drafts.every((c) => c.status === "draft"));
    });

    it("automatically deletes replaced local image file when updating category image", async () => {
      const uploadDir = getCategoriesUploadDir();
      const tempFilename = `unit-test-cat-${Date.now()}.jpg`;
      const tempFullPath = path.join(uploadDir, tempFilename);
      fs.writeFileSync(tempFullPath, Buffer.from("fake-image-bytes"));
      const localWebPath = `/uploads/categories/${tempFilename}`;

      // Assign local image to category
      const withLocalImg = await dbService.updateCategory(createdCatId, {
        image: localWebPath,
      });
      assert.equal(withLocalImg?.image, localWebPath);
      assert.equal(fs.existsSync(tempFullPath), true);

      // Replace image -> old local file should be deleted automatically
      const updated = await dbService.updateCategory(createdCatId, {
        name: "Royal Palace Weddings",
        slug: "Royal Palace Weddings",
        image: "/assets/service-sangeet-PuIPsslO.jpg",
      });
      assert.equal(updated?.name, "Royal Palace Weddings");
      assert.equal(updated?.slug, "royal-palace-weddings");
      assert.equal(updated?.image, "/assets/service-sangeet-PuIPsslO.jpg");
      assert.equal(
        fs.existsSync(tempFullPath),
        false,
        "Expected old local category image to be deleted from disk"
      );
    });

    it("deleteLocalCategoryImage ignores external URLs safely", () => {
      const res = deleteLocalCategoryImage(
        "https://example.com/uploads/categories/photo.jpg"
      );
      assert.equal(res, false);
    });

    it("deletes category and returns false for non-existent ID", async () => {
      const deleted = await dbService.deleteCategory(draftCatId);
      assert.equal(deleted, true);

      const deletedAgain = await dbService.deleteCategory(draftCatId);
      assert.equal(deletedAgain, false);
    });
  });

  describe("2. Next.js API Route Handlers (/api/categories)", () => {
    let apiCatId = 0;
    let uploadedWebPath = "";

    it("POST /api/categories rejects missing or whitespace-only name with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "   ",
          description: "Missing name test",
        }),
      });

      const res = await postCategoryHandler(req);
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.equal(body.success, false);
    });

    it("POST /api/categories supports multipart/form-data with imageFile upload (201)", async () => {
      const formData = new FormData();
      formData.append("name", "Sangeet & Mehndi Nights");
      formData.append("slug", "");
      formData.append("hindi", "संगीत व मेहंदी");
      formData.append(
        "description",
        "Dhol nights, folk artists and royal choreography"
      );
      formData.append("status", "active");
      const file = new File([Buffer.from("fake-jpeg-data")], "sangeet-test.jpg", {
        type: "image/jpeg",
      });
      formData.append("imageFile", file);

      const req = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: formData,
      });

      const res = await postCategoryHandler(req);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data?.id > 0);
      assert.equal(body.data.name, "Sangeet & Mehndi Nights");
      assert.equal(body.data.slug, "sangeet-mehndi-nights");
      assert.ok(body.data.image.startsWith("/uploads/categories/"));

      apiCatId = body.data.id;
      uploadedWebPath = body.data.image;

      const fullDiskPath = path.join(
        getCategoriesUploadDir(),
        path.basename(uploadedWebPath)
      );
      assert.equal(
        fs.existsSync(fullDiskPath),
        true,
        "Expected uploaded category image to exist on disk"
      );
    });

    it("GET /api/categories returns categories and supports ?status=active", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/categories?status=active"
      );
      const res = await getCategoriesHandler(req);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.count >= 2);
      assert.ok(body.data.some((c: any) => c.id === apiCatId));
    });

    it("PUT /api/categories/[id] validates empty name (400), missing ID (404), and updates category (200)", async () => {
      // Empty name -> 400
      const badReq = new NextRequest(
        `http://localhost:3000/api/categories/${apiCatId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "   " }),
        }
      );
      const badRes = await putCategoryHandler(badReq, {
        params: Promise.resolve({ id: String(apiCatId) }),
      });
      assert.equal(badRes.status, 400);

      // Non-existent ID -> 404
      const notFoundReq = new NextRequest(
        "http://localhost:3000/api/categories/999999",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Name" }),
        }
      );
      const notFoundRes = await putCategoryHandler(notFoundReq, {
        params: Promise.resolve({ id: "999999" }),
      });
      assert.equal(notFoundRes.status, 404);

      // Valid update -> 200
      const updateReq = new NextRequest(
        `http://localhost:3000/api/categories/${apiCatId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Royal Sangeet & Mehndi",
            description: "Updated sangeet description",
          }),
        }
      );
      const updateRes = await putCategoryHandler(updateReq, {
        params: Promise.resolve({ id: String(apiCatId) }),
      });
      const updateBody = await updateRes.json();

      assert.equal(updateRes.status, 200);
      assert.equal(updateBody.success, true);
      assert.equal(updateBody.data.name, "Royal Sangeet & Mehndi");
      assert.equal(updateBody.data.description, "Updated sangeet description");
      assert.equal(updateBody.data.image, uploadedWebPath);
    });

    it("DELETE /api/categories/[id]/image removes local image from disk and clears image field", async () => {
      const fullDiskPath = path.join(
        getCategoriesUploadDir(),
        path.basename(uploadedWebPath)
      );
      assert.equal(fs.existsSync(fullDiskPath), true);

      const req = new NextRequest(
        `http://localhost:3000/api/categories/${apiCatId}/image`,
        { method: "DELETE" }
      );
      const res = await deleteCategoryImageHandler(req, {
        params: Promise.resolve({ id: String(apiCatId) }),
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.image, "");
      assert.equal(
        fs.existsSync(fullDiskPath),
        false,
        "Expected local file to be removed from disk"
      );
    });

    it("DELETE /api/categories/[id] deletes category (200) and returns 404 on repeat delete", async () => {
      const delReq = new NextRequest(
        `http://localhost:3000/api/categories/${apiCatId}`,
        { method: "DELETE" }
      );
      const delRes = await deleteCategoryHandler(delReq, {
        params: Promise.resolve({ id: String(apiCatId) }),
      });
      assert.equal(delRes.status, 200);

      const delAgainRes = await deleteCategoryHandler(delReq, {
        params: Promise.resolve({ id: String(apiCatId) }),
      });
      assert.equal(delAgainRes.status, 404);

      // Clean up first test category
      await dbService.deleteCategory(createdCatId);
    });
  });
});

