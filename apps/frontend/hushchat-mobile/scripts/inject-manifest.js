const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "../dist");
const indexPath = path.join(distPath, "index.html");

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");

  // Check if manifest is already there
  if (!html.includes('rel="manifest"')) {
    // Insert manifest link before </head>
    html = html.replace(
      "</head>",
      `  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#000000" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
</head>`
    );

    fs.writeFileSync(indexPath, html);
    console.log("✅ Manifest injected into index.html");
  } else {
    console.log("ℹ️  Manifest already present");
  }
} else {
  console.error("❌ index.html not found in dist/");
}
