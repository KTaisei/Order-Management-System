import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// CORS設定を更新
const io = new Server(httpServer, {
  cors: {
    origin: true, // すべてのオリジンを許可
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected clients
const clients = new Set();

io.on('connection', (socket) => {
  console.log('クライアント接続:', socket.id);
  clients.add(socket.id);

  // 接続されているクライアント数を全クライアントに通知
  io.emit('clientCount', clients.size);

  socket.on('new-order', (order) => {
    console.log('新規注文:', order);
    socket.broadcast.emit('new-order', order);
  });

  socket.on('update-order', (order) => {
    console.log('注文更新:', order);
    socket.broadcast.emit('update-order', order);
  });

  socket.on('complete-order', (order) => {
    console.log('注文完了:', order);
    socket.broadcast.emit('complete-order', order);
  });

  socket.on('disconnect', () => {
    console.log('クライアント切断:', socket.id);
    clients.delete(socket.id);
    io.emit('clientCount', clients.size);
  });
});

// すべてのインターフェースでリッスン
const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`サーバー起動: http://0.0.0.0:${PORT}`);
});