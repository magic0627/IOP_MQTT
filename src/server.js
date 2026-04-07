/**
 * @fileoverview 本地 MQTT 伺服器核心程式
 * 基於 aedes 建構，提供教學環境中輕量級的 MQTT 代理服務。
 */

const aedes = require('aedes')();
const net = require('net');
const os = require('os');
const logger = require('./logger');

const port = 1883;

/**
 * 取得本機所有的對外 IPv4 IP 位址
 * @return {string[]} IP 位址陣列
 */
function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name]) {
      // 僅提取 IPv4 且非內部回環 (loopback) 位址
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        addresses.push(networkInterface.address);
      }
    }
  }

  return addresses;
}

// ----------- 驗證機制設定 -----------

/**
 * 處理客戶端的認證請求
 * @param {object} client 客戶端物件
 * @param {string} username 使用者名稱
 * @param {Buffer} password 密碼 Buffer
 * @param {function} callback 回呼函式 (error, successful)
 */
aedes.authenticate = (client, username, password, callback) => {
  const isAuth = username === 'iop' && password && password.toString() === 'kh666';
  
  if (isAuth) {
    logger.info(`[Auth Success] 使用者 '${username}' 授權成功 (Client ID: ${client.id})`);
    callback(null, true);
  } else {
    logger.error(`[Auth Failed] 拒絕連線！使用者 '${username || '未提供'}' 密碼錯誤或未授權 (Client ID: ${client.id})`);
    const error = new Error('Auth error');
    error.returnCode = 4; // 0x04: 不正確的使用者名稱或密碼
    callback(error, false);
  }
};

// ----------- 事件監聽設定 -----------

// 紀錄客戶端連接事件
aedes.on('client', (client) => {
  logger.info(`[Client Connected] Client ID: ${client.id}`);
});

// 紀錄客戶端斷線事件
aedes.on('clientDisconnect', (client) => {
  logger.info(`[Client Disconnected] Client ID: ${client.id}`);
});

// 紀錄主題訂閱事件
aedes.on('subscribe', (subscriptions, client) => {
  if (client) {
    const topics = subscriptions.map((s) => s.topic).join(', ');
    logger.info(`[Subscribe] Client ID: ${client.id}, Topics: ${topics}`);
  }
});

// 紀錄訊息發布事件
aedes.on('publish', (packet, client) => {
  if (client) {
    logger.info(`[Publish] Client ID: ${client.id}, Topic: ${packet.topic}, Payload: ${packet.payload.toString()}`);
  }
});

// ----------- 啟動伺服器 -----------

const server = net.createServer(aedes.handle);

server.listen(port, '0.0.0.0', () => {
  logger.info(`MQTT 伺服器已成功啟動並監聽於 port ${port} (0.0.0.0)`);
  
  const localIPs = getLocalIPAddresses();
  if (localIPs.length > 0) {
    logger.info('您可以透過以下 IP 位址讓區域網路內的裝置進行連線：');
    localIPs.forEach((ip) => {
      logger.info(`  -> mqtt://${ip}:${port}`);
    });
  }
  
  logger.info(`另外您也可以使用本機測試位址：`);
  logger.info(`  -> mqtt://127.0.0.1:${port}`);
  
  logger.info('等待裝置連線中...');
});
