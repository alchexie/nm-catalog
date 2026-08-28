# Database 说明

本文档描述 `nm-catalog` 项目 SQLite 数据库（`files/data.db`）的表结构与演进历史。

> - 数据库文件路径：`DB_PATH`（见 `packages/core/src/utils/paths.ts`，即 `files/data.db`）
> - 建表入口：`tools/scripts/src/init-db.ts`
> - 表定义：`packages/core/src/db/schema/*.ts`

## 0. 当前数据库结构（最新状态）

`pnpm init-db`（必要时加 `-- force`）会直接创建出符合最新要求、可直接使用的数据库，无需再执行任何迁移脚本。

### 表清单（9 张）

| 表名 | 说明 | 主键/唯一约束 | 关键列 |
| --- | --- | --- | --- |
| `lang` | 支持的语言 | `id TEXT PK` | `desc` |
| `hardware` | 游戏主机 | `name TEXT PK` | `year` |
| `game` | 游戏 | `id TEXT PK` | `year`、`hardware`、`link`、`title_*/img_*`（9 语言 × 2）、`sid`、`inserted` |
| `track` | 曲目 | `id TEXT PK` | `gid`、`idx`、`duration`、`isloop`、`isbest`、`title_*/img_*`（9 语言 × 2） |
| `game_related` | 游戏关联（相关作品） | `UNIQUE(gid, rgid)` | `gid`、`rgid` |
| `playlist` | 歌单 | `id TEXT PK` | `type`、`isrelatedgame`、`tracksnum`、`title_*/img_*/desc_*`（9 语言 × 3）、`fetchstrategy`、`isexpired` |
| `playlist_game` | 歌单↔游戏 | `UNIQUE(pid, gid)` | `pid`、`gid`、`sort` |
| `playlist_track` | 歌单↔曲目 | `UNIQUE(pid, tid)` | `pid`、`idx`、`tid` |
| `series` | 游戏系列 | `id TEXT PK` | `title_*`（9 语言） |

> 语言列命名约定：`<字段>_<lang>`，`lang` 将 `-` 替换为 `_`，如 `title_zh_CN`、`img_en_US`、`desc_ja_JP`。图片列存的是 assetId（图片 URL 的最后一段）。

### 索引（7 个）

由 `init-db.ts` 在创建全部表后统一建立：

| 索引 | 作用 |
| --- | --- |
| `idx_game_hardware` | 按主机查游戏 |
| `idx_track_gid` | 按游戏查曲目 |
| `idx_track_gid_idx` | 按游戏 + 序号取曲目 |
| `idx_playlist_type` | 按歌单类型查询 |
| `idx_playlist_game_pid` | 按歌单查游戏 |
| `idx_playlist_game_gid` | 按游戏查歌单 |
| `idx_playlist_track_pid_idx` | 按歌单 + 序号取曲目 |

### 种子数据（preparedData）

- `lang`：9 种语言（de-DE / en-US / es-ES / fr-FR / it-IT / ja-JP / ko-KR / zh-CN / zh-TW）
- `hardware`：13 台主机（NES 1983 → Nintendo Switch 2 2025）

### 关键字段语义

| 字段 | 说明 |
| --- | --- |
| `game.link` | 关联链：指向同一游戏实体下另一版本（如 NS 版 / NS2 版）的游戏 ID；根版本为 `''` |
| `game.sid` | 所属系列 ID，关联 `series.id`，由 `set-series` 脚本维护 |
| `game.inserted` | 入库时间戳（毫秒），用于“最近添加”排序 |
| `track.isloop` / `track.isbest` | 0/1 标记（循环曲 / 精选曲） |
| `playlist.type` | 歌单类型：`SINGLE_GAME_ALL`、`BEST`、`SINGLE_GAME`、`LOOP`、`MULTIPLE`、`SPECIAL` 等 |
| `playlist.fetchstrategy` | 动态拉取策略（SQL 片段）。非空时表示曲目不存 `playlist_track`，运行时按该 SQL 从 `track` 表取（如 BEST 精选） |
| `playlist.isexpired` | 歌单是否已下架/过期（0/1），由 `expire-playlist` 脚本维护 |
| `playlist_game.sort` | 歌单在所属游戏下的展示顺序；`-1` 表示跨游戏聚合歌单（MULTIPLE），不参与常规排序 |

## 1. 建表与数据流程

数据从初始化到日常更新按以下顺序进行：

```text
init-db 建 9 表 + 种子 + 索引
  └─> init-data 从 xlsx 导入（game / track / game_related）
        └─> pull-game 增量拉取游戏与曲目
              ├─> pull-playlist 拉取歌单数据
              │     ├─> get-img 下载图片
              │     ├─> set-series 设置系列
              │     └─> expire-playlist 标记过期歌单
              └─> （重复日常更新流程）
```

### 各步骤做什么

