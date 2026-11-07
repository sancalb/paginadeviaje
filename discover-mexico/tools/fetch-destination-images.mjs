import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const api = 'https://commons.wikimedia.org/w/api.php';
const headers = { 'User-Agent': 'DiscoverMexicoPhotoAssets/1.0 (Wikimedia Commons attribution; no authentication)' };
const selections = [
  {
    slug: 'mexico-city', destination: 'Mexico City',
    title: 'File:Palacio de Bellas Artes M\u00e9xico City.jpg',
    author: 'Esparta Palma', authorUrl: 'https://www.flickr.com/photos/esparta/',
    license: 'CC BY 2.0', sha1: '0cce405479949375b944bb9af4a90cda8211f00f',
    place: 'Palacio de Bellas Artes, Mexico City, Mexico',
    evidence: 'Commons file title identifies Mexico City; description identifies Palacio de Bellas Artes; category identifies the view from Edificio La Nacional.',
  },
  {
    slug: 'guadalajara', destination: 'Guadalajara',
    title: 'File:Catedral de Guadalajara, Jalisco.jpg',
    author: 'Sergio Estrada Flores', authorUrl: 'https://commons.wikimedia.org/wiki/User:Sestradaf',
    license: 'CC BY 4.0', sha1: '62ea7816b908242c5b75cd9dabade29ec6c1817d',
    place: 'Guadalajara Cathedral, Guadalajara, Jalisco, Mexico',
    evidence: 'Commons description explicitly identifies Guadalajara Cathedral, Jalisco; camera coordinates locate the cathedral.',
  },
  {
    slug: 'tequila', destination: 'Tequila',
    title: 'File:Agaves - Tequila, Jalisco I.jpg',
    author: 'Juan Carlos Fonseca Mata', authorUrl: 'https://commons.wikimedia.org/wiki/User:Juan_Carlos_Fonseca_Mata',
    license: 'CC BY-SA 4.0', sha1: '05dd0ed56c73c6582032d693a5bff24b9483fcda',
    place: 'Agave fields in Tequila, Jalisco, Mexico',
    evidence: 'Commons description explicitly identifies agave cultivation in Tequila, Jalisco, Mexico, with camera coordinates in Tequila.',
  },
  {
    slug: 'puerto-vallarta', destination: 'Puerto Vallarta',
    title: 'File:Puerto Vallarta panorama 2.jpg',
    author: 'Stan Shebs', authorUrl: 'https://commons.wikimedia.org/wiki/User:Stan_Shebs',
    license: 'CC BY-SA 3.0', sha1: '97eeb7ddf67e111068f10adc5b8903b150b83e42',
    place: 'Puerto Vallarta town center seen from the sea, Jalisco, Mexico',
    evidence: 'Commons description explicitly identifies Puerto Vallarta town center viewed from the sea, Jalisco, Mexico.',
  },
  {
    slug: 'cancun', destination: 'Cancun',
    title: 'File:Playa Delfines, Canc\u00fan - Panorama.jpg',
    author: 'Capmo', authorUrl: 'https://commons.wikimedia.org/wiki/User:Capmo',
    license: 'CC BY-SA 4.0', sha1: '7fdc5736b8bd92d7554fa292861286d993b2c2c8',
    place: 'Playa Delfines, Cancun, Quintana Roo, Mexico',
    evidence: 'Commons description explicitly identifies Delfines Beach in Cancun; categories identify Delfines Beach and panoramics in Cancun.',
  },
  {
    slug: 'riviera-maya', destination: 'Riviera Maya',
    downloadVariant: 'commons-thumbnail',
    title: 'File:Tulum - God of the Winds Temple 03.JPG',
    author: 'Martin Falbisoner', authorUrl: 'https://commons.wikimedia.org/wiki/User:Martin_Falbisoner',
    license: 'CC BY-SA 4.0', sha1: 'cda33260574552ba2423925daf67585fc5846648',
    place: 'Temple of the God of the Wind, Tulum archaeological site, Riviera Maya, Quintana Roo, Mexico',
    evidence: 'Commons title, Templo del Dios Viento category and camera coordinates identify the Tulum archaeological site. The Quintana Roo government explicitly places Tulum in Riviera Maya.',
    locationSourceUrl: 'https://siturq.gob.mx/pueblo-magico/d8ba3a88-a509-11ee-a22f-00224821d409',
  },
  {
    slug: 'oaxaca', destination: 'Oaxaca',
    downloadVariant: 'commons-thumbnail',
    title: 'File:Church-with-agave-oaxaca-MX.jpg',
    author: 'GaylaLin', authorUrl: 'https://commons.wikimedia.org/wiki/User:GaylaLin',
    license: 'Public domain', sha1: 'cce6a94ca2931be11538df6467a8db95ac2db6cd',
    place: 'Santo Domingo de Guzman church, Oaxaca de Juarez, Oaxaca, Mexico',
    evidence: 'Commons description explicitly identifies the church of Santo Domingo de Guzman, Oaxaca; categories identify Oaxaca de Juarez. PD-self records the author public-domain dedication.',
  },
  {
    slug: 'los-cabos', destination: 'Los Cabos',
    downloadVariant: 'commons-thumbnail',
    title: 'File:TheArchCaboSanLucas07.JPG',
    author: 'Thelmadatter', authorUrl: 'https://commons.wikimedia.org/wiki/User:Thelmadatter',
    license: 'CC BY-SA 4.0', sha1: '0ce1e3a2f006c7ba6c28f68dd0012649ef005235',
    place: 'El Arco, Cabo San Lucas, Los Cabos, Baja California Sur, Mexico',
    evidence: 'Commons description and camera coordinates identify the Arch of Cabo San Lucas. The official Los Cabos tourism board identifies this arch as a Los Cabos landmark.',
    locationSourceUrl: 'https://www.visitloscabos.travel/places-to-visit/the-arch-of-cabo-san-lucas/',
  },
];

