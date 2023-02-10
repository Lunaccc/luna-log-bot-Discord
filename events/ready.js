const moment = require("moment");
const Discord = require("discord.js");
const config = require("../config.json");

let prefix = config.prefix;

module.exports = client => {
  console.log( ` [${moment().format("YYYY-MM-DD HH:mm:ss")}] BOT: Aktif, Komutlar yüklendi!`);

  console.log(` [${moment().format("YYYY-MM-DD HH:mm:ss")}] BOT: ${client.user.username} ismi ile giriş yapıldı!`);
  
  client.user.setActivity(`Yılmaz Dev`, { type: "WATCHING" });
};
