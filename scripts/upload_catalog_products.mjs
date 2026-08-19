#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

function usage() {
  console.error("Usage: node scripts/upload_catalog_products.mjs <products-json> <images-dir>");
  process.exit(1);
}

const [, , jsonArg, imagesArg] = process.argv;
if (!jsonArg || !imagesArg) usage();

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

const jsonPath = path.resolve(projectRoot, jsonArg);
const imagesDir = path.resolve(projectRoot, imagesArg);
const products = readJson(jsonPath);

let uploadedImages = 0;
let writtenProducts = 0;

for (const product of products) {
  const imagePath = product.primaryImageURL
    ? path.join(imagesDir, path.basename(product.primaryImageURL))
    : null;
  const publicImageUrl = imagePath && fs.existsSync(imagePath) ? product.primaryImageURL : null;

  const docRef = db.collection("products").doc(product.id);
  const now = FieldValue.serverTimestamp();

  const payload = {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? null,
    fullDescription: product.fullDescription ?? null,
    productType: product.productType ?? null,
    tags: Array.isArray(product.tags) ? product.tags : [],
    searchKeywords: Array.isArray(product.searchKeywords) ? product.searchKeywords : [],
    status: product.status ?? "active",
    isFeatured: Boolean(product.isFeatured),
    isNewArrival: Boolean(product.isNewArrival),
    isBestSeller: Boolean(product.isBestSeller),
    customerRequestEnabled: product.customerRequestEnabled !== false,
    beautyConcerns: Array.isArray(product.beautyConcerns) ? product.beautyConcerns : [],
    pricingMethod: product.pricingMethod ?? "supplier_confirmation_required",
    displayPrice: product.displayPrice ?? null,
    minEstimatedPrice: product.minEstimatedPrice ?? null,
    maxEstimatedPrice: product.maxEstimatedPrice ?? null,
    recommendedSellingPrice: product.recommendedSellingPrice ?? null,
    platformServiceFee: product.platformServiceFee ?? null,
    platformCommissionPercent: product.platformCommissionPercent ?? null,
    taxPercent: product.taxPercent ?? null,
    currency: product.currency ?? "GHS",
    ingredients: product.ingredients ?? null,
    keyBenefits: product.keyBenefits ?? null,
    howToUse: product.howToUse ?? null,
    warnings: product.warnings ?? null,
    storageInstructions: product.storageInstructions ?? null,
    size: product.size ?? null,
    volume: product.volume ?? null,
    weight: product.weight ?? null,
    dimensions: product.dimensions ?? null,
    packagingType: product.packagingType ?? null,
    shelfLife: product.shelfLife ?? null,
    countryOfManufacture: product.countryOfManufacture ?? null,
    certificationInfo: product.certificationInfo ?? null,
    fdaRegistrationNumber: product.fdaRegistrationNumber ?? null,
    isCrueltyFree: Boolean(product.isCrueltyFree),
    isVegan: Boolean(product.isVegan),
    isOrganic: Boolean(product.isOrganic),
    isDermatologicallyTested: Boolean(product.isDermatologicallyTested),
    isSuitableForSensitiveSkin: Boolean(product.isSuitableForSensitiveSkin),
    primaryImageURL: publicImageUrl,
    videoURL: product.videoURL ?? null,
    stats: {
      assignedSupplierCount: 0,
      requestCount: 0,
      completedOrderCount: 0,
    },
    isDeleted: false,
    createdBy: product.createdBy ?? "catalog-import-2026",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(payload, { merge: true });

  if (publicImageUrl) {
    uploadedImages += 1;
    const imageRef = docRef.collection("images").doc("primary");
    await imageRef.set(
      {
        url: publicImageUrl,
        altText: product.name,
        displayOrder: 1,
        isPrimary: true,
        createdAt: now,
      },
      { merge: true }
    );
  }

  writtenProducts += 1;
}

console.log(`Uploaded images: ${uploadedImages}`);
console.log(`Upserted products: ${writtenProducts}`);
console.log("Image mode: app public folder URLs");
