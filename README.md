# github-apps-webhook-add-label

## 起動方法
```
# probot(node.js)を起動
npm run dev
```
```
# 別ターミナルで
ngork http 3000
```

## ngork

```
# ngork install
brew install ngrok/ngrok/ngrok
ngrok version
# Probot が localhost:3000 で起動している前提
ngrok http 3000
```

## .envの設定値の確認
```
node -r dotenv/config -e 'console.log({APP_ID:process.env.APP_ID, KEY_START: (process.env.PRIVATE_KEY||process.env.PRIVATE_KEY_PATH||"").slice(0,30)})'
```