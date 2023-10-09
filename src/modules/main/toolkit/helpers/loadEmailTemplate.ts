import fs from 'fs';
import path from 'path';

export function loadEmailTemplate(p: string) {
    return fs.readFileSync(path.join(__dirname, '../../email-templates', p), 'utf-8');
}