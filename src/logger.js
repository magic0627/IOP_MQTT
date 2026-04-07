/**
 * @fileoverview 日誌紀錄模組
 * 提供簡單的格式化日誌輸出能力，方便在終端機監控伺服器狀態。
 */

/**
 * 取得當前時間的 ISO 字串
 * @return {string} 格式化後的時間字串
 */
function getCurrentTime() {
  return new Date().toISOString();
}

/**
 * 輸出一般資訊日誌
 * @param {string} message 欲輸出的日誌訊息
 */
function info(message) {
  console.log(`[INFO] ${getCurrentTime()} - ${message}`);
}

/**
 * 輸出錯誤日誌
 * @param {string} message 欲輸出的錯誤訊息
 */
function error(message) {
  console.error(`[ERROR] ${getCurrentTime()} - ${message}`);
}

module.exports = {
  info,
  error,
};
