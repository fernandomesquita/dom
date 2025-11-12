/**
 * Storage module with support for both Manus Proxy and Cloudflare R2
 * 
 * Automatically detects which storage backend to use based on environment variables:
 * - If R2_* variables are set → Use Cloudflare R2
 * - Otherwise → Use Manus Storage Proxy (for development)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from './_core/env';

// ==================== TYPES ====================

type StorageBackend = 'r2' | 'manus';

type StorageConfig = {
  backend: StorageBackend;
  // R2 config
  r2?: {
    client: S3Client;
    bucket: string;
    publicUrl?: string;
  };
  // Manus config
  manus?: {
    baseUrl: string;
    apiKey: string;
  };
};

// ==================== CONFIGURATION ====================

let _config: StorageConfig | null = null;

function getStorageConfig(): StorageConfig {
  if (_config) return _config;

  // Check if R2 is configured
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2Bucket = process.env.R2_BUCKET_NAME;

  if (r2AccessKey && r2SecretKey && r2AccountId && r2Bucket) {
    // Use Cloudflare R2
    const endpoint = process.env.R2_ENDPOINT || `https://${r2AccountId}.r2.cloudflarestorage.com`;
    
    const s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    _config = {
      backend: 'r2',
      r2: {
        client: s3Client,
        bucket: r2Bucket,
        publicUrl: process.env.R2_PUBLIC_URL,
      },
    };

    console.log('[Storage] Using Cloudflare R2:', { bucket: r2Bucket, endpoint });
    return _config;
  }

  // Fallback to Manus Storage Proxy
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'Storage not configured! Set either R2_* variables or BUILT_IN_FORGE_API_* variables'
    );
  }

  _config = {
    backend: 'manus',
    manus: {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      apiKey,
    },
  };

  console.log('[Storage] Using Manus Storage Proxy');
  return _config;
}

// ==================== HELPER FUNCTIONS ====================

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

// ==================== R2 IMPLEMENTATION ====================

async function r2Put(
  client: S3Client,
  bucket: string,
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const body = typeof data === 'string' ? Buffer.from(data) : data;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);

  // Generate public URL
  const config = getStorageConfig();
  const publicUrl = config.r2?.publicUrl || `https://${bucket}.r2.dev`;
  const url = `${publicUrl}/${key}`;

  return { key, url };
}

async function r2Get(
  client: S3Client,
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  // Generate presigned URL
  const url = await getSignedUrl(client, command, { expiresIn });

  return { key, url };
}

// ==================== MANUS IMPLEMENTATION ====================

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL('v1/storage/upload', ensureTrailingSlash(baseUrl));
  url.searchParams.set('path', normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    'v1/storage/downloadUrl',
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set('path', normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return (await response.json()).url;
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === 'string'
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append('file', blob, fileName || 'file');
  return form;
}

async function manusPut(
  baseUrl: string,
  apiKey: string,
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split('/').pop() ?? key);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }

  const url = (await response.json()).url;
  return { key, url };
}

async function manusGet(
  baseUrl: string,
  apiKey: string,
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

// ==================== PUBLIC API ====================

/**
 * Upload a file to storage
 * 
 * @param relKey - Relative path/key for the file (e.g., "users/123/avatar.png")
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type (default: "application/octet-stream")
 * @returns Object with key and public URL
 * 
 * @example
 * const { url } = await storagePut("avatars/user-123.png", buffer, "image/png");
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const key = normalizeKey(relKey);

  if (config.backend === 'r2' && config.r2) {
    return r2Put(config.r2.client, config.r2.bucket, key, data, contentType);
  }

  if (config.backend === 'manus' && config.manus) {
    return manusPut(config.manus.baseUrl, config.manus.apiKey, key, data, contentType);
  }

  throw new Error('Storage backend not configured');
}

/**
 * Get a download URL for a file
 * 
 * @param relKey - Relative path/key for the file
 * @param expiresIn - URL expiration time in seconds (R2 only, default: 3600)
 * @returns Object with key and download URL
 * 
 * @example
 * const { url } = await storageGet("documents/report.pdf");
 */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const key = normalizeKey(relKey);

  if (config.backend === 'r2' && config.r2) {
    return r2Get(config.r2.client, config.r2.bucket, key, expiresIn);
  }

  if (config.backend === 'manus' && config.manus) {
    return manusGet(config.manus.baseUrl, config.manus.apiKey, key);
  }

  throw new Error('Storage backend not configured');
}

/**
 * Get current storage backend
 * 
 * @returns 'r2' or 'manus'
 */
export function getStorageBackend(): StorageBackend {
  return getStorageConfig().backend;
}
