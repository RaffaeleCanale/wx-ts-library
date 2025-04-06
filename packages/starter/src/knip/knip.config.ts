import { existsSync, readFileSync } from 'fs';
import type { KnipConfig } from 'knip';

async function loadConfig(): Promise<KnipConfig> {
    if (existsSync('knip.config.ts')) {
        // eslint-disable-next-line no-console
        console.debug('Loading ./knip.config.ts');
        return import(`${process.cwd()}/knip.config.ts`) as Promise<KnipConfig>;
    }

    const viteMain = detectViteMain();

    return {
        entry: [...(viteMain ? [viteMain] : [])],
        ignore: ['*.config.ts', '**/*.gen.ts'],
    } satisfies KnipConfig;
}

function detectViteMain() {
    if (existsSync('index.html')) {
        // Grep for <script type="module" src="{path}"></script>
        const indexHtml = readFileSync('index.html', 'utf-8');
        const match = /<script type="module" src="\/?(.+?)"><\/script/.exec(
            indexHtml,
        );
        if (match) {
            return match[1];
        }
    }
}

const config = await loadConfig();

export default config;
