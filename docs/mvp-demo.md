# Conduit MVP 真实演示说明

本文用于在 Windows 上快速启动真实 Conduit，并验证文章详情页字数统计功能。

## 1. Windows 一键启动

```powershell
cd E:\ByteDance\sandbox-repo
npm.cmd run dev:win
```

如果并发启动不稳定，可以拆成两个终端：

```powershell
cd E:\ByteDance\sandbox-repo
npm.cmd run dev:backend
```

```powershell
cd E:\ByteDance\sandbox-repo
npm.cmd run dev:frontend
```

前端地址：`http://localhost:3000/`

后端 API：`http://localhost:3001/api`

## 2. 数据库初始化

development 默认使用本地 SQLite 文件：

```text
backend/storage/dev.sqlite
```

初始化或更新数据库结构：

```powershell
cd E:\ByteDance\sandbox-repo
npm.cmd run db:migrate
```

该命令不需要安装 MySQL 或 PostgreSQL。

## 3. Demo Seed

写入真实后端数据库：

```powershell
cd E:\ByteDance\sandbox-repo
npm.cmd run demo:seed
```

该命令可重复执行，会按固定 slug 更新 demo 文章，不会不断创建重复文章。

登录账号：

```text
email: mvpuser@example.com
password: 12345678
username: mvpuser
```

## 4. Demo 文章

前端使用 HashRouter，文章详情页 URL 形如：

```text
http://localhost:3000/#/article/{slug}
```

| 标题 | slug | 预期显示 |
| --- | --- | --- |
| AI MVP Word Count 10 | `ai-mvp-word-count-10` | `本文共 10 字，预计阅读 1 分钟` |
| AI MVP Word Count 300 | `ai-mvp-word-count-300` | `本文共 300 字，预计阅读 1 分钟` |
| AI MVP Word Count 301 | `ai-mvp-word-count-301` | `本文共 301 字，预计阅读 2 分钟` |
| AI MVP Word Count Different Body | `ai-mvp-word-count-different-body` | `本文共 5 字，预计阅读 1 分钟` |

## 5. 手动新建文章

1. 打开 `http://localhost:3000/`。
2. 使用上面的账号登录，或注册自己的账号。
3. 点击 `New Article`。
4. 填写标题、描述、正文和标签。
5. 点击 `Publish Article`。
6. 发布后进入 `/article/:slug` 详情页。
7. 在正文下方确认显示 `本文共 XXX 字，预计阅读 X 分钟`。

## 6. 手动编辑文章

1. 登录文章作者账号。
2. 打开文章详情页。
3. 点击 `Edit Article`。
4. 修改正文 body。
5. 点击 `Update Article`。
6. 回到详情页后确认字数统计跟着 body 变化。

## 7. 确认数据来自接口

1. 打开浏览器开发者工具。
2. 在 Network 中找到 `api/articles/{slug}` 请求。
3. 查看 Response 中的 `article.body`。
4. 对照页面正文下方的统计文案。
5. 代码位置是 `frontend/src/routes/Article/Article.jsx`，统计基于 `article.body`，阅读时间使用 `Math.max(1, Math.ceil(wordCount / 300))`。

也可以直接请求后端：

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/articles/ai-mvp-word-count-10"
```

## 8. 验收命令

```powershell
cd E:\ByteDance\sandbox-repo
npm.cmd run lint
npm.cmd run test
npm.cmd run build -w frontend
```
