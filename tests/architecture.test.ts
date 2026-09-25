import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

async function sources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(
    entries.map(async (entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? sources(file) : [file];
    }),
  );
  return lists.flat();
}

test('browser modules preserve server, legacy and brand composition boundaries', async () => {
  for (const file of await sources('src')) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    const owner = file.replaceAll('\\', '/');
    // Source policy for this repository's relative, literal module specifiers;
    // TypeScript/Vite separately validate module resolution and compiled output.
    const imports = [
      ...source.matchAll(
        /\b(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g,
      ),
    ].map((match) => match[1]);
    for (const specifier of imports) {
      const target = specifier.startsWith('.')
        ? path.posix.normalize(
            path.posix.join(path.posix.dirname(owner), specifier),
          )
        : specifier;
      assert(
        !target.startsWith('server/') && !target.startsWith('@commercetools/'),
        `${owner} imports server/vendor code: ${target}`,
      );
      if (owner.startsWith('src/shared/')) {
        assert(
          !/^src\/(frontgate|grandin|garnethill|legacy)\//.test(target),
          `${owner} imports concrete brand/demo code: ${target}`,
        );
      }
      if (!owner.startsWith('src/legacy/') && owner !== 'src/application.tsx') {
        assert(
          !/^(src|shared)\/legacy\//.test(target),
          `${owner} depends on legacy model: ${target}`,
        );
      }
    }
  }
});

test('shared styles are neutral and brand styles cannot import another brand', async () => {
  for (const file of await sources('src')) {
    if (!file.endsWith('.css')) continue;
    const owner = file.replaceAll('\\', '/');
    const css = await readFile(file, 'utf8');
    if (owner.startsWith('src/shared/'))
      assert(
        !css.includes('data-brand='),
        `${owner} contains a brand override`,
      );
    const brand = owner.match(/^src\/(frontgate|grandin|garnethill)\//)?.[1];
    if (!brand) continue;
    for (const match of css.matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
      const target = path.posix.normalize(
        path.posix.join(path.posix.dirname(owner), match[1]),
      );
      assert(
        target.startsWith(`src/${brand}/`) || target.startsWith('src/shared/'),
        `${owner} crosses brand ownership: ${target}`,
      );
    }
  }
});
