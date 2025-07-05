const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const config = require('../config');
const api = "https://nethu-api-ashy.vercel.app";
let lastSearchResults = {}; // Store search context per chat

const LANG = config.LANG === 'SI';

cmd({
    pattern: "sinhalasub new",
    alias: ["ssubnew"],
    desc: LANG ? "Number reply ක්‍රමයට Sinhalasub" : "Sinhalasub using number reply",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(LANG ? "🔍 කරුණාකර සෙවීමට වචන කිහිපයක් ඇතුළත් කරන්න" : "🔍 Please enter some keywords to search");

    let res = await fetchJson(`${api}/movie/sinhalasub/search?text=${encodeURIComponent(q)}`);
    if (!res.result || res.result.data.length === 0) return reply(LANG ? "😢 කිසිවක් හමු නොවුණා!" : "😢 No results found!");

    let results = res.result.data.slice(0, 10);
    lastSearchResults[from] = { type: "search", data: results };

    let text = `📽️ *_Search Results for:_* ${q}\n\n`;
    results.forEach((item, i) => {
        text += `*${i + 1}.* ${item.title}\n`;
    });
    text += `\n🔢 Reply with a number (1-${results.length}) to get details.`;

    await conn.sendMessage(from, { text }, { quoted: mek });
});

conn.ev.on('messages.upsert', async (msgUpdate) => {
    const msg = msgUpdate.messages[0];
    if (!msg.message || !msg.key.remoteJid || !msg.message.conversation) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation.trim();
    const selectedNumber = parseInt(body);
    const context = lastSearchResults[from];

    if (!context || isNaN(selectedNumber)) return;

    if (context.type === "search" && selectedNumber >= 1 && selectedNumber <= context.data.length) {
        const selected = context.data[selectedNumber - 1];
        let movieRes = await fetchJson(`${api}/movie/sinhalasub/movie?url=${selected.link}`);
        if (!movieRes.result?.data) return;

        let data = movieRes.result.data;
        let caption = `🎬 *${data.title}*\n📅 ${data.date}\n🌍 ${data.country}\n⭐ TMDB: ${data.tmdbRate}\n🗳️ Votes: ${data.sinhalasubVote}\n🎬 Directed by: ${data.director}\n📁 Category: ${data.category.join(', ')}\n📝 Subtitle: ${data.subtitle_author}\n🔗 ${selected.link}\n\n🧾 ${data.description.split('\n')[0]}\n\n🎞️ *Choose a quality to download by replying with its number:*`;

        let i = 1;
        let text = caption + `\n\n📥 *PixelDrain:*\n`;
        const pixelList = data.pixeldrain_dl.map(dl => ({ i: i++, quality: dl.quality, size: dl.size, link: dl.link }));

        text += pixelList.map(dl => `${dl.i}. ${dl.quality} (${dl.size})`).join('\n');

        let j = i;
        text += `\n\n📥 *DDL:*\n`;
        const ddlList = data.ddl_dl.map(dl => ({ i: j++, quality: dl.quality, size: dl.size, link: dl.link }));

        text += ddlList.map(dl => `${dl.i}. ${dl.quality} (${dl.size})`).join('\n');

        lastSearchResults[from] = {
            type: "download",
            data: [...pixelList, ...ddlList]
        };

        await conn.sendMessage(from, {
            image: { url: data.images[0] },
            caption: text
        }, { quoted: msg });
    }

    if (context.type === "download") {
        const selectedQuality = context.data.find(dl => dl.i === selectedNumber);
        if (!selectedQuality) return;

        await conn.sendMessage(from, {
            document: { url: selectedQuality.link },
            mimetype: "video/mp4",
            fileName: "SinhalaSub-Movie.mp4",
            caption: "🎥 Powered by SENU-MD",
            contextInfo: {
                externalAdReply: {
                    title: "Download from SinhalaSub",
                    body: 'www.sinhalasub.lk',
                    mediaType: 1,
                    sourceUrl: selectedQuality.link,
                    thumbnailUrl: "https://i.ibb.co/1YPWpS3H/9882.jpg"
                }
            }
        }, { quoted: msg });

        delete lastSearchResults[from]; // Clear after download
    }
});
