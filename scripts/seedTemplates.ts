// Script to seed initial templates to Firestore
// Run with: npx tsx scripts/seedTemplates.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { config } from "dotenv";
import { resolve } from "path";
import { readdirSync, readFileSync } from "fs";

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

console.log("✓ Environment variables loaded\n");

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Firebase configuration is incomplete!");
    console.log("\nMissing variables:");
    if (!firebaseConfig.apiKey) console.log("  - NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain) console.log("  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId) console.log("  - NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!firebaseConfig.storageBucket) console.log("  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
    if (!firebaseConfig.messagingSenderId) console.log("  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
    if (!firebaseConfig.appId) console.log("  - NEXT_PUBLIC_FIREBASE_APP_ID");
    console.log("\nPlease check your .env file has all required Firebase variables.");
    process.exit(1);
}

console.log("✓ Firebase config loaded successfully");
console.log(`✓ Project ID: ${firebaseConfig.projectId}\n`);

// Initialize Firebase for the script
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Load templates from the templates folder
function loadTemplates() {
    const templatesDir = resolve(process.cwd(), "templates");
    const templateFiles = readdirSync(templatesDir).filter((file) => file.endsWith(".json"));

    console.log(`📂 Found ${templateFiles.length} template file(s)\n`);

    const templates = templateFiles.map((file) => {
        const filePath = resolve(templatesDir, file);
        const fileContent = readFileSync(filePath, "utf-8");
        const template = JSON.parse(fileContent);
        console.log(`  ✓ Loaded: ${template.name}`);
        return template;
    });

    console.log();
    return templates;
}

async function seedTemplates() {
    console.log("Starting to seed templates...\n");

    try {
        // Load templates from files
        const templates = loadTemplates();

        const templatesRef = collection(db, "templates");

        // First, clear all existing templates
        console.log("🗑️  Clearing existing templates...");
        const existingTemplates = await getDocs(templatesRef);

        let deletedCount = 0;
        for (const docSnapshot of existingTemplates.docs) {
            await deleteDoc(doc(db, "templates", docSnapshot.id));
            deletedCount++;
        }

        if (deletedCount > 0) {
            console.log(`✓ Deleted ${deletedCount} existing template(s)\n`);
        } else {
            console.log("✓ No existing templates to delete\n");
        }

        // Now add the new templates
        console.log("📝 Adding new templates...");
        for (const template of templates) {
            const docRef = await addDoc(templatesRef, {
                ...template,
                createdAt: serverTimestamp(),
            });
            console.log(`✓ Created template: ${template.name} (${docRef.id})`);
        }

        console.log("\n✅ All templates seeded successfully!");
        console.log(`📊 Total templates: ${templates.length}`);
    } catch (error) {
        console.error("❌ Error seeding templates:", error);
    }
}

seedTemplates();
