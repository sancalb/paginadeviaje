import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Build-time acquisition only. Pins record the sources reviewed for this gallery.
const root = new URL('../', import.meta.url);
const api = 'https://commons.wikimedia.org/w/api.php';
const headers = { 'User-Agent': 'DiscoverMexicoGallery/1.0 (build-time Commons photo attribution verification)' };
const regionalSource = 'https://sedeturqroo.gob.mx/gastronomia/webroot/pdfs/2021-04-22%2019%3A32%3A00_doc.pdf';
const selections = [
  {
    destination: 'mexico-city', name: 'Mexico City', file: 'mexico-city-chapultepec.webp',
    title: 'File:Mexico City, Chapultepec Castle (20677400112).jpg',
    author: 'Arian Zwegers', authorUrl: 'https://www.flickr.com/people/67769030@N07',
    license: 'CC BY 2.0', sha1: 'd04025b46d11fd06cbae85fc54afedacbb6eef7c',
    place: 'Chapultepec Castle, Mexico City, Mexico', marker: 'Chapultepec',
    evidence: 'Commons description identifies Chapultepec Castle in Mexico City; the southwest-facade category and camera coordinates agree.',
    alt: { en: 'Chapultepec Castle facade and formal gardens in Mexico City', es: 'Fachada y jardines del Castillo de Chapultepec en Ciudad de M\u00e9xico' },
    caption: { en: 'Chapultepec Castle, Mexico City', es: 'Castillo de Chapultepec, Ciudad de M\u00e9xico' },
  },
  {
    destination: 'mexico-city', name: 'Mexico City', file: 'mexico-city-zocalo.webp',
    title: 'File:Mexico City. Zocalo.jpg',
    author: 'Alex Polezhaev', authorUrl: 'https://www.flickr.com/people/56876426@N00',
    license: 'CC BY 2.0', sha1: '8ba1cf718ed6b0e19bc5166ca08c603b196e47b3',
    place: 'Zocalo, Mexico City, Mexico', marker: 'Ciudad de M\u00e9xico',
    evidence: 'Commons file title identifies the Zocalo; its description identifies Ciudad de Mexico, with a reviewed Flickr source titled Mexico City. Zocalo.',
    alt: { en: 'View of the Zocalo in Mexico City', es: 'Vista del Z\u00f3calo de Ciudad de M\u00e9xico' },
    caption: { en: 'The Zocalo, Mexico City', es: 'El Z\u00f3calo, Ciudad de M\u00e9xico' },
  },
  {
    destination: 'guadalajara', name: 'Guadalajara', file: 'guadalajara-teatro-degollado.webp',
    title: 'File:Teatro Degollado, Guadalajara.JPG',
    author: 'Paredes Umberto', authorUrl: 'https://commons.wikimedia.org/wiki/User:Paredes_Umberto',
    license: 'CC BY-SA 3.0', sha1: '2bee161ca45a428a0c5e55a1a8e68554963d21fa',
    place: 'Teatro Degollado, Guadalajara, Jalisco, Mexico', marker: 'Teatro Degollado',
    evidence: 'Commons page description names Teatro Degollado; title, category and camera coordinates identify the theater in central Guadalajara.',
    alt: { en: 'Ornate balconies inside Teatro Degollado in Guadalajara', es: 'Palcos ornamentados en el interior del Teatro Degollado en Guadalajara' },
    caption: { en: 'Inside Teatro Degollado, Guadalajara', es: 'Interior del Teatro Degollado, Guadalajara' },
  },
  {
    destination: 'guadalajara', name: 'Guadalajara', file: 'guadalajara-hospicio-cabanas.webp',
    title: 'File:Hospicio Caba\u00f1as, Guadalajara, Jalisco - 12.jpg',
    author: 'ProtoplasmaKid', authorUrl: 'https://commons.wikimedia.org/wiki/User:ProtoplasmaKid',
    license: 'CC BY-SA 4.0', sha1: '0f22f1cd0bda312aa241b22552d3c916192e0904',
    place: 'Hospicio Cabanas, Guadalajara, Jalisco, Mexico', marker: 'Hospicio Caba\u00f1as',
    evidence: 'Commons description explicitly identifies a drone aerial view of Hospicio Cabanas in Guadalajara, Jalisco; camera coordinates agree.',
    alt: { en: 'Aerial view of Hospicio Cabanas and its courtyards in Guadalajara', es: 'Vista a\u00e9rea del Hospicio Caba\u00f1as y sus patios en Guadalajara' },
    caption: { en: 'Hospicio Cabanas, Guadalajara', es: 'Hospicio Caba\u00f1as, Guadalajara' },
  },
  {
    destination: 'tequila', name: 'Tequila', file: 'tequila-church-plaza.webp',
    title: 'File:Tequila Church and Main Pavilion.jpg',
    author: 'Andres Gil Ron', authorUrl: 'https://commons.wikimedia.org/wiki/User:AndgrX',
    license: 'CC BY-SA 4.0', sha1: 'fb3fe2c05f0ca082ea1708271177855563e13b57',
    place: 'Santiago Apostol church and main pavilion, Tequila, Jalisco, Mexico', marker: 'Saint James the Apostle Church, Tequila',
    evidence: 'Commons title, Saint James the Apostle Church category and camera coordinates identify the church and pavilion in Tequila, Jalisco.',
    alt: { en: 'Church and main pavilion in the center of Tequila, Jalisco', es: 'Parroquia y quiosco principal en el centro de Tequila, Jalisco' },
    caption: { en: 'The main square of Tequila, Jalisco', es: 'Plaza principal de Tequila, Jalisco' },
  },
  {
    destination: 'tequila', name: 'Tequila', file: 'tequila-agave-landscape.webp',
    title: 'File:Paisaje agaves cerca de Tequila, Jal. 28042024.jpg',
    author: 'Juan Carlos Fonseca Mata', authorUrl: 'https://commons.wikimedia.org/wiki/User:Juan_Carlos_Fonseca_Mata',
    license: 'CC BY-SA 4.0', sha1: '6340eab0b89e3b236071151f6d0701ec5f1a6f75',
    place: 'Agave landscape near Tequila, Jalisco, Mexico', marker: 'Landscape near Tequila',
    evidence: 'Commons description explicitly identifies the landscape near Tequila, Jalisco; title identifies agaves and camera coordinates locate the fields beside Tequila.',
    alt: { en: 'Agave fields in the landscape near Tequila, Jalisco', es: 'Campos de agave en el paisaje cercano a Tequila, Jalisco' },
    caption: { en: 'Agave landscape near Tequila', es: 'Paisaje agavero cerca de Tequila' },
  },
  {
    destination: 'puerto-vallarta', name: 'Puerto Vallarta', file: 'puerto-vallarta-malecon.webp',
    title: 'File:Malecon, Puerto Vallarta (27212709499).jpg',
    author: 'Andrew Milligan sumo', authorUrl: 'https://www.flickr.com/people/24470821@N04',
    license: 'CC BY 2.0', sha1: '0d642ca5cb6f6c824fba970d0251dc38dc9f7c96',
    place: 'Malecon, Puerto Vallarta, Jalisco, Mexico', marker: 'Malecon, Puerto Vallarta',
    evidence: 'Commons description and reviewed Flickr source explicitly name the Malecon in Puerto Vallarta; its category agrees.',
    alt: { en: 'The Malecon waterfront in Puerto Vallarta', es: 'El paseo del Malec\u00f3n en Puerto Vallarta' },
    caption: { en: 'The Malecon, Puerto Vallarta', es: 'El Malec\u00f3n, Puerto Vallarta' },
  },
  {
    destination: 'puerto-vallarta', name: 'Puerto Vallarta', file: 'puerto-vallarta-los-muertos-pier.webp',
    title: 'File:Puerto Vallarta, Jalisco (2021) - 13.jpg',
    author: 'Another Believer', authorUrl: 'https://commons.wikimedia.org/wiki/User:Another_Believer',
    license: 'CC BY-SA 4.0', sha1: 'b13f0ef06af9d757f9d6dc865e1136eac321de6c',
    place: 'Los Muertos Pier, Puerto Vallarta, Jalisco, Mexico', marker: 'Los Muertos Pier in 2021',
    evidence: 'Commons description identifies Puerto Vallarta, Jalisco; Los Muertos Pier category and camera coordinates identify the pier.',
    alt: { en: 'Los Muertos Pier beside the coast of Puerto Vallarta', es: 'Muelle de Los Muertos junto a la costa de Puerto Vallarta' },
    caption: { en: 'Los Muertos Pier, Puerto Vallarta', es: 'Muelle de Los Muertos, Puerto Vallarta' },
  },
  {
    destination: 'cancun', name: 'Cancun', file: 'cancun-playa-delfines.webp',
    title: 'File:Playa Delfines - panoramio.jpg',
    author: 'jc_castaneda', authorUrl: 'https://web.archive.org/web/20161014013458/http://www.panoramio.com/user/2605482?with_photo_id=27049145',
    license: 'CC BY-SA 3.0', sha1: 'a3981c9164537344fc15424aab1e33faa75f208a',
    place: 'Playa Delfines, Cancun, Quintana Roo, Mexico', marker: 'Delfines Beach',
    evidence: 'Commons description names Playa Delfines; Delfines Beach category and camera coordinates identify the beach in Cancun. Commons records a trusted Panoramio license review.',
    alt: { en: 'Sand and Caribbean surf at Playa Delfines in Cancun', es: 'Arena y oleaje del Caribe en Playa Delfines, Canc\u00fan' },
    caption: { en: 'Playa Delfines, Cancun', es: 'Playa Delfines, Canc\u00fan' },
  },
  {
    destination: 'cancun', name: 'Cancun', file: 'cancun-el-rey.webp',
    title: 'File:El Rey archaeological site.jpg',
    author: 'In Vitrio', authorUrl: 'https://commons.wikimedia.org/wiki/User:In_Vitrio',
    license: 'CC BY-SA 4.0', sha1: '081b84a973463a82e51469ef7f87dfa15c053ba7',
    place: 'El Rey archaeological site, Cancun, Quintana Roo, Mexico', marker: 'El Rey, Cancun',
    evidence: 'Commons description explicitly identifies El Rey, Cancun, Quintana Roo, Mexico; El Rey, Cancun category agrees.',
    alt: { en: 'Maya ruins at the El Rey archaeological site in Cancun', es: 'Ruinas mayas en la zona arqueol\u00f3gica El Rey de Canc\u00fan' },
    caption: { en: 'El Rey archaeological site, Cancun', es: 'Zona arqueol\u00f3gica El Rey, Canc\u00fan' },
  },
  {
    destination: 'riviera-maya', name: 'Riviera Maya', file: 'riviera-maya-tulum-beach.webp',
    title: 'File:Beach at Tulum Mexico.jpg',
    author: 'Lridgard', authorUrl: 'https://commons.wikimedia.org/wiki/User:Lridgard',
    license: 'CC BY-SA 3.0', sha1: '862ec32d667d9997608acf5599046a0c3cd8a679',
    place: 'Beach at the Tulum archaeological site, Riviera Maya, Quintana Roo, Mexico', marker: 'Beaches of Tulum',
    evidence: 'Commons page description identifies the beach at Tulum by the archaeological site; category and coordinates agree. Quintana Roo tourism lists Tulum within Riviera Maya.',
    locationSourceUrl: regionalSource,
    alt: { en: 'Beach below the archaeological site at Tulum, Riviera Maya', es: 'Playa al pie de la zona arqueol\u00f3gica de Tulum, Riviera Maya' },
    caption: { en: 'Tulum beach, Riviera Maya', es: 'Playa de Tulum, Riviera Maya' },
  },
  {
    destination: 'riviera-maya', name: 'Riviera Maya', file: 'riviera-maya-akumal.webp',
    title: 'File:Akumal Beach - Mexico (4303204764).jpg',
    author: 'Serge Melki', authorUrl: 'https://www.flickr.com/people/67958110@N00',
    license: 'CC BY 2.0', sha1: 'd75b34d8737c99ffe4ed370ce246dc47ef01df8c',
    place: 'Akumal Beach, Riviera Maya, Quintana Roo, Mexico', marker: 'Akumal, Quintana Roo',
    evidence: 'Commons title, reviewed Flickr source, Akumal category and camera coordinates identify Akumal Beach. Quintana Roo tourism explicitly includes Akumal in Riviera Maya.',
    locationSourceUrl: regionalSource,
    alt: { en: 'Rocky shoreline and shallow water at Akumal, Riviera Maya', es: 'Costa rocosa y aguas poco profundas de Akumal, Riviera Maya' },
    caption: { en: 'The coast at Akumal, Riviera Maya', es: 'La costa de Akumal, Riviera Maya' },
  },
  {
    destination: 'oaxaca', name: 'Oaxaca', file: 'oaxaca-cathedral.webp',
    title: 'File:Oaxaca-Catedral.jpg',
    author: 'Jortegacillero', authorUrl: 'https://commons.wikimedia.org/wiki/User:Jortegacillero',
    license: 'CC BY-SA 4.0', sha1: '4862856ccbc31bda6468c421e60333c2727e4acc',
    place: 'Metropolitan Cathedral, Oaxaca de Juarez, Oaxaca, Mexico', marker: 'Cultural heritage monuments in Oaxaca de Ju\u00e1rez',
    evidence: 'Commons page description explicitly identifies the facade of Oaxaca Metropolitan Cathedral; the title and Oaxaca de Juarez category agree.',
    alt: { en: 'Stone facade of the Metropolitan Cathedral in Oaxaca', es: 'Fachada de cantera de la Catedral Metropolitana de Oaxaca' },
    caption: { en: 'Oaxaca Metropolitan Cathedral', es: 'Catedral Metropolitana de Oaxaca' },
  },
  {
    destination: 'oaxaca', name: 'Oaxaca', file: 'oaxaca-monte-alban.webp',
    title: 'File:Monte Alban, Plaza, Oaxaca.jpg',
    author: '\u00d6skr Rck', authorUrl: 'https://commons.wikimedia.org/wiki/User:%C3%96skr_Rck',
    license: 'CC BY-SA 3.0', sha1: '6aae167337c7f412b973de5174fdd5793d80f87a',
    place: 'Main plaza of Monte Alban archaeological site, Oaxaca, Mexico', marker: 'Monte Alb\u00e1n - Plaza Principal',
    evidence: 'Commons title explicitly identifies Monte Alban, Plaza, Oaxaca; the Monte Alban - Plaza Principal category identifies the main plaza.',
    alt: { en: 'Main plaza and stone platforms at Monte Alban, Oaxaca', es: 'Plaza principal y plataformas de piedra en Monte Alb\u00e1n, Oaxaca' },
    caption: { en: 'Monte Alban, Oaxaca', es: 'Monte Alb\u00e1n, Oaxaca' },
  },
  {
    destination: 'los-cabos', name: 'Los Cabos', file: 'los-cabos-san-jose-mission.webp',
    title: 'File:SanJosedelCaboChurch.JPG',
    author: 'Thelmadatter', authorUrl: 'https://commons.wikimedia.org/wiki/User:Thelmadatter',
    license: 'CC BY-SA 4.0', sha1: 'c80670d99c439c0ae98a50a3a7ee3a86b20b11a7',
    place: 'Mission church, San Jose del Cabo, Los Cabos, Baja California Sur, Mexico', marker: 'Mission church in the center of San Jose del Cabo',
    evidence: 'Commons description explicitly identifies the mission church in central San Jose del Cabo. The official Los Cabos tourism board identifies San Jose del Cabo as part of Los Cabos.',
    locationSourceUrl: 'https://www.visitloscabos.travel/places-to-visit/san-jose-del-cabo/',
    alt: { en: 'Mission church in the center of San Jose del Cabo', es: 'Iglesia de la misi\u00f3n en el centro de San Jos\u00e9 del Cabo' },
    caption: { en: 'San Jose del Cabo mission, Los Cabos', es: 'Misi\u00f3n de San Jos\u00e9 del Cabo, Los Cabos' },
  },
  {
    destination: 'los-cabos', name: 'Los Cabos', file: 'los-cabos-lovers-beach.webp',
    title: 'File:Lovers Beach Los Cabos 2008 (8997396795).jpg',
    author: 'Kirt Edblom', authorUrl: 'https://www.flickr.com/people/27190564@N02',
    license: 'CC BY-SA 2.0', sha1: '90c6ba2b2c65a6c8256eef89b013e416fe238715',
    place: 'Playa del Amor, Cabo San Lucas, Los Cabos, Baja California Sur, Mexico', marker: 'Cabo San Lucas, Los Cabos',
    evidence: 'Commons description explicitly locates Lovers Beach (Playa del Amor) on the Sea of Cortez side of Lands End at Cabo San Lucas, Los Cabos; camera coordinates agree.',
    alt: { en: 'Waves breaking over boulders at Lovers Beach in Cabo San Lucas', es: 'Olas entre las rocas de Playa del Amor, Cabo San Lucas' },
    caption: { en: 'Rocky shore at Lovers Beach, Los Cabos', es: 'Costa rocosa de Playa del Amor, Los Cabos' },
  },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = (algorithm, data) => createHash(algorithm).update(data).digest('hex');
const creditsUrl = new URL('data/image-credits.json', root);
const galleryUrl = new URL('data/gallery.json', root);

async function request(url) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(120_000) });
      if (response.ok) return response;
      const retryAfter = response.headers.get('retry-after');
      await response.body?.cancel();
      const error = new Error(`HTTP ${response.status}: ${url}`);
      if (Number(retryAfter) > 120) {
        error.noRetry = true;
        error.message += ` (retry after ${retryAfter} seconds; left for a later run)`;
        throw error;
      }
      if (response.status !== 429 && response.status < 500) throw error;
      lastError = error;
      if (attempt < 3) {
        const seconds = Number(retryAfter);
        const delay = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 10_000 * (attempt + 1);
        console.warn(`Source busy; retrying in ${Math.ceil(delay / 1000)} seconds`);
        await sleep(delay);
      }
    } catch (error) {
      lastError = error;
      if (error.noRetry || /^HTTP (?!429|5\d\d)/.test(error.message)) throw error;
      if (attempt < 3) await sleep(3000 * (attempt + 1));
    }
  }
  throw lastError;
}

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

