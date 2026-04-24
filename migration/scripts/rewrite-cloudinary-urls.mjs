import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetsPath = path.join(root, 'migration/cloudinary-assets.json');
const reportPath = path.join(root, 'migration/rewrite-report.json');
const targetHost = 'https://img.bedfordfineartgallery.com';

const excludedDirectories = new Set([
  '.git',
  '.nuxt',
  'dist',
  'node_modules',
  'migration',
]);

const textExtensions = new Set([
  '.css',
  '.htm',
  '.html',
  '.js',
  '.json',
  '.md',
  '.vue',
  '.yml',
  '.yaml',
]);

const cloudinaryUrlPattern = /https?:\/\/(?:res\.cloudinary\.com\/dg6smdedp|images\.bedfordfineartgallery\.com\/dg6smdedp)\/image\/upload\/[^"'\\)\]\s<>]+/g;
const manualAliases = new Map([
  ['customer-images/99.jpg', 'customer-images/99_zwy5rn.jpg'],
  ['mailers/img/boskerck_mailer.jpg', 'images/boskerck_mailer2_hqwtgt.jpg'],
]);

function newPublicUrlForKey(key, byKey) {
  const asset = byKey.get(key);
  return asset ? asset.new_public_url : null;
}

function trimTrailingPunctuation(url) {
  let trailing = '';
  while (/[.,;:!?]/.test(url.at(-1))) {
    trailing = url.at(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

function resolveCloudinaryUrl(rawUrl, byKey) {
  const { url, trailing } = trimTrailingPunctuation(rawUrl);
  const uploadMarker = '/image/upload/';
  const uploadIndex = url.indexOf(uploadMarker);
  if (uploadIndex === -1) {
    return null;
  }

  const pathAfterUpload = url
    .slice(uploadIndex + uploadMarker.length)
    .split(/[?#]/)[0]
    .replace(/^\/+/, '');

  const segments = pathAfterUpload.split('/').filter(Boolean);
  const candidates = [];

  candidates.push(pathAfterUpload);
  for (let index = 0; index < segments.length; index += 1) {
    candidates.push(segments.slice(index).join('/'));
  }

  for (const candidate of candidates) {
    const direct = newPublicUrlForKey(candidate, byKey);
    if (direct) {
      return `${direct}${trailing}`;
    }

    const alias = manualAliases.get(candidate);
    if (alias) {
      const aliasUrl = newPublicUrlForKey(alias, byKey);
      if (aliasUrl) {
        return `${aliasUrl}${trailing}`;
      }
    }
  }

  return null;
}

async function walk(directory, files = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    const relative = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        await walk(fullPath, files);
      }
      continue;
    }

    if (textExtensions.has(path.extname(entry.name))) {
      files.push(relative);
    }
  }

  return files;
}

function replaceProvider(content) {
  return content
    .replaceAll('provider="cloudinary"', 'provider="bedford"')
    .replaceAll("provider='cloudinary'", "provider='bedford'");
}

function replaceLegacyCloudinaryHelpers(content) {
  return content
    .replaceAll(".replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')", '')
    .replaceAll('.replace("https://res.cloudinary.com/dg6smdedp/image/upload", "")', '')
    .replaceAll(".replace('https://images.bedfordfineartgallery.com/dg6smdedp/image/upload', '')", '')
    .replaceAll('.replace("https://images.bedfordfineartgallery.com/dg6smdedp/image/upload", "")', '');
}

const assets = JSON.parse(await fs.readFile(assetsPath, 'utf8'));
const byKey = new Map(assets.map((asset) => [asset.target_s3_key, asset]));
const files = await walk(root);
const report = {
  target_host: targetHost,
  files_scanned: files.length,
  files_changed: 0,
  url_replacements: 0,
  provider_replacements: 0,
  helper_replacements: 0,
  unresolved_urls: [],
  changed_files: [],
};

for (const relative of files) {
  const fullPath = path.join(root, relative);
  const original = await fs.readFile(fullPath, 'utf8');
  let providerReplacements = 0;
  let helperReplacements = 0;
  let urlReplacements = 0;
  let next = original.replace(cloudinaryUrlPattern, (match) => {
    const replacement = resolveCloudinaryUrl(match, byKey);
    if (!replacement) {
      report.unresolved_urls.push({ file: relative, url: match });
      return match;
    }
    urlReplacements += 1;
    return replacement;
  });

  const providerBefore = next;
  next = replaceProvider(next);
  providerReplacements += (providerBefore.match(/provider=["']cloudinary["']/g) || []).length;

  const helperBefore = next;
  next = replaceLegacyCloudinaryHelpers(next);
  helperReplacements += helperBefore === next ? 0 : 1;

  if (next !== original) {
    await fs.writeFile(fullPath, next);
    report.files_changed += 1;
    report.url_replacements += urlReplacements;
    report.provider_replacements += providerReplacements;
    report.helper_replacements += helperReplacements;
    report.changed_files.push({
      file: relative,
      url_replacements: urlReplacements,
      provider_replacements: providerReplacements,
      helper_replacements: helperReplacements,
    });
  }
}

await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  files_scanned: report.files_scanned,
  files_changed: report.files_changed,
  url_replacements: report.url_replacements,
  provider_replacements: report.provider_replacements,
  helper_replacements: report.helper_replacements,
  unresolved_urls: report.unresolved_urls.length,
  report: path.relative(root, reportPath),
}, null, 2));

if (report.unresolved_urls.length > 0) {
  process.exitCode = 1;
}
