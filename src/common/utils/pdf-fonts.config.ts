import * as path from 'path';

/**
 * Font registry for Puppeteer/PDF report generation.
 *
 * Languages supported: English (en) | Gujarati (gu)
 * Hindi (hi) excluded per project requirement.
 *
 * Font files sourced from uploaded:
 *   assets/fonts/Noto_Sans/           → English
 *   assets/fonts/Noto_Sans_Gujarati/  → Gujarati
 */

const fontsRoot = path.join(process.cwd(), 'assets', 'fonts');

export const FONTS = {
  english: {
    regular: path.join(fontsRoot, 'Noto_Sans', 'NotoSans-VariableFont_wdth,wght.ttf'),
    italic:  path.join(fontsRoot, 'Noto_Sans', 'NotoSans-Italic-VariableFont_wdth,wght.ttf'),
  },
  gujarati: {
    regular:    path.join(fontsRoot, 'static', 'NotoSansGujarati-Regular.ttf'),
    bold:       path.join(fontsRoot, 'static', 'NotoSansGujarati-Bold.ttf'),
    medium:     path.join(fontsRoot, 'static', 'NotoSansGujarati-Medium.ttf'),
    semiBold:   path.join(fontsRoot, 'static', 'NotoSansGujarati-SemiBold.ttf'),
    light:      path.join(fontsRoot, 'static', 'NotoSansGujarati-Light.ttf'),
    extraLight: path.join(fontsRoot, 'static', 'NotoSansGujarati-ExtraLight.ttf'),
    black:      path.join(fontsRoot, 'static', 'NotoSansGujarati-Black.ttf'),
  },
};

/**
 * Returns the @font-face CSS block to embed in Puppeteer HTML templates.
 * Converts font paths to file:// URIs so Chromium can load them.
 */
export function getFontFaceCSS(): string {
  const toFileUri = (p: string) => `file:///${p.replace(/\\/g, '/')}`;

  return `
    @font-face {
      font-family: 'NotoSans';
      font-style: normal;
      font-weight: 100 900;
      src: url('${toFileUri(FONTS.english.regular)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSans';
      font-style: italic;
      font-weight: 100 900;
      src: url('${toFileUri(FONTS.english.italic)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 100;
      src: url('${toFileUri(FONTS.gujarati.extraLight)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 300;
      src: url('${toFileUri(FONTS.gujarati.light)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 400;
      src: url('${toFileUri(FONTS.gujarati.regular)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 500;
      src: url('${toFileUri(FONTS.gujarati.medium)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 600;
      src: url('${toFileUri(FONTS.gujarati.semiBold)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 700;
      src: url('${toFileUri(FONTS.gujarati.bold)}') format('truetype');
    }
    @font-face {
      font-family: 'NotoSansGujarati';
      font-weight: 900;
      src: url('${toFileUri(FONTS.gujarati.black)}') format('truetype');
    }
  `;
}

/**
 * Returns the correct CSS font-family stack for each supported language.
 */
export function getFontFamily(language: 'en' | 'gu'): string {
  if (language === 'gu') {
    return `'NotoSansGujarati', 'NotoSans', sans-serif`;
  }
  return `'NotoSans', sans-serif`;
}
