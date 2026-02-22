import { extractPack } from '@foundryvtt/foundryvtt-cli';
import fs from 'fs/promises';
import path from 'path';

const workDir = path.resolve(process.cwd(), '');
const packsCompiled = path.resolve(workDir, 'packs/');
const packs = await fs.readdir(packsCompiled);

const replacer = (key, value) => {
    if (key === 'createdTime') return undefined;
    if (key === 'modifiedTime') return undefined;
    if (key === 'lastModifiedBy') return undefined;
    return value;
};

for (const pack of packs) {
    const files = await fs.readdir(`packsJson/${pack}`, { withFileTypes: true });
    const jsonFiles = files.filter(f => f.isFile() && f.name.toLowerCase().endsWith('.json')).map(f => f.name);
    for (const file of jsonFiles) {
        await fs.rm(path.resolve('packsJson', pack, file));
    }

    await extractPack(path.resolve(packsCompiled, pack), `packsJson/${pack}`, {
        folders: true,
        omitVolatile: true,
        jsonOptions: { replacer: replacer }
    });
}
