const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

logDebug("🔍 Analyzing dependencies before build...");

// Check for web-incompatible dependencies
logDebug("📋 Checking for potential web compatibility issues...");
exec("npm ls --depth=0", (error, stdout) => {
  if (stdout) {
    const lines = stdout.split("\n");
    const webIncompatible = lines
      .filter((line) => line.match(/(react-native-|expo-)/))
      .filter(
        (line) =>
          !line.match(
            /(react-native-web|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens)/
          )
      );

    if (webIncompatible.length > 0) {
      logDebug("⚠️  Potentially web-incompatible dependencies found:");
      webIncompatible.forEach((dep) => logDebug(`   ${dep.trim()}`));
    } else {
      logDebug("✅ No obvious web compatibility issues found");
    }
  }

  logDebug("\n🏗️  Building production version...");

  // Build the web version
  const buildProcess = spawn("npx", ["expo", "export", "-p", "web"], {
    stdio: "inherit",
    shell: true,
  });

  buildProcess.on("close", (code) => {
    if (code !== 0) {
      logDebug("❌ Build failed! Check the errors above.");
      process.exit(1);
    }

    logDebug("\n📊 Analyzing bundle contents...");

    // Check bundle size
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      try {
        const staticJsPath = path.join(distPath, "_expo", "static", "js", "web");
        if (fs.existsSync(staticJsPath)) {
          const files = fs.readdirSync(staticJsPath).filter((f) => f.startsWith("entry-"));
          if (files.length > 0) {
            const stats = fs.statSync(path.join(staticJsPath, files[0]));
            const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
            logDebug(`📦 Main bundle size: ${sizeInMB} MB`);
          }
        }
      } catch {
        logDebug("⚠️  Could not analyze bundle size");
      }

      // List generated files
      logDebug("\n📁 Generated files:");
      exec(
        'find dist -name "*.js" -o -name "*.css" -o -name "*.html" | head -10',
        (err, stdout) => {
          if (stdout) {
            stdout
              .split("\n")
              .filter((f) => f.trim())
              .forEach((file) => {
                logDebug(`   ${file}`);
              });
          }
        }
      );
    }

    logDebug("\n🚀 Starting local server...");
    logDebug("💡 Open browser DevTools Console to check for:");
    logDebug("   - Missing module errors");
    logDebug("   - 404 asset errors");
    logDebug("   - Runtime dependency issues");

    // Start the server
    const serverProcess = spawn("npx", ["serve", "dist", "-s", "-l", "3000"], {
      stdio: "inherit",
      shell: true,
    });

    logDebug("\n🌐 Server running at: http://localhost:3000");
    logDebug("📋 Test checklist:");
    logDebug("   □ Check browser console for errors");
    logDebug("   □ Navigate to all app routes");
    logDebug("   □ Test core functionality");
    logDebug("   □ Check Network tab for failed requests");
    logDebug("\nPress Ctrl+C to stop server and see analysis");

    // Handle cleanup
    const cleanup = () => {
      logDebug("\n🛑 Stopping server...");
      serverProcess.kill();

      logDebug("\n📋 Post-test dependency analysis:");
      logDebug("💡 Common signs of missing dependencies:");
      logDebug('   - "Module not found" errors in console');
      logDebug("   - Features that work in dev but not production");
      logDebug("   - White screens or infinite loading");
      logDebug("   - 404 errors for assets");
      logDebug("\n🔧 To investigate further, run:");
      logDebug("   npx expo export -p web --dump-assetmap");
      logDebug("   npm audit");
      logDebug("   expo doctor");

      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  });
});
