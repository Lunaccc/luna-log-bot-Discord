const Discord = require("discord.js");
const db = require("quick.db");
const config = require("../config.json");

exports.run = async (client, message, args) => {
 
  let prefix = config.prefix;
  if (!message.member.hasPermission("ADMINISTRATOR"))return message.channel.send(
    new Discord.MessageEmbed()
    .setTitle(`${config.isim} | Denetim Kaydı.`)
    .setDescription(` Bu komutu kullanabilmek için "\`Yönetici\`" yetkisine sahip olmalısın.`)
    .setFooter(`${config.isim} Log Sistemi | `) 
    .setTimestamp() 
    );

  let logk = message.mentions.channels.first();
  let logkanal = await db.fetch(`log_${message.guild.id}`);

  if (args[0] === "sıfırla" || args[0] === "kapat") {
    db.delete(`log_${message.guild.id}`);
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setDescription(
          `✅ | Mod-log kanalı başarıyla sıfırlandı.`
        )
    );
    return;
  }
  db.set(`log_${message.guild.id}`, logk.id);
  message.channel.send(
    new Discord.MessageEmbed()
      .setColor("#ff0000")
      .setDescription(` Mod-log kanalı başarıyla ${logk} olarak ayarlandı.`)
  );
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["mod-log", "modlog", "log-ayarlama"],
  permLevel: 3,
  kategori: "moderasyon"
};

exports.help = {
  name: "mod-log",
  description: "Mod-Log kanalını belirler.",
  usage: "mod-log <#kanal>"
};