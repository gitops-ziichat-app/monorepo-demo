import { getPackages } from '@manypkg/get-packages';
import writeChangeset from '@changesets/write';
import readChangeset from '@changesets/read';
import path from 'path';
import simpleGit from 'simple-git';
import { execSync } from 'child_process';

const cwd = process.cwd();
const git = simpleGit(cwd);

async function autogenerateChangeset() {
  console.log('[DEBUG] Starting autogenerateChangeset in directory:', cwd);
  console.log('[DEBUG] Git repository status:', await git.status().catch(err => {
    console.error('[ERROR] Failed to get git status:', err);
    process.exit(1);
  }));

  // Step 1: Get packages
  console.log('[DEBUG] Fetching packages...');
  const { packages, root } = await getPackages(cwd).catch(err => {
    console.error('[ERROR] Failed to fetch packages:', err);
    process.exit(1);
  });
  const allPackages = root ? packages.concat(root) : packages;
  console.log('[DEBUG] Found packages:', allPackages.map(p => ({
    name: p.packageJson.name,
    dir: p.dir
  })));
  if (root) {
    console.log('[DEBUG] Root package:', root.packageJson.name, 'at', root.dir);
  } else {
    console.log('[DEBUG] No root package found.');
  }

  // Step 2: Get changed files from the latest commit
  console.log('[DEBUG] Fetching files from latest commit...');
  const latestCommit = await git.log({ maxCount: 1 }).catch(err => {
    console.error('[ERROR] Failed to get latest commit:', err);
    process.exit(1);
  });
  const commitHash = latestCommit.latest?.hash;
  console.log('[DEBUG] Latest commit hash:', commitHash);
  if (!commitHash) {
    console.log('[INFO] No commits found in repository. Skipping changeset generation.');
    return;
  }
  const diff = await git.raw(['diff-tree', '--no-commit-id', '--name-only', '-r', commitHash]).catch(err => {
    console.error('[ERROR] Failed to get diff-tree:', err);
    process.exit(1);
  });
  const changedFiles = diff.trim().split('\n').filter(file => file);
  console.log('[DEBUG] Changed files in latest commit:', changedFiles);

  // Step 3: Check if there are any changed files
  if (changedFiles.length === 0) {
    console.log('[INFO] No changed files detected in latest commit. Skipping changeset generation.');
    return;
  }

  // Step 4: Map packages to their relative directories
  console.log('[DEBUG] Mapping package directories...');
  const packageDirs = allPackages.map(p => ({ pkg: p, relDir: path.relative(cwd, p.dir) }));
  const sortedPackageDirs = packageDirs.slice().sort((a, b) => b.relDir.length - a.relDir.length);
  console.log('[DEBUG] Package directories (sorted):', sortedPackageDirs.map(p => ({
    name: p.pkg.packageJson.name,
    dir: p.relDir
  })));

  // Step 5: Identify changed packages
  console.log('[DEBUG] Identifying changed packages...');
  const changedPackageNames = new Set();
  for (const file of changedFiles) {
    const pkgEntry = sortedPackageDirs.find(p => file.startsWith(p.relDir));
    if (pkgEntry) {
      console.log('[DEBUG] File', file, 'belongs to package:', pkgEntry.pkg.packageJson.name);
      changedPackageNames.add(pkgEntry.pkg.packageJson.name);
    } else {
      console.log('[DEBUG] File', file, 'does not belong to any package.');
    }
  }

  // Step 6: Check if any packages are affected
  if (changedPackageNames.size === 0) {
    console.log('[INFO] No changes detected in any package. Skipping changeset generation.');
    return;
  }
  console.log('[DEBUG] Changed packages:', Array.from(changedPackageNames));

  // Step 7: Check for existing changesets
  console.log('[DEBUG] Checking for existing changesets...');
  const existingChangesets = await readChangeset(cwd).catch(err => {
    console.error('[ERROR] Failed to read changesets:', err);
    process.exit(1);
  });
  console.log('[DEBUG] Existing changesets:', existingChangesets.map(c => c.id));
  if (existingChangesets.length > 0) {
    console.log('[INFO] Existing changesets found. Skipping autogeneration.');
    return;
  }

  // Step 8: Get commit message and determine change type
  console.log('[DEBUG] Fetching latest commit message...');
  const commitMessage = execSync('git log -1 --format=%s').toString().trim();
  console.log('[DEBUG] Commit message:', commitMessage);

  const commitPatterns = {
    major: /^BREAKING CHANGE: (.+)/,
    minor: /^feat\(([^)]+)\): (.+)/,
    patch: /^fix\(([^)]+)\): (.+)/,
  };
  let changeType = 'patch';
  let summary = 'chore(release): bump version via CI';

  if (commitPatterns.major.test(commitMessage)) {
    changeType = 'major';
    summary = commitMessage.match(commitPatterns.major)?.[1] || summary;
  } else if (commitPatterns.minor.test(commitMessage)) {
    changeType = 'minor';
    summary = commitMessage.match(commitPatterns.minor)?.[2] || summary;
  } else if (commitPatterns.patch.test(commitMessage)) {
    changeType = 'patch';
    summary = commitMessage.match(commitPatterns.patch)?.[2] || summary;
  }
  console.log('[DEBUG] Determined change type:', changeType);
  console.log('[DEBUG] Determined summary:', summary);

  // Step 9: Create releases
  console.log('[DEBUG] Creating releases for changed packages...');
  const releases = Array.from(changedPackageNames).map(name => ({
    name,
    type: changeType
  }));
  console.log('[DEBUG] Releases:', releases);

  // Step 10: Write changeset
  console.log('[DEBUG] Writing changeset with summary:', summary);
  try {
    // Ensure releases is a valid array and summary is a string
    const changeset = {
      summary,
      releases
    };
    console.log('[DEBUG] Changeset object:', JSON.stringify(changeset, null, 2));
    const changesetPath = await writeChangeset(changeset, cwd);
    console.log('[INFO] Autogenerated changeset:', path.basename(changesetPath));
    console.log('[DEBUG] Full changeset path:', changesetPath);
  } catch (error) {
    console.error('[ERROR] Failed to autogenerate changeset:', error);
    process.exit(1);
  }
}

autogenerateChangeset();