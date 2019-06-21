const DiscMod = require("../../app");

const mod = new DiscMod.Module("Example");

mod.on("message", async (msg) => {
    msg.reply("you sent a message!");
});

mod.on("command", async (msg) => {
    if (msg.content == "ping") {
        await msg.reply("pong!");
    }
});

mod.addCommand("roll", (msg) => {
    const roll = (Math.random() * 100).toFixed(0);
    msg.channel.send("You rolled " + roll);
});


module.exports = mod;
