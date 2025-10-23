const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing dependencies before build...');

// Check for web-incompatible dependencies
console.log('📋 Checking for potential web compatibility issues...');
exec('npm ls --depth=0', (error, stdout, stderr) => {
  if (stdout) {
    const lines = stdout.split('\n');
    const webIncompatible = lines
      .filter((line) => line.match(/(react-native-|expo-)/))
      .filter(
        (line) =>
          !line.match(
            /(react-native-web|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens)/,
          ),
      );

    if (webIncompatible.length > 0) {
      console.log('⚠️  Potentially web-incompatible dependencies found:');
      webIncompatible.forEach((dep) => console.log(`   ${dep.trim()}`));
    } else {
      console.log('✅ No obvious web compatibility issues found');
    }
  }

  console.log('\n🏗️  Building production version...');

  // Build the web version
  const buildProcess = spawn('npx', ['expo', 'export', '-p', 'web'], {
    stdio: 'inherit',
    shell: true,
  });

  buildProcess.on('close', (code) => {
    if (code !== 0) {
      console.log('❌ Build failed! Check the errors above.');
      process.exit(1);
    }

    console.log('\n📊 Analyzing bundle contents...');

    // Check bundle size
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      try {
        const staticJsPath = path.join(distPath, '_expo', 'static', 'js', 'web');
        if (fs.existsSync(staticJsPath)) {
          const files = fs.readdirSync(staticJsPath).filter((f) => f.startsWith('entry-'));
          if (files.length > 0) {
            const stats = fs.statSync(path.join(staticJsPath, files[0]));
            const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`📦 Main bundle size: ${sizeInMB} MB`);
          }
        }
      } catch {
        console.log('⚠️  Could not analyze bundle size');
      }

      // List generated files
      console.log('\n📁 Generated files:');
      exec(
        'find dist -name "*.js" -o -name "*.css" -o -name "*.html" | head -10',
        (err, stdout) => {
          if (stdout) {
            stdout
              .split('\n')
              .filter((f) => f.trim())
              .forEach((file) => {
                console.log(`   ${file}`);
              });
          }
        },
      );
    }

    console.log('\n🚀 Starting local server...');
    console.log('💡 Open browser DevTools Console to check for:');
    console.log('   - Missing module errors');
    console.log('   - 404 asset errors');
    console.log('   - Runtime dependency issues');

    // Start the server
    const serverProcess = spawn('npx', ['serve', 'dist', '-s', '-l', '3000'], {
      stdio: 'inherit',
      shell: true,
    });

    console.log('\n🌐 Server running at: http://localhost:3000');
    console.log('📋 Test checklist:');
    console.log('   □ Check browser console for errors');
    console.log('   □ Navigate to all app routes');
    console.log('   □ Test core functionality');
    console.log('   □ Check Network tab for failed requests');
    console.log('\nPress Ctrl+C to stop server and see analysis');

    // Handle cleanup
    const cleanup = () => {
      console.log('\n🛑 Stopping server...');
      serverProcess.kill();

      console.log('\n📋 Post-test dependency analysis:');
      console.log('💡 Common signs of missing dependencies:');
      console.log('   - "Module not found" errors in console');
      console.log('   - Features that work in dev but not production');
      console.log('   - White screens or infinite loading');
      console.log('   - 404 errors for assets');
      console.log('\n🔧 To investigate further, run:');
      console.log('   npx expo export -p web --dump-assetmap');
      console.log('   npm audit');
      console.log('   expo doctor');

      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  });
});
