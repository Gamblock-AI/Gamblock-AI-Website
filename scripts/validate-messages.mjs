import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_LOCALES = ['en', 'id'];
const messagesDirectory = fileURLToPath(
  new URL('../messages/', import.meta.url)
);

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function collectLeafKeys(value, currentPath, sourceFile, output) {
  if (typeof value === 'string') {
    output.push(currentPath);
    return;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(
      `${sourceFile}: ${currentPath} must be a string or nested object`
    );
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    throw new Error(`${sourceFile}: ${currentPath} must not be empty`);
  }

  for (const [key, child] of entries) {
    collectLeafKeys(
      child,
      currentPath ? `${currentPath}.${key}` : key,
      sourceFile,
      output
    );
  }
}

async function readLocale(locale) {
  const localeDirectory = path.join(messagesDirectory, locale);
  const moduleFiles = sorted(
    (await readdir(localeDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name)
  );

  if (moduleFiles.length === 0) {
    throw new Error(`${locale}: no message modules found`);
  }

  const namespaceOwners = new Map();
  const leafKeys = [];

  for (const moduleFile of moduleFiles) {
    const sourceFile = `${locale}/${moduleFile}`;
    const source = await readFile(path.join(localeDirectory, moduleFile), 'utf8');
    let catalog;

    try {
      catalog = JSON.parse(source);
    } catch (error) {
      throw new Error(`${sourceFile}: invalid JSON`, { cause: error });
    }

    if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
      throw new Error(`${sourceFile}: catalog root must be an object`);
    }

    for (const [namespace, value] of Object.entries(catalog)) {
      const existingOwner = namespaceOwners.get(namespace);
      if (existingOwner) {
        throw new Error(
          `${locale}: namespace ${namespace} exists in ${existingOwner} and ${moduleFile}`
        );
      }
      namespaceOwners.set(namespace, moduleFile);
      collectLeafKeys(value, namespace, sourceFile, leafKeys);
    }
  }

  return {
    moduleFiles,
    leafKeys: sorted(leafKeys),
  };
}

async function main() {
  const locales = sorted(
    (await readdir(messagesDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );

  if (
    difference(EXPECTED_LOCALES, locales).length > 0 ||
    difference(locales, EXPECTED_LOCALES).length > 0
  ) {
    throw new Error(
      `locale folders must be exactly: ${EXPECTED_LOCALES.join(', ')}`
    );
  }

  const catalogs = Object.fromEntries(
    await Promise.all(
      EXPECTED_LOCALES.map(async (locale) => [locale, await readLocale(locale)])
    )
  );
  const reference = catalogs[EXPECTED_LOCALES[0]];

  for (const locale of EXPECTED_LOCALES.slice(1)) {
    const catalog = catalogs[locale];
    const missingModules = difference(reference.moduleFiles, catalog.moduleFiles);
    const extraModules = difference(catalog.moduleFiles, reference.moduleFiles);
    const missingKeys = difference(reference.leafKeys, catalog.leafKeys);
    const extraKeys = difference(catalog.leafKeys, reference.leafKeys);

    if (
      missingModules.length > 0 ||
      extraModules.length > 0 ||
      missingKeys.length > 0 ||
      extraKeys.length > 0
    ) {
      throw new Error(
        [
          `${locale}: catalog structure differs from ${EXPECTED_LOCALES[0]}`,
          `missing modules: ${missingModules.join(', ') || 'none'}`,
          `extra modules: ${extraModules.join(', ') || 'none'}`,
          `missing keys: ${missingKeys.join(', ') || 'none'}`,
          `extra keys: ${extraKeys.join(', ') || 'none'}`,
        ].join('\n')
      );
    }
  }

  console.log(
    `Message catalogs valid: ${EXPECTED_LOCALES.length} locales, ` +
      `${reference.moduleFiles.length} modules, ` +
      `${reference.leafKeys.length} keys per locale.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
