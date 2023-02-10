const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const moment = require("moment");
const db = require("quick.db");
require("./util/eventLoader")(client);

const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};




client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});
client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (config.sahip.includes(message.author.id)) permlvl = 4;
  return permlvl;
};
//log sistem bas
//Kanal Silme
client.on("channelDelete", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;
    const yılmaz = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());
    var embed = new Discord.MessageEmbed()
    .setTitle(`${config.isim} | Denetim Kaydı.`)
    .addField(`> Kanalı Silen Kişi:`,` <@${yılmaz.executor.id}>`)
    .addField(`> Silinen Kanalın Adı: `,`${channel.name}`)
    .setFooter(`${config.isim} Log Sistemi | `) 
    .setTimestamp() 
    return client.channels.cache.get(modlog).send(embed)
  });
//Yeni Kanal Oluşturma
  client.on("channelCreate", async channel => {
    let modlog = await db.fetch(`log_${channel.guild.id}`);

    if (!modlog) return;
    const yılmaz = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_CREATE" })
    .then(audit => audit.entries.first());
    var embed = new Discord.MessageEmbed()
    .setTitle(`${config.isim} | Denetim Kaydı.`)
    .addField(`> Kanalı Oluşturan Kişi:`,` <@${yılmaz.executor.id}>`)
    .addField(`> Oluşturduğu Kanal: `,`<#${channel.id}>`)
    .setFooter(`${config.isim} Log Sistemi | `) 
    .setTimestamp() 
    return client.channels.cache.get(modlog).send(embed)
  });
//Kanal Ayarlarını Yenileme
  client.on("channelUpdate", async oldChannel => {
    let modlog = await db.fetch(`log_${oldChannel.guild.id}`);

    if (!modlog) return;
    const yılmaz = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_UPDATE" })
    .then(audit => audit.entries.first());
    var embed = new Discord.MessageEmbed()
    .setTitle(`${config.isim} | Denetim Kaydı.`)
    .addField(`> Kanalı Yeniliyen Kişi:`,` <@${yılmaz.executor.id}>`)
    .addField(`> Yenilik Gelen kanal: `,`<#${oldChannel.id}>`)
    .setFooter(`${config.isim} Log Sistemi | `) 
    .setTimestamp() 
    return client.channels.cache.get(modlog).send(embed)
});
//mesaj silme
client.on("messageDelete", async message => {
  let modlog = await db.fetch(`log_${message.guild.id}`);

  if (!modlog) return;
  const yılmaz = message
  var embed = new Discord.MessageEmbed()
  .setTitle(`${config.isim} | Denetim Kaydı.`)
  .addField(`> Mesajı Silin Kişi:`,` <@${yılmaz.author.id}>`)
  .addField(`> Mesajı Silindiği Kanal:`,` <#${message.channel.id}>`)
  .addField(`> Silinen Mesaj: `,`${message}`)
  .setFooter(`${config.isim} Log Sistemi | `) 
  .setTimestamp() 
  return client.channels.cache.get(modlog).send(embed)
});
//mesaj yenileme
client.on("messageUpdate", async (oldmessage,newmessage) => {
  let modlog = await db.fetch(`log_${oldmessage.guild.id}`);

  if (!modlog) return;
  const yılmaz = oldmessage
  var embed = new Discord.MessageEmbed()
  .setTitle(`${config.isim} | Denetim Kaydı.`)
  .addField(`> Mesajı Yeniliyen Kişi:`,` <@${yılmaz.author.id}>`)
  .addField(`> Mesajın Yenilendiği Kanal:`,` <#${oldmessage.channel.id}>`)
  .addField(`> Eski Mesaj: `,`${oldmessage}`)
  .addField(`> Yeni Mesaj: `,`${newmessage}`)
  .setFooter(`${config.isim} Log Sistemi | `) 
  .setTimestamp() 
  return client.channels.cache.get(modlog).send(embed)
});
  //emoji oluşturma 
  client.on("emojiCreate", async emoji => {
    let modlog = await db.fetch(`log_${emoji.guild.id}`);

    if (!modlog) return;
    const yılmaz = await await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_CREATE" })
    .then(audit => audit.entries.first());
    var embed = new Discord.MessageEmbed()
    .setTitle(`${config.isim} | Denetim Kaydı.`)
    .addField(`> Emojiyi Oluşturan Kişi:`,` <@${yılmaz.executor.id}>`)
    .addField(`> Oluşturulan Emoji: `,`${emoji}`)
    .setFooter(`${config.isim} Log Sistemi | `) 
    .setTimestamp() 
    return client.channels.cache.get(modlog).send(embed)
  });
  //emoji silme
  client.on("emojiDelete", async emoji => {
    let modlog = await db.fetch(`log_${emoji.guild.id}`);

    if (!modlog) return;
    const yılmaz = await await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_DELETE" })
    .then(audit => audit.entries.first());
    var embed = new Discord.MessageEmbed()
    .setTitle(`${config.isim} | Denetim Kaydı.`)
    .addField(`> Emojiyi Silen Kişi:`,` <@${yılmaz.executor.id}>`)
    .addField(`> Silinen Emoji: `,`${emoji}`)
    .setFooter(`${config.isim} Log Sistemi | `) 
    .setTimestamp() 
    return client.channels.cache.get(modlog).send(embed)
  });
  //emoji yenileme
    client.on("emojiUpdate", async (oldemoji,newemoji) => {
      let modlog = await db.fetch(`log_${oldemoji.guild.id}`);

      if (!modlog) return;
      const yılmaz = await oldemoji.guild
      .fetchAuditLogs({ type: "EMOJI_UPDATE" })
      .then(audit => audit.entries.first());
      var embed = new Discord.MessageEmbed()
      .setTitle(`${config.isim} | Denetim Kaydı.`)
      .addField(`> Emojiyi Yeniniliyen Kişi:`,` <@${yılmaz.executor.id}>`)
      .addField(`> Eski Emoji: `,`${oldemoji} \n > Eski İsmi: ${oldemoji.name}`)
      .addField(`> Yeni Emoji: `,`${newemoji} \n > Yeni İsmi: ${newemoji.name}`)
      .setFooter(`${config.isim} Log Sistemi | `) 
      .setTimestamp() 
      return client.channels.cache.get(modlog).send(embed)
    });
    //banlama
    client.on("guildBanAdd", async (guild,user) => {
      let modlog = await db.fetch(`log_${guild.id}`);

      if (!modlog) return;
      const yılmaz = await guild
      .fetchAuditLogs({ type: "MEMBER_BAN_ADD"})
      .then(audit => audit.entries.first());
      var embed = new Discord.MessageEmbed()
      .setTitle(`${config.isim} | Denetim Kaydı.`)
      .addField(`> Banlayan Yetkili:`,` <@${yılmaz.executor.id}>`)
      .addField(`> Banlanan Üye: `,`<@${user.id}>`)
      .addField(`> Ban Sebebi: `,`${yılmaz.reason}`)
      .setFooter(`${config.isim} Log Sistemi | `) 
      .setTimestamp() 
      return client.channels.cache.get(modlog).send(embed)
    });
    //ban kaldırma
    client.on("guildBanRemove", async (guild,user) => {
      let modlog = await db.fetch(`log_${guild.id}`);

      if (!modlog) return;
      const yılmaz = await guild
      .fetchAuditLogs({ type: "MEMBER_BAN_REMOVE"})
      .then(audit => audit.entries.first());
      var embed = new Discord.MessageEmbed()
      .setTitle(`${config.isim} | Denetim Kaydı.`)
      .addField(`> Banı Kaldıran Yetkili:`,` <@${yılmaz.executor.id}>`)
      .addField(`> Banı Kalkan Üye: `,`<@${user.id}>`)
      .setFooter(`${config.isim} Log Sistemi | `) 
      .setTimestamp() 
      return client.channels.cache.get(modlog).send(embed)
    });
