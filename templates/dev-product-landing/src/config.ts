/**
 * Product content for this landing shell.
 * Copy this file into a new project and rewrite the fields.
 */

export type ThemeId = 'slate' | 'editorial' | 'terminal' | 'nordic';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  icon: string;
  scheme: 'dark' | 'light';
}

export interface StackCard {
  id: string;
  label: string;
  shortLabel: string;
  packageName: string;
  file: string;
  install: string;
  packageUrl: string;
  blurb: string;
  apiHint: string;
  peers: string;
  tags: string[];
  code: string;
}

export interface ProductConfig {
  name: string;
  version: string;
  tagline: [string, string];
  description: string;
  githubUrl: string;
  stats: { symbol: string; label: string }[];
  themes: ThemePreset[];
  stacks: StackCard[];
  footerLinks: { label: string; href: string }[];
}

export const product: ProductConfig = {
  name: 'AcmeSDK',
  version: 'v1.0',
  tagline: ['Ship developer tools', 'with a clear story'],
  description:
    'A reusable landing shell for OSS and product docs: vertical rail, theme presets, nested install selector, and a compact stack explorer. Swap config — keep the layout.',
  githubUrl: 'https://github.com/example/acme-sdk',
  stats: [
    { symbol: '<', label: 'gzip friendly' },
    { symbol: '~', label: 'MIT' },
    { symbol: '^', label: 'React · Vue · Node' },
    { symbol: '@', label: 'TypeScript' },
  ],
  themes: [
    { id: 'slate', name: 'Slate Blue', icon: '\u25CF', scheme: 'dark' },
    { id: 'editorial', name: 'Editorial', icon: '\uD83D\uDCDC', scheme: 'light' },
    { id: 'terminal', name: 'Terminal', icon: '\uD83D\uDCDF', scheme: 'dark' },
    { id: 'nordic', name: 'Nordic', icon: '\uD83D\uDC8E', scheme: 'light' },
  ],
  stacks: [
    {
      id: 'react',
      label: 'React',
      shortLabel: 'React',
      packageName: '@acme/react',
      file: 'App.tsx',
      install: 'npm i @acme/react',
      packageUrl: 'https://www.npmjs.com/package/@acme/react',
      blurb:
        'Declarative bindings for React 18+. Controlled props, typed events, and tree-shakeable entrypoints.',
      apiHint: 'isOpen · onClose · theme',
      peers: 'react ≥18',
      tags: ['components', 'hooks', 'TS'],
      code: `import { useState } from "react";
import { AcmeClient } from "@acme/react";

export function App() {
  const [ready, setReady] = useState(false);
  return (
    <AcmeClient
      apiKey={import.meta.env.VITE_ACME_KEY}
      onReady={() => setReady(true)}
    />
  );
}`,
    },
    {
      id: 'vue',
      label: 'Vue',
      shortLabel: 'Vue',
      packageName: '@acme/vue',
      file: 'App.vue',
      install: 'npm i @acme/vue',
      packageUrl: 'https://www.npmjs.com/package/@acme/vue',
      blurb:
        'Vue 3 components with v-model support. Same core runtime as the React package.',
      apiHint: 'v-model · @ready · theme',
      peers: 'vue ≥3.2',
      tags: ['v-model', 'composition'],
      code: `<script setup lang="ts">
import { AcmeClient } from "@acme/vue";
</script>

<template>
  <AcmeClient :api-key="key" @ready="onReady" />
</template>`,
    },
    {
      id: 'node',
      label: 'Node',
      shortLabel: 'Node',
      packageName: '@acme/node',
      file: 'server.ts',
      install: 'npm i @acme/node',
      packageUrl: 'https://www.npmjs.com/package/@acme/node',
      blurb:
        'Server SDK for Node 18+. Streaming helpers, retries, and structured errors.',
      apiHint: 'createClient() · stream() · withRetry()',
      peers: 'node ≥18',
      tags: ['server', 'stream', 'retry'],
      code: `import { createClient } from "@acme/node";

const client = createClient({ apiKey: process.env.ACME_KEY! });
const result = await client.run({ prompt: "hello" });
console.log(result.text);`,
    },
    {
      id: 'cli',
      label: 'CLI',
      shortLabel: 'CLI',
      packageName: 'acme',
      file: 'terminal',
      install: 'npm i -g acme',
      packageUrl: 'https://www.npmjs.com/package/acme',
      blurb:
        'Global CLI for local workflows. Login, run, and export without leaving the shell.',
      apiHint: 'acme login · acme run · acme export',
      peers: 'node ≥18',
      tags: ['cli', 'dx'],
      code: `$ acme login
$ acme run ./task.yaml
$ acme export --format json > out.json`,
    },
  ],
  footerLinks: [
    { label: 'GitHub', href: 'https://github.com/example/acme-sdk' },
    { label: 'Docs', href: '#quickstart' },
    { label: 'npm', href: 'https://www.npmjs.com/org/acme' },
  ],
};
