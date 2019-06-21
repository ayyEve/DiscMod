# DiscMod
DiscMod is a modular discord.js bot framework meant to streamline bot creation and command creation

I will be updating this page at some point, but for now if you want an example check out tests/testBot.js and tests/modules/exampleModule.js

# How to Use
Bot Creation:
It's super easy to create a discord bot with both discord.js and DiscMod  
Just import `discmod` and create a new `DiscMod.Bot`

Don't forget to set the prefix with `Bot.setPrefix("prefix")`  
And don't forget to `Bot.login("token")`!

Module Creation:  
Creating a module is easy too!  
import `discmod` like before, and create a new `DiscMod.Module`

Messages:  
You have 3 ways to interact with messages:  

`Module.on('message', callback)`:  
This event is triggered for every message, nice if you want to implement somethnig like xp.

`Module.on('command', callback)`:  
This event is triggered for messages that start with the bot's prefix. 
The prefix is removed from Message.content.

`Module.addCommand('commandName', callback)`:  
This works almost the same as `Module.on('command')` but instead also check for 'command'  
'command' is removed from Message.content, so you only get the arguments

Note:  
If you ever need the discord.js classes, you can find them under `DiscMod.Discord`, no need to import `discord.js`!  

# Examples
For this example we will use the simple ping command, and all ways to do it  

```js
// import discmod
const DiscMod = require('discmod');

// set the token
const token = "your token here";

// create the bot
const bot = new DiscMod.Bot();

// set the prefix (default is '!')
bot.setPrefix('-');

// and login
bot.login(token);


// now for the module stuff
// create a module and give it a name
// the name isn't important functionality wise,
// but it may help with debugging
const mod = new DiscMod.Module("pingExample");

// using Module.on('message', cb)
mod.on('message', (msg) => {
    // notice how we dont need to use the bot's prefix here
    if (msg.content.startsWith('!ping')) {
        msg.channel.send('Pong!');
    }
});

// using Module.on('command', cb)
mod.on('command', (msg) => {
    if (msg.content.startsWith('ping')) {
        msg.channel.send('Pong!');
    }
 });
 
 // using addCommand
 mod.addCommand('ping', (msg) => {
     msg.channel.send('Pong!');
 });
 
 // dont forget to add the module to the bot
 // you dont need to do this if you have the modules
 // in the /modules/ folder 
 // although right now you currently need to create the bot with 
 // `${__dirname}/modules` for that to work at the moment
 bot.addModule(mod);
 // and thats it!
``` 

# TODO
1. add examples and explanations here
2. add description and help properties to modules
3. finish adding Discord.Client functions to DiscMod.Bot
