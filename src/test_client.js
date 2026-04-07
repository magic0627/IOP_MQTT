/**
 * @fileoverview 本地 MQTT 伺服器測試腳本
 * 用於簡單驗證伺服器是否正常運作。
 */

const mqtt = require('mqtt');

// 連接到本地 MQTT 伺服器並使用預設帳號密碼登入
const client = mqtt.connect('mqtt://127.0.0.1:1883', {
  username: 'iop',
  password: 'kh666'
});

client.on('connect', () => {
  console.log('測試用客戶端已成功連接到 MQTT 伺服器！');
  
  // 訂閱主題
  client.subscribe('classroom/test', (err) => {
    if (!err) {
      console.log('成功訂閱主題: classroom/test');
      
      // 發布訊息
      console.log('正在發布測試訊息...');
      client.publish('classroom/test', '哈囉！這是來自測試客戶端的訊息。');
    }
  });
});

client.on('message', (topic, message) => {
  // 當收到訊息時印出
  console.log(`[收到訊息] 主題: ${topic}, 內容: ${message.toString()}`);
  
  // 測試完成後延遲一秒並中斷連線
  setTimeout(() => {
    client.end();
    console.log('測試完成，客戶端已離線。');
  }, 1000);
});

client.on('error', (err) => {
  console.error('連線錯誤:', err);
});