| 步骤 | 命令 | 作用 |
| --- | --- | --- |
| 1 | `pnpm init-db [-- force]` | 创建最新结构的空库。`-- force` 会先删除已有库文件再重建 |
| 2 | `pnpm init-data [-- full]` | 从 `files/xlsx/*.xlsx` 导入初始数据（`game` / `track` / `game_related`）。`-- full` 会先清空 `game`、`track` 再全量写入；默认增量（只写新游戏） |
| 3 | `pnpm pull-game` | 从上游 API 增量拉取游戏与曲目，写入 `game` / `track`，并输出本次新增游戏 ID 到 `files/new_game.json` |
| 4 | `pnpm pull-playlist` | 拉取游戏关联歌单，写入 `playlist` / `playlist_game` / `playlist_track`（`-- order` 更新排序、`-- section` 处理歌单分区、`-- character` 标记角色歌单） |
| 5 | `pnpm get-img` | 下载游戏/歌单关联图片到 `assets/`（`-- original` 额外保存原图） |
| 6 | `pnpm set-series` | 交互式给游戏设置系列（写入 `game.sid` 与 `series` 表） |
| 7 | `pnpm expire-playlist` | 根据 `files/response/playlist_section.json` 的 `expired` 字段更新 `playlist.isexpired` |

## 2. 更新日志（历史演进）

> 以下为历史迁移脚本（`packages/core/src/db/update/archive/` 下的 `sql_*.txt`，仅作归档、不再执行）所记录的演进历史。这些结构变更已**全部合并进 `init-db`**——新库直接为最新结构，无需执行迁移。
>
> 对于**已存在的旧库**（例如由旧版 `init-db` 创建的库），或未来新增结构变更时，使用 `modify-db` 脚本按相同思路执行（见下文「未来数据库结构更新」）。

| 日期 | 变更内容 | 合并进 init-db 的方式 |
| --- | --- | --- |
| 2025-11-20 | 引入 Playlist 体系：新建 `playlist` / `playlist_game` / `playlist_track` 三张表；为已有表建 7 个索引 | 建表列表新增 3 张表；索引数组统一创建 |
| 2026-01-21 | `playlist` 增加 `fetchstrategy` 列；为 BEST 精选歌单写入动态拉取 SQL，并清空其 `playlist_track` 关联 | `playlist.create()` 中直接包含 `fetchstrategy` 列 |
| 2026-04-24 | `playlist` 增加 `isexpired` 列，存量数据置 0 | `playlist.create()` 中直接包含 `isexpired` 列 |
| 2026-05-27 | 新建 `series` 表；`game` 增加 `sid` 列 | 建表列表新增 `series`；`game.create()` 中直接包含 `sid` 列 |
| 2026-07-03 | `playlist_game` 增加 `sort` 列 | `playlist_game.create()` 中直接包含 `sort` 列 |

## 3. 未来数据库结构更新（update + modify-db）

当未来需要给**已存在的数据库**变更表结构（加列、加表、建索引、改数据等）时，遵循以下流程：

### 原则

- **新库**：直接在 `schema/*.ts` 的 `create()` 与 `init-db.ts` 中更新建表/索引定义，保证 `pnpm init-db` 建出的库始终是最新结构。
- **旧库 / 生产库**：不能直接改 `schema` 就完事，必须用 `modify-db` 对现有库执行增量 SQL（因为 `ALTER TABLE` 不会自动发生）。

> 每次拉取数据前请先备份数据库（`pnpm backup-db`）。

### 操作步骤（沿用历史 update 的方式）

与历史迁移脚本（`db/update/archive/sql_*.txt`）相同的三步流程：

**① 在 `packages/core/src/db/update/` 新建一个迁移脚本**（`.ts`，可编译），命名 `sql_YYMMDD.ts`（如 `sql_260801.ts`），风格与归档脚本一致——**自包含**（自己打开/关闭连接）：

```ts
import Database from 'better-sqlite3';
import { DB_PATH } from '../../utils/paths.js';

const update = () => {
  const db = new Database(DB_PATH);
  db.exec(`ALTER TABLE playlist ADD COLUMN newfield TEXT`);
  db.exec(`UPDATE playlist SET newfield = 'default'`);
  db.close();
};

export default update;
```

**② 在 `packages/core/src/index.ts` 导出它**（与历史 `updateSql251120` 等相同）：

```ts
export { default as updateSql260801 } from './db/update/sql_260801.js';
```

**③ 在 `tools/scripts/src/modify-db.ts` 中引入并按时间顺序调用**（与历史 `modify-db` 的写法一致）：

```ts
import { info, updateSql260801 } from '@nm-catalog/core';

updateSql260801();   // 最新迁移
info('Database modified!');
```

然后执行：

```bash
pnpm modify-db            # 开发环境
# 或
pnpm build && pnpm modify-db:prod   # 生产环境（运行 dist 编译产物）
```

> 迁移脚本是**自包含**的（自己打开/关闭连接），`modify-db` 只是按顺序逐个调用它们。

### 注意事项

- 迁移只应包含**幂等或一次性**的结构变更；如需重复执行安全，可在 SQL 里做存在性判断（如 `ALTER TABLE ... ADD COLUMN` 前先检查 `PRAGMA table_info`，或用 `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`）。
- 同步更新 `schema/*.ts` 与 `init-db.ts`，使新库与迁移后的旧库结构一致；并在本文档「更新日志」追加一条记录。
- 已完成并合并进 `init-db` 的历史迁移，可移入 `packages/core/src/db/update/archive/` 存档（改名为 `.txt`，不再参与编译、内容保持原样）。
- `modify-db` 是结构迁移入口，与数据更新（`pull-game` / `pull-playlist` 等）职责分离：数据更新走 `stmt` 的 upsert 语句，不改表结构。
