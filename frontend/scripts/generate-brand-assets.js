/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { optimize } = require('svgo');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_SVG = path.resolve(ROOT, '..', 'references', 'logo-1.svg');
const APP_SVG_TARGET = path.resolve(ROOT, 'src', 'assets', 'logo.svg');
const OUTPUT_DIR = path.resolve(ROOT, 'assets', 'branding');

const BRAND_GREEN = '#22C95F';
const BRAND_DARK = '#0A0F0A';

async function ensureDirs() {
  await fs.mkdir(path.dirname(APP_SVG_TARGET), { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function readSourceSvg() {
  return fs.readFile(SOURCE_SVG, 'utf8');
}

function optimizeSvg(sourceSvg) {
  return optimize(sourceSvg, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
      },
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'removeDimensions',
    ],
  }).data;
}

function extractSvgInner(svgMarkup) {
  const match = svgMarkup.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match?.[1]) {
    throw new Error('Unable to extract inner SVG content from references/logo-1.svg');
  }
  return match[1];
}

async function writeAppSvg(svgMarkup) {
  const currentColorSvg = svgMarkup
    .replace(/fill="#000"/gi, 'fill="currentColor"')
    .replace(/fill="#000000"/gi, 'fill="currentColor"');
  await fs.writeFile(APP_SVG_TARGET, currentColorSvg, 'utf8');
}

function buildLogoSvg({ canvasSize, logoWidth, translateX, translateY, withBackground, svgInner }) {
  const scale = logoWidth / 1248;
  const backgroundRect = withBackground
    ? `<rect width="${canvasSize}" height="${canvasSize}" fill="${BRAND_DARK}" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">${backgroundRect}<g transform="translate(${translateX} ${translateY}) scale(${scale})" fill="${BRAND_GREEN}">${svgInner}</g></svg>`;
}

function renderPng(svgMarkup) {
  return new Resvg(svgMarkup, {
    fitTo: { mode: 'original' },
  })
    .render()
    .asPng();
}

async function generatePngAssets(svgMarkup) {
  const svgInner = extractSvgInner(svgMarkup)
    .replace(/fill="#000"/gi, '')
    .replace(/fill="#000000"/gi, '')
    .replace(/stroke="none"/gi, '');

  const iconSvg = buildLogoSvg({
    canvasSize: 1024,
    logoWidth: 760,
    translateX: 132,
    translateY: 259,
    withBackground: true,
    svgInner,
  });
  const adaptiveSvg = buildLogoSvg({
    canvasSize: 1024,
    logoWidth: 760,
    translateX: 132,
    translateY: 259,
    withBackground: false,
    svgInner,
  });
  const splashSvg = buildLogoSvg({
    canvasSize: 1400,
    logoWidth: 900,
    translateX: 250,
    translateY: 400,
    withBackground: false,
    svgInner,
  });

  await Promise.all([
    fs.writeFile(path.resolve(OUTPUT_DIR, 'icon.png'), renderPng(iconSvg)),
    fs.writeFile(path.resolve(OUTPUT_DIR, 'adaptive-icon.png'), renderPng(adaptiveSvg)),
    fs.writeFile(path.resolve(OUTPUT_DIR, 'splash.png'), renderPng(splashSvg)),
  ]);
}

async function main() {
  await ensureDirs();
  const sourceSvg = await readSourceSvg();
  const optimizedSvg = optimizeSvg(sourceSvg);
  await writeAppSvg(optimizedSvg);
  await generatePngAssets(optimizedSvg);
  console.log('Brand assets generated successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
