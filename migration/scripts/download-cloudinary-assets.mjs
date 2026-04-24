import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputPath = path.join(root, 'migration/cloudinary-assets.json');
const outputRoot = path.join(root, 'migration/cloudinary-downloads');
const reportPath = path.join(root, 'migration/download-report.json');
const concurrency = Number(process.env.CLOUDINARY_DOWNLOAD_CONCURRENCY || 12);

function parseCloudinaryUrl(value) {
  const match = value.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)$/);
  if (!match) {
    throw new Error('Expected CLOUDINARY_URL in cloudinary://api_key:api_secret@cloud_name format');
  }
  return {
    apiKey: decodeURIComponent(match[1]),
    apiSecret: decodeURIComponent(match[2]),
    cloudName: decodeURIComponent(match[3]),
  };
}

async function readCloudinaryUrl() {
  if (process.env.CLOUDINARY_URL) {
    return process.env.CLOUDINARY_URL;
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}

function signDownloadUrl({ asset, credentials }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    attachment: 'false',
    expires_at: String(timestamp + 86400),
    format: asset.format,
    public_id: asset.public_id,
    timestamp: String(timestamp),
    type: asset.type || 'upload',
  };

  const payload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(`${payload}${credentials.apiSecret}`)
    .digest('hex');

  const url = new URL(`https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/download`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('signature', signature);
  url.searchParams.set('api_key', credentials.apiKey);

  return url;
}

async function fileSize(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function downloadAsset(asset, credentials) {
  const destination = path.join(outputRoot, asset.target_s3_key);
  const partial = `${destination}.part`;
  const existingSize = await fileSize(destination);

  if (existingSize === asset.bytes) {
    return { status: 'skipped', public_id: asset.public_id, target_s3_key: asset.target_s3_key, bytes: existingSize };
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.rm(partial, { force: true });

  const response = await fetch(signDownloadUrl({ asset, credentials }));
  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(`Cloudinary download failed with HTTP ${response.status}: ${text.slice(0, 200)}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== asset.bytes) {
    throw new Error(`Byte mismatch: expected ${asset.bytes}, got ${bytes.length}`);
  }

  await fs.writeFile(partial, bytes);
  await fs.rename(partial, destination);

  return { status: 'downloaded', public_id: asset.public_id, target_s3_key: asset.target_s3_key, bytes: bytes.length };
}

async function runQueue(assets, credentials) {
  const report = {
    started_at: new Date().toISOString(),
    input: path.relative(root, inputPath),
    output_directory: path.relative(root, outputRoot),
    expected_assets: assets.length,
    expected_bytes: assets.reduce((sum, asset) => sum + Number(asset.bytes || 0), 0),
    downloaded: 0,
    skipped: 0,
    failed: 0,
    downloaded_bytes: 0,
    skipped_bytes: 0,
    failures: [],
  };

  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < assets.length) {
      const index = nextIndex++;
      const asset = assets[index];
      try {
        const result = await downloadAsset(asset, credentials);
        if (result.status === 'downloaded') {
          report.downloaded += 1;
          report.downloaded_bytes += result.bytes;
        } else {
          report.skipped += 1;
          report.skipped_bytes += result.bytes;
        }
      } catch (error) {
        report.failed += 1;
        report.failures.push({
          public_id: asset.public_id,
          target_s3_key: asset.target_s3_key,
          message: error.message,
        });
      }

      completed += 1;
      if (completed % 50 === 0 || completed === assets.length) {
        console.log(`Processed ${completed}/${assets.length}; downloaded=${report.downloaded}; skipped=${report.skipped}; failed=${report.failed}`);
        await fs.writeFile(reportPath, `${JSON.stringify({ ...report, completed, updated_at: new Date().toISOString() }, null, 2)}\n`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  report.finished_at = new Date().toISOString();
  report.actual_assets = report.downloaded + report.skipped;
  report.actual_bytes = report.downloaded_bytes + report.skipped_bytes;
  report.success = report.failed === 0 && report.actual_assets === report.expected_assets && report.actual_bytes === report.expected_bytes;

  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

const credentials = parseCloudinaryUrl(await readCloudinaryUrl());
const assets = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const report = await runQueue(assets, credentials);

console.log(JSON.stringify({
  success: report.success,
  expected_assets: report.expected_assets,
  actual_assets: report.actual_assets,
  expected_bytes: report.expected_bytes,
  actual_bytes: report.actual_bytes,
  failed: report.failed,
  report: path.relative(root, reportPath),
}, null, 2));

if (!report.success) {
  process.exitCode = 1;
}