async function appendRecords(entry, credit) {
  // Reload before writing so unrelated additions to the shared credits are preserved.
  const credits = await readJson(creditsUrl);
  const previous = credits.images.find(image => image.path === credit.path);
  if (previous) assert.equal(previous.sha256, credit.sha256, 'Existing credit differs; manual review required');
  else credits.images.push(credit);
  const gallery = await readJson(galleryUrl);
  assert.ok(Array.isArray(gallery), 'Gallery must remain a plain array');
  if (!gallery.some(image => image.src === entry.src)) gallery.push(entry);
  await writeFile(creditsUrl, `${JSON.stringify(credits, null, 2)}\n`);
  await writeFile(galleryUrl, `${JSON.stringify(gallery, null, 2)}\n`);
}

const params = new URLSearchParams({
  action: 'query', format: 'json', formatversion: '2', maxlag: '5',
  titles: selections.map(image => image.title).join('|'),
  prop: 'imageinfo|revisions', iiprop: 'url|extmetadata|size|sha1|timestamp',
  rvprop: 'ids|timestamp|content', rvslots: 'main', iiurlwidth: '1920',
});
const metadataSourceUrl = `${api}?${params}`;
const retrievedAt = new Date().toISOString();
let pages;
try {
  const result = await (await request(metadataSourceUrl)).json();
  assert.ok(!result.error, JSON.stringify(result.error));
  pages = new Map(result.query.pages.map(page => [page.title, page]));
} catch (error) {
  console.error(`Metadata unavailable; no photos will be added: ${error.message}`);
  process.exitCode = 1;
}

