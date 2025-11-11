import { build } from 'esbuild';
import { glob } from 'glob';

const files = await glob('src/**/*.ts');

await build({
  entryPoints: files,
  outdir: 'dist',
  platform: 'node',
  format: 'esm',
  target: 'node18',
  sourcemap: true,
  minify: false,
  keepNames: true,
}).then(() => {
  console.log('✅ Build completado exitosamente');
  console.log(`📦 ${files.length} archivos compilados a dist/`);
}).catch(() => process.exit(1));
