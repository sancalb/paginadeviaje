import {copyFileSync,cpSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const original=resolve(root,'..');
// Explicit opt-in synchronization. This tool only writes inside Discover Mexico.
mkdirSync(resolve(root,'app/public/assets/icons'),{recursive:true});
copyFileSync(resolve(original,'styles.css'),resolve(root,'app/brand.css'));
cpSync(resolve(original,'public/assets/icons'),resolve(root,'app/public/assets/icons'),{recursive:true});
for(const name of ['black','white','yellow']) copyFileSync(resolve(original,`public/assets/brand/logo-${name}.png`),resolve(root,`public/media/logo-${name}.png`));
console.log('Copied the original brand stylesheet, icon masks and logos into Discover Mexico. Original untouched.');