const failures = [];
let successes = 0;
if (pages) {
  await mkdir(new URL('public/media/gallery/', root), { recursive: true });
  await mkdir(new URL('storage/media-originals/gallery/', root), { recursive: true });
  const startingCredits = await readJson(creditsUrl);
  for (const selection of selections) {
    try {
      assert.match(selection.file, /^[a-z0-9-]+\.webp$/);
      const page = pages.get(selection.title);
      const info = page?.imageinfo?.[0];
      assert.ok(info, `Missing Commons photo: ${selection.title}`);
      const value = key => info.extmetadata[key]?.value ?? null;
      assert.equal(info.sha1, selection.sha1, 'Source changed; reverify the photo');
      assert.equal(value('LicenseShortName'), selection.license, 'License changed; reverify');
      assert.ok(value('Artist')?.includes(selection.author), 'Author changed; reverify');
      assert.ok(!value('Restrictions'), 'Source has restrictions requiring review');
      assert.match(value('LicenseUrl') ?? '', /^https:\/\/creativecommons\.org\/licenses\/(by|by-sa)\/(2\.0|3\.0|4\.0)\/?$/);
      const bySa = selection.license.includes('BY-SA');
      const version = selection.license.split(' ').at(-1);
      assert.equal(value('LicenseUrl').replace(/\/$/, ''), `https://creativecommons.org/licenses/${bySa ? 'by-sa' : 'by'}/${version}`);
      const pageText = page.revisions?.[0]?.slots?.main?.content ?? '';
      assert.ok(`${value('ImageDescription')}|${value('Categories')}|${pageText}`.includes(selection.marker), 'Location evidence changed; reverify');
      assert.ok(!/AI-generated|AI generated|Synthetic media|Generative AI|License review needed|Copyright violations|Deletion requests/i.test(value('Categories') ?? ''), 'Source requires manual review');
      assert.ok(!startingCredits.images.some(image => !image.path.startsWith('public/media/gallery/') && image.originalSha1 === info.sha1), 'Photo already used outside gallery');
      const originalUrl = new URL(info.url);
      originalUrl.search = '';
      assert.equal(originalUrl.hostname, 'upload.wikimedia.org');
      const path = `public/media/gallery/${selection.file}`;
      const outputUrl = new URL(path, root);
      const entry = {
        destination: selection.destination, src: `/media/gallery/${selection.file}`,
        alt: selection.alt, caption: selection.caption,
        author: selection.author, sourceUrl: info.descriptionurl,
        license: selection.license, licenseUrl: value('LicenseUrl'),
      };
      const prior = startingCredits.images.find(image => image.path === path);
      if (prior) {
        assert.equal(prior.originalSha1, info.sha1);
        assert.equal(prior.license, selection.license);
        const data = await readFile(outputUrl);
        const decoded = await sharp(data).metadata();
        assert.equal(hash('sha256', data), prior.sha256);
        assert.equal(decoded.format, 'webp');
        assert.ok(decoded.width <= 1600 && decoded.height <= 1600);
        await appendRecords(entry, prior);
        successes++;
        console.log(`${selection.file}: existing verified WebP retained`);
        continue;
      }
      const originalName = `${selection.file.slice(0, -5)}-${info.sha1}${new URL(info.url).pathname.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? '.jpg'}`;
      let originalPath = `storage/media-originals/gallery/${originalName}`;
      const originalFile = new URL(originalPath, root);
      let downloaded;
      let downloadUrl = originalUrl;
      let downloadVariant = 'original';
      try {
        downloaded = await readFile(originalFile);
        assert.equal(hash('sha1', downloaded), selection.sha1, 'Cached original hash mismatch');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        // Commons' own downsample avoids fetching oversized camera originals.
        downloadUrl = new URL(info.thumburl);
        assert.ok(['thumb.wikimedia.org', 'upload.wikimedia.org'].includes(downloadUrl.hostname));
        downloadVariant = 'commons-thumbnail';
        originalPath = `storage/media-originals/gallery/${selection.file.slice(0, -5)}-${info.sha1}-commons-1920.jpg`;
        const downloadFile = new URL(originalPath, root);
        let cached;
        try { cached = await readFile(downloadFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        if (cached) downloaded = cached;
        else {
          await sleep(4000);
          const response = await request(downloadUrl);
          assert.match(response.headers.get('content-type') ?? '', /^image\/jpeg\b/);
          downloaded = Buffer.from(await response.arrayBuffer());
          const sourceSize = await sharp(downloaded).metadata();
          assert.equal(sourceSize.width, info.thumbwidth);
          assert.equal(sourceSize.height, info.thumbheight);
          await writeFile(downloadFile, downloaded, { flag: 'wx' });
        }
      }
      const { data, info: output } = await sharp(downloaded)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toBuffer({ resolveWithObject: true });
      assert.equal((await sharp(data).metadata()).format, 'webp');
      assert.ok(output.width > 0 && output.height > 0 && output.width <= 1600 && output.height <= 1600);
      await writeFile(outputUrl, data, { flag: 'wx' });
      const credit = {
        file: selection.file, path, destination: selection.name,
        title: selection.title.slice(5), author: selection.author, authorUrl: selection.authorUrl,
        source: 'Wikimedia Commons', sourceUrl: info.descriptionurl,
        originalUrl: originalUrl.href, downloadUrl: downloadUrl.href, downloadVariant,
        downloadedSha256: hash('sha256', downloaded),
        license: selection.license, licenseUrl: value('LicenseUrl'),
        licenseNote: 'Retain attribution and license link. CC BY-SA images retain the same share-alike license.',
        attribution: `${selection.title.slice(5)} - ${selection.author} / Wikimedia Commons / ${selection.license}`,
        modifications: 'Auto-orientation, proportional resize to fit within 1600 x 1600 pixels, WebP encoding (quality 82). No crop or creative modification.',
        width: output.width, height: output.height, bytes: output.size,
        sha256: hash('sha256', data), originalSha1: info.sha1,
        originalWidth: info.width, originalHeight: info.height, originalTimestamp: info.timestamp,
        verification: {
          status: 'verified', place: selection.place, evidence: selection.evidence,
          sourceUrl: info.descriptionurl,
          ...(selection.locationSourceUrl ? { locationSourceUrl: selection.locationSourceUrl } : {}),
          coordinates: value('GPSLatitude') && value('GPSLongitude')
            ? { latitude: Number(value('GPSLatitude')), longitude: Number(value('GPSLongitude')) } : null,
          sourceDescriptionHtml: value('ImageDescription'), sourceAuthorHtml: value('Artist'),
          sourceCreditHtml: value('Credit'), sourceCategories: value('Categories')?.split('|') ?? [],
          sourcePageRevisionUrl: `https://commons.wikimedia.org/w/index.php?oldid=${page.revisions[0].revid}`,
          retrievedAt, metadataSourceUrl, originalPath,
          processing: { library: 'sharp', version: sharp.versions.sharp, format: 'webp', maxWidth: 1600, maxHeight: 1600, quality: 82, crop: false },
        },
      };
      await appendRecords(entry, credit);
      successes++;
      console.log(`${selection.file}: ${output.width}x${output.height}, ${output.size} bytes, ${selection.license}`);
    } catch (error) {
      const failure = { destination: selection.name, file: selection.file, reason: error.message };
      failures.push(failure);
      console.error(`${selection.file}: NOT ADDED: ${error.message}`);
    }
  }
}

if (failures.length) {
  const credits = await readJson(creditsUrl);
  for (const failure of failures) {
    if (!credits.failures.some(previous => previous.file === failure.file && previous.reason === failure.reason)) credits.failures.push(failure);
  }
  await writeFile(creditsUrl, `${JSON.stringify(credits, null, 2)}\n`);
  process.exitCode = 1;
}
console.log(`Gallery: ${successes}/${selections.length} verified; ${failures.length} photo failures. Existing destination credits retained.`);
