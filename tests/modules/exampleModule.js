const DiscMod = require("../../app");

const mod = new DiscMod.Module("Example");

mod.on("message", async (msg) => {
    if (msg.content == "!ping") {
        await msg.reply("pong!");
    }
});


module.exports = mod;
