import { POST } from "./app/api/export/route.ts";
import JSZip from "jszip";

// Create a test export request
const exportRequest = {
  format: "react",
  projectName: "verification-test",
  pages: [
    {
      id: "home",
      name: "Home",
      slug: "index",
      components: [
        {
          type: "Header",
          props: { title: "Test Header" },
          children: [],
        },
        {
          type: "Hero",
          props: { title: "Welcome" },
          children: [],
        },
        {
          type: "Footer",
          props: { text: "Footer" },
          children: [],
        },
      ],
    },
  ],
};

const request = new Request("http://localhost:3000/api/export", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(exportRequest),
});

// Call the export API
const response = await POST(request);
const arrayBuffer = await response.arrayBuffer();
const zip = await JSZip.loadAsync(arrayBuffer);

console.log("\n=== Export Structure Verification ===\n");

// Check for app/ directory
const appFiles = Object.keys(zip.files).filter((path) =>
  path.startsWith("app/"),
);
console.log("✓ App Router files found:", appFiles.length > 0 ? "YES" : "NO");
console.log("  Files:", appFiles.join(", "));

// Check for pages/ directory (should NOT exist)
const pagesFiles = Object.keys(zip.files).filter((path) =>
  path.startsWith("pages/"),
);
console.log(
  "\n✓ Pages Router files (should be NONE):",
  pagesFiles.length === 0 ? "CORRECT" : "INCORRECT",
);
if (pagesFiles.length > 0) {
  console.log("  Files:", pagesFiles.join(", "));
}

// Check for app/layout.tsx
console.log(
  "\n✓ app/layout.tsx exists:",
  zip.files["app/layout.tsx"] ? "YES" : "NO",
);

// Check for app/page.tsx
console.log("✓ app/page.tsx exists:", zip.files["app/page.tsx"] ? "YES" : "NO");

// Check for component implementations
const componentFiles = Object.keys(zip.files).filter(
  (path) => path.startsWith("components/") && path.endsWith(".tsx"),
);
console.log("\n✓ Component implementation files:", componentFiles.length);
console.log("  Files:", componentFiles.join(", "));

// Check specific components
console.log(
  "\n✓ Header.tsx exists:",
  zip.files["components/Header.tsx"] ? "YES" : "NO",
);
console.log(
  "✓ Hero.tsx exists:",
  zip.files["components/Hero.tsx"] ? "YES" : "NO",
);
console.log(
  "✓ Footer.tsx exists:",
  zip.files["components/Footer.tsx"] ? "YES" : "NO",
);

console.log("\n=== Verification Complete ===\n");
