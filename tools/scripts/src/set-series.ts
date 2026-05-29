/*
  Set series information for games from related games
  
  -- no-exec   # only fetch data and not to operate database
*/

import { createInterface } from 'readline';
import { randomUUID } from 'crypto';
import { Game, GameRelation, LangCode, LangCodeValue } from '@nm-catalog/shared';
import { getTransactionByStatement, info, stmt } from '@nm-catalog/core';

interface SeriesData {
  id: string;
  titles: Record<LangCodeValue, string>;
}
type SuggestedTitles = Record<LangCodeValue, string>;

const args = process.argv.slice(2);
const isNoExec = args.includes('no-exec');

const langs = Object.values(LangCode);

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    readline.question(prompt, resolve);
  });
};

const dropOutlier = (strArr: string[], index: number): string[] => {
  return strArr.filter((_, i) => i !== index);
};

const getLongestCommonChars = (arrStr: string[]): string => {
  if (arrStr.length === 0) return '';
  if (arrStr.length === 1) return arrStr[0];
  const shortest = arrStr.reduce((a, b) => (a.length <= b.length ? a : b));
  let longest = '';
  for (let i = 0; i < shortest.length; i++)
    for (let j = i + longest.length + 1; j <= shortest.length; j++) {
      const sub = shortest.slice(i, j);
      if (arrStr.every((x) => x.includes(sub))) longest = sub;
    }

  const findOutlierIndex = (arrStr: string[]): number => {
    let minLen = Infinity,
      outlier = 0;
    for (let i = 0; i < arrStr.length; i++) {
      let commonLen = 0;
      for (let j = 0; j < arrStr.length; j++) {
        if (i === j) continue;
        let k = 0;
        while (
          k < arrStr[i].length &&
          k < arrStr[j].length &&
          arrStr[i][k] === arrStr[j][k]
        )
          k++;
        commonLen = Math.min(commonLen, k);
      }
      if (commonLen < minLen) {
        minLen = commonLen;
        outlier = i;
      }
    }
    return outlier;
  };
  return longest.length === 1 && arrStr.length > 1
    ? getLongestCommonChars(dropOutlier(arrStr, findOutlierIndex(arrStr)))
    : longest;
};

const getLongestCommonWords = (arrStr: string[]): string => {
  if (arrStr.length === 0) return '';
  if (arrStr.length === 1) return arrStr[0].split(' ')[0];
  const wordArrays = arrStr.map((x) => x.split(/\s+/).filter(Boolean));
  const shortest = wordArrays.reduce((a, b) => (a.length <= b.length ? a : b));
  let best: string[] = [];
  for (let i = 0; i < shortest.length; i++)
    for (let j = i + best.length + 1; j <= shortest.length; j++) {
      const seq = shortest.slice(i, j);
      if (wordArrays.every((x) => x.some((_, k) => seq.every((y, l) => y === x[k + l]))))
        best = seq;
    }
  if (best.length === 1 && wordArrays.length > 1) {
    const outlier = wordArrays.findIndex((x) => !x.includes(best[0]));
    if (outlier !== -1) return getLongestCommonWords(dropOutlier(arrStr, outlier));
    if (wordArrays.length > 2) {
      let minCommon = Infinity,
        idx = 0;
      for (let i = 0; i < wordArrays.length; i++) {
        const common = Math.min(
          ...wordArrays
            .filter((_, j) => j !== i)
            .map((x) => wordArrays[i].filter((y) => x.includes(y)).length)
        );
        if (common < minCommon) {
          minCommon = common;
          idx = i;
        }
      }
      return getLongestCommonWords(dropOutlier(arrStr, idx));
    }
  }
  return best.join(' ');
};

const getLongestCommonSubstring = (arrStr: string[]): string => {
  if (arrStr.length === 0) return '[]';
  if (arrStr.length === 1) return arrStr[0].split(' ')[0];
  const full = arrStr.filter((x) => {
    const trimmed = x.trim();
    const isHalfWidth = (ch: string) => {
      const code = ch.charCodeAt(0);
      return code >= 0x20 && code <= 0x7e;
    };
    const full = [...trimmed].filter((x) => !isHalfWidth(x)).length;
    const half = trimmed
      .split(/\s+/)
      .filter((x) => x.length > 0 && [...x].every(isHalfWidth)).length;
    return full > half;
  });
  if (full.length === 0)
    return getLongestCommonWords(arrStr).trim() || getLongestCommonChars(arrStr);
  if (full.length === 1) return full[0].split(' ')[0];
  return getLongestCommonChars(full);
};

