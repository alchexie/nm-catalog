import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { DEFAULT_LANG, LangCodeValue } from '@nm-catalog/shared';

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../.env'),
});

const proxyUrl = process.env.HTTPS_PROXY;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

export const UPSTREAM_API_BASE_URL = 'https://api.m.nintendo.com/catalog/';
export const UPSTREAM_IMG_BASE_URL = 'https://image-assets.m.nintendo.com/';

const sSuffixParams =
  '&membership=BASIC&packageType=hls_cbcs&sdkVersion=ios-1.4.0_f362763-1';
const maxRetry = 3;

async function request(url: string, lang?: LangCodeValue): Promise<any> {
  let retry = 0;
  while (retry <= maxRetry) {
    try {
      if (retry === 0) {
        const displayUrl = url.replace(sSuffixParams, '');
        console.log(`Fetching: ${displayUrl}`);
      } else {
        console.log(`Retry fetching (${retry + 1}): ${url}`);
      }

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Nintendo Music/1.4.0 (com.nintendo.znba; build:25101508; iOS 26.1.0) Alamofire/5.10.2',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': lang || DEFAULT_LANG,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      retry += 1;
      if (retry >= maxRetry) {
        console.error('\x1b[31m%s\x1b[0m', `Failed after retries: ${url}`, err);
        throw err;
      }
      const delay = 500 * retry;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export const upstreem = {
  async getGamesByRecent(lang: LangCodeValue = DEFAULT_LANG): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}games:all?country=JP&lang=${lang}&sortRule=RECENT`,
      lang
    );
  },

  async getGamesByYear(lang: LangCodeValue = DEFAULT_LANG): Promise<any> {
    return (
      await request(
        `${UPSTREAM_API_BASE_URL}gameGroups?country=JP&groupingPolicy=RELEASEDAT&lang=${lang}`,
        lang
      )
    ).releasedAt;
  },

  async getGamesByHardware(lang: LangCodeValue = DEFAULT_LANG): Promise<any> {
    return (
      await request(
        `${UPSTREAM_API_BASE_URL}gameGroups?country=JP&groupingPolicy=HARDWARE&lang=${lang}`,
        lang
      )
    ).hardware;
  },

  async getPlaylistInfoOfGame(
    gameId: string,
    lang: LangCodeValue = DEFAULT_LANG
  ): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}games/${gameId}/relatedPlaylists?country=JP&lang=${lang}${sSuffixParams}`,
      lang
    );
  },

  async getRelatedsOfGame(gameId: string): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}games/${gameId}/relatedGames?country=JP&lang=zh-CN`,
      'zh-CN'
    );
  },

  async getPlaylistInfo(
    playlistId: string,
    lang: LangCodeValue = DEFAULT_LANG
  ): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}officialPlaylists/${playlistId}?country=JP&lang=${lang}${sSuffixParams}`,
      lang
    );
  },

  async getCharacterPlaylistInfo(): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}sections/home/f8d54567-6275-43d6-8fab-549343b688a3?country=JP&lang=zh-CN`
    );
  },

  async getImage(assetId: string): Promise<Buffer | null> {
    const res = await fetch(`${UPSTREAM_IMG_BASE_URL}${assetId}`);
    if (!res.ok) {
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  },
};
