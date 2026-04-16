const path = require('node:path');
const { execFileSync } = require('node:child_process');
const dotenv = require('dotenv');

const cwd = process.cwd();
const envPath = path.join(cwd, '.env');
const resumePath = path.join(cwd, 'resume.json');
const htmlPath = path.join(cwd, 'resume.html');
const resumedBin = path.join(cwd, 'node_modules', 'resumed', 'bin', 'resumed.js');

dotenv.config({ path: envPath });

const theme = process.env.THEME || 'jsonresume-theme-flat-reordered';

runResumed(['validate', resumePath], 'Validation failed.');
runResumed(['render', resumePath, '--theme', theme, '--output', htmlPath], 'Build failed.');

function runResumed(args, message) {
  try {
    execFileSync(process.execPath, [resumedBin, ...args], {
      cwd,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(message);
    process.exit(error.status || 1);
  }
}
