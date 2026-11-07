import sharp from 'sharp';
const dir='storage/qa/boutique';
const labels=Buffer.from('<svg width="1815" height="44"><rect width="100%" height="100%" fill="white"/><text x="24" y="29" font-family="Arial" font-size="18" fill="#061b2f">Desktop</text><text x="1464" y="29" font-family="Arial" font-size="18" fill="#061b2f">Móvil</text></svg>');
await sharp({create:{width:1815,height:1044,channels:3,background:'white'}}).composite([{input:labels,top:0,left:0},{input:`${dir}/home-1440-top.png`,top:44,left:0},{input:`${dir}/home-375-top.png`,top:44,left:1440}]).png().toFile(`${dir}/desktop-mobile.png`);
console.log(`${dir}/desktop-mobile.png`);