(async () => {
  try {
    const updatedGameIds = new Set<string>();
    const gamesWithoutSeries = stmt.game.selectNoSeries().all() as Game[];

    if (!gamesWithoutSeries.length) {
      info('All games already have series assigned.');
      readline.close();
      return;
    }
    info(
      `+++++++++ Found ${gamesWithoutSeries.length} game(s) without series. +++++++++`
    );

    for (const game of gamesWithoutSeries) {
      if (updatedGameIds.has(game.id)) {
        continue;
      }

      const [relatedGids, linkedGids] = [
        (stmt.game_related.selectByGid().all(game.id) as GameRelation[]).map(
          (x) => x.rgid
        ),
        (stmt.game.selectLinkChainById().all(game.id) as Game[]).map((x) => x.id),
      ];

      const gidInSeries = [...new Set([...relatedGids, ...linkedGids])];
      if (!relatedGids.length) {
        if (!isNoExec) {
          getTransactionByStatement(stmt.game.updateSeriesByIds([game.id]))([['']]);
        }
        updatedGameIds.add(game.id);
        continue;
      }

      const relatedGames = stmt.game.selectByIds(gidInSeries).all() as Game[];
      const relatedGameSid = relatedGames.find((x) => x.sid)?.sid;
      if (relatedGameSid) {
        if (!isNoExec) {
          getTransactionByStatement(stmt.game.updateSeriesByIds([game.id]))([
            [relatedGameSid],
          ]);
        }
        updatedGameIds.add(game.id);
        continue;
      }

      info(`Found new series to create:`);
      const seriesId = randomUUID();
      const seriesData: SeriesData = {
        id: seriesId,
        titles: {} as Record<LangCodeValue, string>,
      };
      const suggestedTitleDict: SuggestedTitles = {} as SuggestedTitles;
      for (const lang of langs) {
        const titleKey = `title_${lang.replace('-', '_')}`;
        const gameTitles = [game, ...relatedGames]
          .map((x) => (x as any)[titleKey] as string)
          .map((x) => {
            return x
              .replace(/\s*(?:[(\[（【｛].*[)\]）】｝]|[:：\-–—,，].*)$/g, '')
              .trim();
          });
        suggestedTitleDict[lang] = getLongestCommonSubstring(gameTitles).trim();
      }
      console.log(
        `Games in series [${gidInSeries.length}]:\n${gidInSeries
          .map((x, i) => {
            const game = stmt.game.selectById().get(x) as Game;
            return `  ${i + 1}: ${game?.title_zh_CN}`;
          })
          .join('\n')}`
      );

      let confirmed = false,
        skipped = false;
      while (!confirmed) {
        console.log('\nSuggested series titles:');
        for (const lang of langs) {
          console.log(`  ${lang}: "${suggestedTitleDict[lang]}"`);
        }

        const answer = (await question(`\nConfirm series? [Y]es, [E]dit, [S]kip: `))
          .trim()
          .toLowerCase();
        switch (answer) {
          case '':
          case 'y':
          case 'yes':
            for (const lang of langs) {
              seriesData.titles[lang] = suggestedTitleDict[lang];
            }
            confirmed = true;
            break;
          case 'e':
          case 'edit':
            for (const lang of langs) {
              console.log(
                `\nEdit title_${lang}: (suggested: "${suggestedTitleDict[lang]}")`
              );
              const newTitle = await question(
                `  enter custom text or press Enter to use suggested: `
              );
              seriesData.titles[lang] =
                newTitle.trim() === '' ? suggestedTitleDict[lang] : newTitle.trim();
            }
            confirmed = true;
            break;
          case 's':
          case 'skip':
            skipped = true;
            confirmed = true;
            break;
          default:
            info('Invalid input. Please enter Y, E, or S.');
        }
      }

      if (!isNoExec) {
        if (skipped) {
          getTransactionByStatement(stmt.game.updateSeriesByIds(gidInSeries))([['']]);
        } else {
          const seriesValues: string[] = [
            seriesData.id,
            ...Object.values(seriesData.titles),
          ];
          getTransactionByStatement(stmt.series.insert())([seriesValues]);
          getTransactionByStatement(stmt.game.updateSeriesByIds(gidInSeries))([
            [seriesData.id],
          ]);
        }
      }

      for (const gid of gidInSeries) {
        updatedGameIds.add(gid);
      }
      if (skipped) {
        info(`✓ Series skipped.\n`);
      } else {
        info(`✓ Series created: ${seriesData.titles[LangCode.zh_CN]}\n`);
      }
    }

    if (updatedGameIds.size > 0) {
      info(`Classified ${updatedGameIds.size} game(s) in total.`);
    } else {
      info(`All games processed.`);
    }

    readline.close();
  } catch (error) {
    console.error(error);
    readline.close();
    process.exit(1);
  }
})();
