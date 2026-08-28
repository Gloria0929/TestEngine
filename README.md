# TestEngine 测试平台前端

## 启动

```bash
npm install && npm run dev
```

## 测试账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| Administrator | admin123 | 系统管理员（全权限） |
| test | test123 | 测试工程师 |
| dev | dev123 | 开发工程师 |

## Mock

`VITE_USE_MOCK=true` 启用 MSW；设为 `false` 且配置 `VITE_API_BASE_URL` 走真实后端。

## 构建 / 类型检查

```bash
npm run build       # vue-tsc --noEmit && vite build，产出 dist/
npm run typecheck   # vue-tsc --noEmit 仅类型检查
```
