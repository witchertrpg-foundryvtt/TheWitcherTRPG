import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';

const MODULE_ID = process.cwd();

const packs = await fs.readdir('./packsJson');
for (const pack of packs) {
    if (pack === '.gitattributes') continue;
    console.log('Packing ' + pack);
    await compilePack(`${MODULE_ID}/packsJson/${pack}`, `${MODULE_ID}/packs/${pack}`, { recursive: true });
}
