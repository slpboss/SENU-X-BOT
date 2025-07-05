const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const status =`👋 ${monspace} ʜᴇʟʟᴏᴡ, ɪ'ᴍ ꜱᴇɴᴜ ᴍᴅ  ${pushname}, ɪ'ᴍ ᴀʟɪᴠᴇ ɴᴏᴡ ${monspace}

_*ᴛʜɪꜱ Qᴜᴇᴇɴ ꜱᴇɴᴜ ᴍᴅ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ɪꜱ ᴍᴀᴅᴇ ꜰᴏʀ ʏᴏᴜʀ ᴇᴀꜱʏ ᴛᴏ ᴜꜱᴇ. ᴛʜɪꜱ ʙᴏᴛ ɪꜱ ᴄᴜʀʀᴇɴᴛʟʏ ᴀᴄᴛɪᴠᴇ🪄*_

> *`ᴠᴇʀꜱɪᴏɴ`:* 4.0.0
> *`ᴏᴡɴᴇʀ`*  ${config.OWNER_NAME}
> *`Memory`:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
> *`ʀᴜɴᴛɪᴍᴇ`:* ${runtime(process.uptime())}
> *`Hostname`:* ${os.hostname}

*☘️ `ꜰᴏʟʟᴏᴡ ᴍʏ ᴄʜᴀɴɴᴇʟ`:* https://whatsapp.com/channel/0029Vb2OcviBFLgPzVjWhE0n

> ${config.DESCRIPTION}`;

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363388320701164@newsletter',
                    newsletterName: 'JesterTechX',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