//rol oluşrurma
client.on("roleCreate", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;
  const yılmaz = await role.guild
  .fetchAuditLogs({ type: "ROLE_CREATE"})
  .then(audit => audit.entries.first());
  var embed = new Discord.MessageEmbed()
  .setTitle(`${config.isim} | Denetim Kaydı.`)
  .addField(`> Rolü Oluşturan Kişi:`,` <@${yılmaz.executor.id}>`)
  .addField(`> Oluşturulan Rol: `,`${role.name}`)
  .setFooter(`${config.isim} Log Sistemi | `) 
  .setTimestamp() 
  return client.channels.cache.get(modlog).send(embed)
});
//rol silme
client.on("roleDelete", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;
  const yılmaz = await role.guild
  .fetchAuditLogs({ type: "ROLE_DELETE"})
  .then(audit => audit.entries.first());
  var embed = new Discord.MessageEmbed()
  .setTitle(`${config.isim} | Denetim Kaydı.`)
  .addField(`> Rolü Silen Kişi:`,` <@${yılmaz.executor.id}>`)
  .addField(`> Silinen Rol İsmi: `,`${role.name}`)
  .setFooter(`${config.isim} Log Sistemi | `) 
  .setTimestamp() 
  return client.channels.cache.get(modlog).send(embed)
});
//rol yenileme
client.on("roleUpdate", async (oldrole,nrole) => {
  let modlog = await db.fetch(`log_${oldrole.guild.id}`);

  if (!modlog) return;
  const yılmaz = await oldrole.guild
  .fetchAuditLogs({ type: "ROLE_UPDATE"})
  .then(audit => audit.entries.first());
  var embed = new Discord.MessageEmbed()
  .setTitle(`${config.isim} | Denetim Kaydı.`)
  .addField(`> Rolü Yenileyen Kişi:`,` <@${yılmaz.executor.id}>`)
  .addField(`> Eski İsmi: `,`${oldrole.name}`)
  .addField(`> Yeni İsmi: `,`${nrole.name}`)
  .addField(`> Açıklama: `,`İsim Aynı İse Yetkisi İle Oynanmıştır.`)
  .setFooter(`${config.isim} Log Sistemi | `) 
  .setTimestamp() 
  return client.channels.cache.get(modlog).send(embed)
});
//log sistem son
  client.login(`${config.token}`)

