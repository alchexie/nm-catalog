# 关于更新数据的脚本说明

每次拉取数据前请先备份数据库，所有命令均可在 /backend 或项目根目录下执行。

> 以下脚本中的所有命令参数均为可选参数，未提供时将使用默认行为。

## 0. 每周例行数据更新

```bash
npm run update-latest
```

该命令会依次执行以下4个操作：

| -   | 命令                             | 作用                                     |
| --- | -------------------------------- | ---------------------------------------- |
| 1   | npm run pull-game                | 拉取 Game 与 Track 数据                  |
| 2   | npm run pull-playlist            | 拉取游戏相关的 Playlist 数据             |
| 3   | npm run pull-playlist -- section | 更新 Playlist Section 中的 Playlist 数据 |
| 4   | npm run get-img -- original      | 下载本次更新相关的所有图片（包括原图）   |

## 1. 拉取 Game 与 Track 数据

```bash
npm run pull-game
```

- 默认拉取数据库中不存在的数据

- `-- full`
  全量更新

- `-- no-track`
  只拉取 Game 数据

- `-- <gid>`
  指定 Game ID，仅拉取对应数据

- `-- no-exec`
  仅执行拉取与解析逻辑，不写入数据库

### 特殊情况

```bash
# 同一个游戏追加版本的时候（比如增加 ns2ed），为了保持关联链连续，需要全量更新 Game 顺序（不更新 Track）
npm run pull-game -- full no-track

# 拉取指定 Game 数据，通常用在已有游戏追加音轨的时候
npm run pull-game -- ba7a0098-9118-4a35-b52b-44b6a9cbfb14
```

## 2. 拉取游戏关联的 Playlist 数据

```bash
npm run pull-playlist
```

- 默认拉取成功执行 pull-game 之后对应游戏的关联 Playlist 数据

- `-- <gid>`
  指定 Game ID，仅拉取对应的 Playlist 数据

- `-- section`
  拉取 Playlist Section 的内容，已有内容会自动更新或跳过
  （需要将抓包得到的playlist_section.json 放在 /backend/files/response）

- `-- section <pid>`
  指定 Playlist ID，仅拉取 Playlist Section 中指定歌单的数据

- `-- no-exec`
  仅执行拉取与解析逻辑，不写入数据库

## 3. 下载图片资源

```bash
npm run get-img
```

- 默认下载成功执行 pull-game 或 pull-playlist 之后对应游戏与歌单的关联图片资源

- `-- original`
  同时保存原图

- `-- error`
  下载上次出错的图片

- `-- game <gid>`
  下载指定游戏的相关图片资源

- `-- playlist-section <pid>`
  下载 Playlist Section 中指定歌单的相关图片资源