async function request(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(120_000) });
    if (response.ok) return response;
    if (response.status >= 500 && attempt < 3) {
      await response.body?.cancel();
      await new Promise(resolve => setTimeout(resolve, 3000 * (attempt + 1)));
      continue;
    }
    const retryAfter = response.headers.get('retry-after');
    throw new Error(`HTTP ${response.status}${retryAfter ? ` (retry after ${retryAfter})` : ''}: ${url}`);
  }
}

function hash(algorithm, buffer) {
  return createHash(algorithm).update(buffer).digest('hex');
}

const params = new URLSearchParams({
  action: 'query', format: 'json', formatversion: '2',
  titles: selections.map(image => image.title).join('|'),
  prop: 'imageinfo', iiprop: 'url|extmetadata|size|sha1|timestamp', iiurlwidth: '1920',
});
const metadataUrl = `${api}?${params}`;
const result = await (await request(metadataUrl)).json();
assert.ok(!result.error, JSON.stringify(result.error));
const pages = new Map(result.query.pages.map(page => [page.title, page]));
await mkdir(new URL('public/media/', root), { recursive: true });
await mkdir(new URL('data/', root), { recursive: true });
const images = [];
const failures = [];
let previousImages = [];
try {
  previousImages = JSON.parse(await readFile(new URL('data/image-credits.json', root), 'utf8')).images;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

for (const selection of selections) {
  try {
    const page = pages.get(selection.title);
    const info = page?.imageinfo?.[0];
    assert.ok(info, `Missing Commons image: ${selection.title}`);
    const meta = info.extmetadata;
    const value = key => meta[key]?.value ?? null;
    assert.equal(info.sha1, selection.sha1, 'Source file changed; reverify before downloading');
    assert.equal(value('LicenseShortName'), selection.license, 'License changed; reverify');
    assert.ok(value('Artist')?.includes(selection.author), 'Author changed; reverify');
    assert.ok(!value('Restrictions'), 'Additional restrictions require review');
    if (selection.license === 'Public domain') {
      assert.ok(value('Categories')?.split('|').includes('PD-self'), 'Public-domain dedication not verified');
    } else {
      assert.ok(value('LicenseUrl')?.startsWith('https://creativecommons.org/licenses/'), 'Missing license URL');
    }
    const originalUrl = new URL(info.url);
    originalUrl.search = '';
    assert.equal(originalUrl.hostname, 'upload.wikimedia.org');
    const file = `${selection.slug}.webp`;
    const previous = previousImages.find(image => image.file === file);
    if (previous && previous.originalSha1 === selection.sha1 && previous.license === selection.license) {
      try {
        const existing = await readFile(new URL(`public/media/${file}`, root));
        assert.equal(hash('sha256', existing), previous.sha256);
        assert.equal((await sharp(existing).metadata()).format, 'webp');
        images.push(previous);
        console.log(`${file}: existing verified WebP retained`);
        continue;
      } catch (error) {
        console.log(`${file}: cache not reusable (${error.message})`);
      }
    }
    const downloadUrl = new URL(selection.downloadVariant === 'commons-thumbnail' ? info.thumburl : originalUrl);
    assert.ok(['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(downloadUrl.hostname));
    const downloaded = Buffer.from(await (await request(downloadUrl)).arrayBuffer());
    if (selection.downloadVariant !== 'commons-thumbnail') {
      assert.equal(hash('sha1', downloaded), selection.sha1, 'Downloaded file hash mismatch');
    }
    const { data, info: output } = await sharp(downloaded)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    const decoded = await sharp(data).metadata();
    assert.equal(decoded.format, 'webp');
    assert.ok(output.width > 0 && output.height > 0);
    await writeFile(new URL(`public/media/${file}`, root), data);
    images.push({
      file, path: `public/media/${file}`, destination: selection.destination,
      title: selection.title.slice(5), author: selection.author, authorUrl: selection.authorUrl,
      source: 'Wikimedia Commons', sourceUrl: info.descriptionurl,
      downloadUrl: downloadUrl.href,
      downloadVariant: selection.downloadVariant ?? 'original',
      downloadedSha256: hash('sha256', downloaded),
      originalUrl: originalUrl.href, license: selection.license,
      licenseUrl: value('LicenseUrl') ?? info.descriptionurl,
      licenseNote: selection.license === 'Public domain'
        ? 'Author dedication to the public domain (PD-self), documented on the source page.'
        : 'Retain attribution and license link. CC BY-SA images retain the same share-alike license.',
      attribution: `${selection.title.slice(5)} - ${selection.author} / Wikimedia Commons / ${selection.license}`,
      modifications: 'Auto-orientation, proportional resize to at most 1600 pixels wide, WebP encoding (quality 82). No crop or creative modification.',
      width: output.width, height: output.height, bytes: output.size,
      sha256: hash('sha256', data), originalSha1: info.sha1,
      originalWidth: info.width, originalHeight: info.height,
      originalTimestamp: info.timestamp,
      verification: {
        status: 'verified', place: selection.place, evidence: selection.evidence,
        sourceUrl: info.descriptionurl,
        ...(selection.locationSourceUrl ? { locationSourceUrl: selection.locationSourceUrl } : {}),
        coordinates: value('GPSLatitude') && value('GPSLongitude')
          ? { latitude: Number(value('GPSLatitude')), longitude: Number(value('GPSLongitude')) }
          : null,
        sourceDescriptionHtml: value('ImageDescription'),
        sourceAuthorHtml: value('Artist'), sourceCreditHtml: value('Credit'),
        sourceCategories: value('Categories')?.split('|') ?? [],
      },
    });
    console.log(`${file}: ${output.width}x${output.height}, ${output.size} bytes, ${selection.license}`);
  } catch (error) {
    failures.push({ destination: selection.destination, file: `${selection.slug}.webp`, reason: error.message });
    console.error(`${selection.slug}: NOT CREATED: ${error.message}`);
  }
}

const credits = {
  schemaVersion: 1, retrievedAt: new Date().toISOString(),
  metadataSourceUrl: metadataUrl,
  processing: { library: 'sharp', version: sharp.versions.sharp, format: 'webp', maxWidth: 1600, quality: 82, crop: false },
  images, failures,
};
await writeFile(new URL('data/image-credits.json', root), `${JSON.stringify(credits, null, 2)}\n`);
console.log(`Verified ${images.length}/8 images; credits: ${fileURLToPath(new URL('data/image-credits.json', root))}`);
if (failures.length) process.exitCode = 1;
