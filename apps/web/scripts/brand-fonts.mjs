/**
 * Licensed brand fonts (Thmanyah Sans) are kept in Git only as AES-256-GCM ciphertext, because this
 * repository is public and the font license forbids publishing the files.
 *
 *   node scripts/brand-fonts.mjs encrypt   # public/fonts/thmanyah/*.woff2 → assets-encrypted/thmanyah/*.enc
 *   node scripts/brand-fonts.mjs decrypt   # the reverse; runs automatically before `next build`
 *
 * Both need FONT_ASSETS_KEY (32 random bytes, base64). Without it, decrypt skips and the site falls
 * back to its default fonts.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PLAIN_DIR = 'public/fonts/thmanyah';
const CIPHER_DIR = 'assets-encrypted/thmanyah';
const mode = process.argv[2];

function loadKey() {
  const raw = process.env.FONT_ASSETS_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('FONT_ASSETS_KEY must be 32 bytes, base64-encoded');
  return key;
}

async function encrypt(key) {
  await mkdir(CIPHER_DIR, { recursive: true });
  for (const name of (await readdir(PLAIN_DIR)).filter((file) => file.endsWith('.woff2'))) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const body = Buffer.concat([cipher.update(await readFile(join(PLAIN_DIR, name))), cipher.final()]);
    await writeFile(join(CIPHER_DIR, `${name}.enc`), Buffer.concat([iv, cipher.getAuthTag(), body]));
    console.log(`encrypted ${name}`);
  }
}

async function decrypt(key) {
  await mkdir(PLAIN_DIR, { recursive: true });
  const files = (await readdir(CIPHER_DIR)).filter((file) => file.endsWith('.woff2.enc'));
  for (const name of files) {
    const data = await readFile(join(CIPHER_DIR, name));
    const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    const plain = Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]);
    await writeFile(join(PLAIN_DIR, name.replace(/\.enc$/, '')), plain);
  }
  console.log(`brand fonts: decrypted ${files.length} file(s)`);
}

const key = loadKey();
if (mode === 'encrypt') {
  if (!key) throw new Error('FONT_ASSETS_KEY is required to encrypt');
  await encrypt(key);
} else if (mode === 'decrypt') {
  if (!key) console.warn('brand fonts: FONT_ASSETS_KEY not set, keeping default fonts');
  else await decrypt(key);
} else {
  throw new Error('usage: node scripts/brand-fonts.mjs <encrypt|decrypt>');
}
