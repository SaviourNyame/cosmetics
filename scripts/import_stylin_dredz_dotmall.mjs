#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const SOURCE_BASE_URL = "https://dotmall.co.za";
const COLLECTION_HANDLE = "stylin-dredz";
const BRAND_ID = "stylin-dredz";
const BRAND_NAME = "Stylin Dredz";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value.replace(/\\n/g, "\n");
  }
  return out;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(input) {
  if (!input) return "";
  return String(input)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof rawTags === "string") {
    return rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

async function fetchPaginatedCollectionProducts() {
  const limit = 250;
  const all = [];

  for (let page = 1; page <= 40; page += 1) {
    const url = `${SOURCE_BASE_URL}/collections/${COLLECTION_HANDLE}/products.json?limit=${limit}&page=${page}`;
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; cosmetics-import-bot/1.0)",
        accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const products = Array.isArray(data?.products) ? data.products : [];
    if (products.length === 0) {
      break;
    }

    all.push(...products);
    if (products.length < limit) {
      break;
    }
  }

  return all;
}

function normalizeProduct(source) {
  const handle = source.handle ? String(source.handle) : slugify(source.title || source.id || "product");
  const id = `stylin-dredz-${source.id}`;
  const fullDescription = stripHtml(source.body_html);
  const shortDescription = fullDescription.slice(0, 180) || source.title || "";

  const variants = Array.isArray(source.variants) ? source.variants : [];
  const firstVariant = variants[0] || null;
  const displayPrice = firstVariant?.price ? Number.parseFloat(String(firstVariant.price)) : null;
  const currency = firstVariant?.currency ? String(firstVariant.currency) : "ZAR";

  const imageUrl = source?.image?.src || (Array.isArray(source.images) && source.images[0]?.src) || null;
  const tags = parseTags(source.tags);

  const keywordSet = new Set();
  for (const chunk of [source.title, ...tags]) {
    for (const token of String(chunk || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((v) => v.length > 2)) {
      keywordSet.add(token);
    }
  }

  return {
    id,
    slug: handle,
    name: String(source.title || "Unnamed product").trim(),
    shortDescription: shortDescription || null,
    fullDescription: fullDescription || null,
    productType: source.product_type ? String(source.product_type) : null,
    tags: Array.from(new Set(["stylin-dredz", "dotmall", ...tags.map((t) => slugify(t)).filter(Boolean)])),
    searchKeywords: Array.from(keywordSet),
    status: "active",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    customerRequestEnabled: true,
    brandId: BRAND_ID,
    pricingMethod: Number.isFinite(displayPrice) ? "fixed" : "supplier_confirmation_required",
    displayPrice: Number.isFinite(displayPrice) ? displayPrice : null,
    currency,
    isCrueltyFree: false,
    isVegan: false,
    isOrganic: false,
    isDermatologicallyTested: false,
    isSuitableForSensitiveSkin: false,
    primaryImageURL: imageUrl,
    source: {
      platform: "shopify",
      collectionHandle: COLLECTION_HANDLE,
      productId: source.id,
      productUrl: `${SOURCE_BASE_URL}/products/${handle}`,
      paginatedCollectionUrl: `${SOURCE_BASE_URL}/collections/${COLLECTION_HANDLE}?page=1`,
    },
  };
}

async function main() {
  const projectRoot = process.cwd();
  const envFromFile = parseEnvFile(path.join(projectRoot, ".env.local"));
  for (const [k, v] of Object.entries(envFromFile)) {
    if (!process.env[k]) process.env[k] = v;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in environment/.env.local");
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  const db = getFirestore();
  const now = FieldValue.serverTimestamp();

  const sourceProducts = await fetchPaginatedCollectionProducts();
  if (sourceProducts.length === 0) {
    console.log("No products found in source collection.");
    return;
  }

  const normalizedProducts = sourceProducts.map(normalizeProduct);

  await db
    .collection("brands")
    .doc(BRAND_ID)
    .set(
      {
        name: BRAND_NAME,
        logoURL: null,
        description: "Imported from Dotmall Stylin Dredz collection.",
        countryOfOrigin: "South Africa",
        website: `${SOURCE_BASE_URL}/collections/${COLLECTION_HANDLE}?page=1`,
        isActive: true,
        isFeatured: false,
        productCount: normalizedProducts.length,
        assignedSupplierCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

  let writtenProducts = 0;
  let writtenImages = 0;

  for (const product of normalizedProducts) {
    const docRef = db.collection("products").doc(product.id);
    await docRef.set(
      {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        productType: product.productType,
        tags: product.tags,
        searchKeywords: product.searchKeywords,
        status: product.status,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        customerRequestEnabled: product.customerRequestEnabled,
        brandId: product.brandId,
        pricingMethod: product.pricingMethod,
        displayPrice: product.displayPrice,
        minEstimatedPrice: null,
        maxEstimatedPrice: null,
        recommendedSellingPrice: null,
        platformServiceFee: null,
        platformCommissionPercent: null,
        taxPercent: null,
        currency: product.currency,
        ingredients: null,
        keyBenefits: null,
        howToUse: null,
        warnings: null,
        storageInstructions: null,
        size: null,
        volume: null,
        weight: null,
        dimensions: null,
        packagingType: null,
        shelfLife: null,
        countryOfManufacture: "South Africa",
        certificationInfo: null,
        fdaRegistrationNumber: null,
        isCrueltyFree: product.isCrueltyFree,
        isVegan: product.isVegan,
        isOrganic: product.isOrganic,
        isDermatologicallyTested: product.isDermatologicallyTested,
        isSuitableForSensitiveSkin: product.isSuitableForSensitiveSkin,
        primaryImageURL: product.primaryImageURL,
        videoURL: null,
        stats: {
          assignedSupplierCount: 0,
          requestCount: 0,
          completedOrderCount: 0,
        },
        source: product.source,
        isDeleted: false,
        createdBy: "dotmall-import",
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
    writtenProducts += 1;

    if (product.primaryImageURL) {
      await docRef.collection("images").doc("primary").set(
        {
          url: product.primaryImageURL,
          altText: product.name,
          displayOrder: 1,
          isPrimary: true,
          createdAt: now,
        },
        { merge: true }
      );
      writtenImages += 1;
    }
  }

  const outputDir = path.join(projectRoot, "data", "imports");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "stylin-dredz-products.json");
  fs.writeFileSync(outputPath, JSON.stringify(normalizedProducts, null, 2));

  console.log(`Source products: ${sourceProducts.length}`);
  console.log(`Brand upserted: ${BRAND_ID}`);
  console.log(`Products upserted: ${writtenProducts}`);
  console.log(`Primary images upserted: ${writtenImages}`);
  console.log(`Snapshot JSON: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
