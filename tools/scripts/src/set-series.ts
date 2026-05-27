/*
  Set series information for games from related games
  
  -- no-exec   # only fetch data and not to operate database
*/

import { createInterface } from 'readline';
import { randomUUID } from 'crypto';
import { Game, GameRelation, LangCode, LangCodeValue } from '@nm-catalog/shared';
import { DataRow, getTransactionByStatement, info, stmt } from '@nm-catalog/core';

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

const getLongestCommonSubstring = (strings: string[]): string => {
  if (strings.length === 0) {
    return '[]';
  }
  if (strings.length === 1) {
    return strings[0].split(' ')[0];
  }

  const fullWidthStrings = strings.filter((x) => isMostlyFullWidth(x));
  if (fullWidthStrings.length > 0) {
    strings = fullWidthStrings;
    if (strings.length === 1) {
      return strings[0].split(' ')[0];
    }
  }

  const shortest = strings.reduce((a, b) => (a.length <= b.length ? a : b));
  let longest = '';
  for (let i = 0; i < shortest.length; i++) {
    for (let j = i + 1; j <= shortest.length; j++) {
      const sub = shortest.slice(i, j);
      if (sub.length <= longest.length) continue;
      const existsInAll = strings.every((str) => str.includes(sub));
      if (existsInAll) {
        longest = sub;
      }
    }
  }
  return longest;
};

const isMostlyFullWidth = (str: string): boolean => {
  let full = 0;
  let half = 0;
  for (const ch of str.trim()) {
    const code = ch.charCodeAt(0);
    if (code >= 0x20 && code <= 0x7e) {
      half++;
    } else {
      full++;
    }
  }

  return full > half;
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

      const relatedGameIds = (
        stmt.game_related.selectByGid().all(game.id) as GameRelation[]
      ).map((x) => x.rgid);
      if (!relatedGameIds.length) {
        if (!isNoExec) {
          getTransactionByStatement(stmt.game.updateSeriesByIds([game.id]))([['']]);
        }
        updatedGameIds.add(game.id);
        continue;
      }

      const relatedGames = stmt.game.selectByIds(relatedGameIds).all() as Game[];
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
      const gidInSeries = [game.id, ...relatedGameIds];
      const seriesData: SeriesData = {
        id: seriesId,
        titles: {} as Record<LangCodeValue, string>,
      };
      const suggestedTitleDict: SuggestedTitles = {} as SuggestedTitles;
      for (const lang of langs) {
        const titleKey = `title_${lang.replace('-', '_')}`;
        const gameTitles = [game, ...relatedGames]
          .map((x) => (x as any)[titleKey] as string)
          .map((title) => {
            return title.replace(/\s*[(\[（【｛].*[)\]）】｝]\s*$/g, '').trim();
          });
        suggestedTitleDict[lang] = getLongestCommonSubstring(gameTitles).trim();
      }
      console.log(
        `Games in series:\n${gidInSeries
          .map((id, i) => {
            const game = stmt.game.selectById().get(id) as DataRow;
            return `  ${i + 1}: ${game?.title_zh_CN || id}`;
          })
          .join('\n')}`
      );

      let confirmed = false;
      while (!confirmed) {
        console.log('\nSuggested series titles:');
        for (const lang of langs) {
          console.log(`  ${lang}: "${suggestedTitleDict[lang]}"`);
        }

        const answer = await question(`\nConfirm this series? [y:yes | e:edit]: `);
        const normalizedAnswer = answer.trim().toLowerCase();
        if (normalizedAnswer === 'y' || normalizedAnswer === '') {
          for (const lang of langs) {
            seriesData.titles[lang] = suggestedTitleDict[lang];
          }
          confirmed = true;
        } else if (normalizedAnswer === 'e') {
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
        }
      }

      if (!isNoExec) {
        const seriesValues: string[] = [
          seriesData.id,
          ...Object.values(seriesData.titles),
        ];
        getTransactionByStatement(stmt.series.insert())([seriesValues]);
        getTransactionByStatement(stmt.game.updateSeriesByIds(gidInSeries))([
          [seriesData.id],
        ]);
      }

      for (const gid of gidInSeries) {
        updatedGameIds.add(gid);
      }
      info(`✓ Series created: ${seriesData.titles[LangCode.zh_CN]}\n`);
    }

    if (updatedGameIds.size > 0) {
      info(`\n✓ Updated ${updatedGameIds.size} game(s) in total`);
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
