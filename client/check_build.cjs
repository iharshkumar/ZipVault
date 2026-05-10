const { execSync } = require('child_process');
try {
  console.log("Running npm run build...");
  execSync('npm run build', { stdio: 'pipe' });
  console.log("Build succeeded!");
} catch (error) {
  console.error("Build failed. First 1000 characters of stderr:");
  console.error(error.stderr.toString('utf8').substring(0, 1000));
}
