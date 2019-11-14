//@ts-check

const EventEmitter = require("events");
const fs           = require("fs");
const Discord      = require('discord.js');

// we need to define every event so we can add listeners to the discord.js client bot
const events = [
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'channelUpdate',
    'clientUserGuildSettingsUpdate',
    'clientUserSettingsUpdate',
    'debug',
    'disconnect',
    'emojiCreate',
    'emojiDelete',
    'emojiUpdate',
    'error',
    'guildBanAdd',
    'guildBanRemove',
    'guildCreate',
    'guildDelete',
    'guildIntegrationsUpdate',
    'guildMemberAdd',
    'guildMemberAvailable',
    'guildMemberRemove',
    'guildMembersChunk',
    'guildMemberSpeaking',
    'guildMemberUpdate',
    'guildUnavailable',
    'guildUpdate',
    // 'message', ignore this because we need our own
    'messageDelete',
    'messageDeleteBulk',
    'messageReactionAdd',
    'messageReactionRemove',
    'messageReactionRemoveAll',
    'messageUpdate',
    'presenceUpdate',
    'rateLimit',
    'ready',
    // module-ready // our own event fired once a bot has loaded a module, to signal when the module's bot property has been initialized
    'reconnecting',
    'resume',
    'roleCreate',
    'roleDelete',
    'roleUpdate',
    'typingStart',
    'typingStop',
    'userNoteUpdate',
    'userUpdate',
    'voiceStateUpdate',
    'warn',
    'webhookUpdate'
]

/**
 * The Module class, your module.exports should be this object
 */
class Module extends EventEmitter {
    /**
     * The Constructor
     * @param {string} name name of the command
     */
    constructor(name) {
        super();
        
        console.log("setting up module \"" + name + "\"");
        /**
         * The name of the module
         * @type {string} 
         */
        this.name = name;

        // /**
        //  * The event emitter for this object
        //  * @type {EventEmitter}
        //  */
        // this.eventEmitter = new EventEmitter();

        /**
         * The bot this module was loaded into
         * - **Caution!** only available once the module-ready event has been fired!
         * @type {Bot}
         */
        this.bot = undefined;

        // setup initialization
        this.once('module-init', (bot) => {
            this.bot = bot;
            this.emit('module-ready');
        });
    }

    // /**
    //  * Add your events here
    //  * @param {String} event The name of the event to watch for
    //  * @param {function(*):*} callback The function to run when the even is triggered
    //  */
    // on(event, callback) {
    //     // if (typeof event !== "string") {
    //     //     throw new Error("event is not a string!");
    //     // }
    //     callback.bind(this);
    //     super.on(event, callback)
    //     // this.eventEmitter.on(event, callback);
    // }

    // /**
    //  * Add your one-time events here
    //  * @param {String} event The name of the event to watch for
    //  * @param {function(*):*} callback The function to run when the even is triggered
    //  */
    // once(event, callback) {
    //     callback.bind(this);
    //     this.eventEmitter.once(event, callback);
    // }

    // /**
    //  * Called to emit an event
    //  * (tbh I should find a better way to pass arguments)
    //  * @param {string|symbol} event Event name
    //  * @param {...*} args Arguments
    //  */
    // emit(event, ...args) {
    //     this.eventEmitter.emit(event, ...args);
    // }

    /**
     * Add a command to the bot.
     * Basically just an alias for Module.on('command', {callback}),
     * with a check for name, and trims it out before calling the callback
     * @param {string} [command] The name of the command (what to look for)
     * @param {function(Discord.Message):*} callback The callback
     */
    addCommand(command, callback) {
        return this.on('command', (msg) => {
            if (!callback) {
                // need to ignore this in case command is not specified
                // but the linter throws a fit
                //@ts-ignore
                command(msg);
            }

            // check for name
            if (msg.content.startsWith(command)) {

                // remove the command from the start, and any spaces
                msg.content = msg.content.substring(command.length).trim();

                // run the callback
                callback(msg);
            }
        });
    }
}

/**
 * This is the class you create when you want to make a bot
 * If you want to access the discord.js bot, use {@link Bot.bot}.
 */
class Bot {
    /**
     * Bot Constructor
     * @param {(Discord.ClientOptions|Discord.Client|string)} [options] Either a discord.js bot you already defined or the arguments you would pass to a normal discord.js bot (or the path to the modules)
     * @param {string} [modulePath="./modules"] the path to the modules
     */
    constructor(options, modulePath="/modules") {
        /**
         * the discord.js bot this uses
         * @type {Discord.Client}
         */
        this.client = null;

        /**
         * The loaded modules
         * @type {Module[]}
         */ 
        this.modules = [];

        if (options !== undefined) {
            // check if options is a discord bot
            if (options instanceof Discord.Client) {
                this.client = options;
            // check if its the path
            } else if (typeof options == "string") {
                //@ts-ignore
                modulePath = options;
                this.client = new Discord.Client();

            // check if its an options object
            } else {
                this.client = new Discord.Client(options);
            } 
        } else {
            this.client = new Discord.Client();
        } 

        /**
         * The prefix for this bot
         * @type {string}
         */
        this.prefix = "!";

        // =============
        // add Listeners
        // =============

        // add 'command' and 'message' emitter
        this.client.on('message', msg => {
            // ignore this bot always (might change to ignore bots too)
            if (msg.author.id == this.user.id) return;
            
            // emit the message event
            this.emit('message', msg);

            // ignore self
            // check for prefix
            if (msg.content.startsWith(this.prefix)) {

                // remove the prefix
                msg.content = msg.content.substring(this.prefix.length);

                // and emit
                this.emit('command', msg);
            }
        }); 

        // loop through all events
        events.map(event => {
            // and add the listener to the discord.js bot
            this.client.on(event, (...args) => {
                this.emit(event, ...args);
            });
        });


        // add a simple listenter to the client, saying when its ready
        this.client.on('ready', () => {
            console.log(`Bot is ready with username ${this.user.username}`);
        });


        // might move this to a function so i can async and await it, so the 'ready' is more accurate
        // =============
        // load Modules
        // =============

        // check directory
        const dirExists = fs.existsSync(modulePath);
        
        // check if directory exists
        if (!dirExists) {
            // send an error message
            console.log(`Modules folder not found! (${modulePath})`);

            // dont bother loading anything
            return;
        }

        // read files
        const files = fs.readdirSync(modulePath);

        // loop through all files
        files.forEach(file => {
            const path = modulePath + "/" + file;
            const isDir = fs.lstatSync(path).isDirectory();

            // try/catch in case of faulty module
            try {
                // if the file is a directory, try loading a module.js file from it
                if (isDir) {
                    const innerPath = path + '/module.js';

                    try {z
                        if (fs.existsSync(innerPath)) {
                            // load the file
                            const mod = require(innerPath);

                            if (!mod.name) {
                                console.log(innerPath + ' is not a valid module! (did you forget module.exports?) ');
                                return;
                            }

                            // and load the mod
                            this.addModule(mod);
                        }
                    } catch (err) {
                        console.error("Error loading module \"" + innerPath + "\"", err);
                    }

                    // continue checking other files (would be continue but this is in a .forEach method)
                    return;
                }

                // check if it is a .js file, ignore otherwise
                if (!path.endsWith('.js')) return;

                // load the file
                const mod = require(path);

                if (!mod.name) {
                    console.log(path + ' is not a valid module! (did you forget module.exports?) ');
                    return;
                }

                this.addModule(mod);
            } catch (err) {
                // log the error
                console.error("Error loading module \"" + file + "\"", err);
            }
        });

    } // end constructor

    // =======================
    //        Getters
    // (in alphabetical order)
    // =======================

    get broadcasts() {
        return this.client.broadcasts;
    }

    get browser() {
        return this.client.browser;
    }

    /**
     * Returns all the channels the bot is in
     * @returns {Discord.Collection<Discord.Snowflake, Discord.Channel>} 
     */
    get channels() {
        return this.client.channels;
    }

    /**
     * All the emojis the bot can see
     * @returns {Discord.Collection<Discord.Snowflake, Discord.Emoji>}
     */
    get emojis() {
        return this.client.emojis;
    }

    /**
     * All the guilds the bot is in
     * @returns {Discord.Collection<Discord.Snowflake, Discord.Guild>} 
     */
    get guilds() {
        return this.client.guilds;
    }
 
    /**
     * The options used to create the bot
     * @returns {Discord.ClientOptions} 
     */
    get options() {
        return this.client.options;
    }

    /**
     * Average heartbeat ping of the websocket, obtained by averaging the Client#pings property
     * @returns {number}
     */
    get ping() {
        return this.client.ping;
    }

    /**
     * Previous heartbeat pings of the websocket (most recent first, limited to three elements)
     * @returns {Array<number>}
     */
    get pings() {
        return this.client.pings;
    }

    /**
     * the time the bot was ready
     * @returns {Date}
     */
    get readyAt() {
        return this.client.readyAt;
    }

    /**
     * the time the bot was ready
     * @returns {Number}
     */
    get readyTimestamp() {
        return this.client.readyTimestamp;
    }

    /**
     * The shard helpers for the client (only if the process was spawned as a child, such as from a ShardingManager)
     * @returns {Discord.ShardClientUtil}
     */
    get shard() {
        return this.client.shard;
    }

    /**
     * Current status of the client's connection to Discord
     * @returns {Discord.Status}
     */
    get status() {
        return this.client.status;
    }

    /**
     * How long it has been since the client last entered the [READY] state in milliseconds
     * @returns {number}
     */
    get uptime() {
        return this.client.uptime;
    }

    /**
     * Returns the current bot user
     * @returns {Discord.ClientUser}
     */
    get user() {
        return this.client.user;
    }

    /**
     * Returns all the users the bot knows
     * @returns {Discord.Collection<Discord.Snowflake, Discord.User>}
     */
    get users() {
        return this.client.users;
    }

    /**
     * All active voice connections that have been established, mapped by guild ID
     * @returns {Discord.Collection<Discord.Snowflake, Discord.VoiceConnection>}
     */
    get voiceConnections() {
        return this.client.voiceConnections;
    }


    // =======================
    //       Functions
    // (in alphabetical order)
    // =======================

    /**
     * add a module to this bot
     * @param {Module} botModule The module to add
     */
    addModule(botModule) {
        // since its already a module we dont need to worry about checking for errors,
        // just add it to the list
        this.modules.push(botModule);

        // set the module's bot property
        botModule.bot = this;

        // emit the module ready event
        botModule.emit('module-init', this);

        // log it loaded correctly
        console.log("Loaded " + botModule.name);
    }
    
    /**
     * Called to emit an event
     * (tbh I should find a better way to pass arguments)
     * @param {string} event Event name
     * @param {...*=} args Arguments
     */
    emit(event, ...args) {
        // loop through events
        this.modules.map((module) => {
            // catch issues so we dont crash if theres an issue
            try {
                // run the event in the module
                module.emit(event, ...args);
            } catch (err) {

                // log an error if any
                console.error(`Error running '${event}' in module '${module.name}':`, err);
            }
        });
    }

    /**
     * Adds an event to the bot ()
     * You should create a module for this instead
     * @param {string} event The event name
     * @param {function(*):*} callback The callback for the event
     */
    on(event, callback) {
        // if the event is not a ready event dont send a message
        if (event!=='ready') 
            console.log("It is recommended you use modules instead of directly adding events! (for event \"" + event +"\"");
        this.client.on(event, callback);
    }

    /**
     * login to discord
     * @param {string} token The token for the discord bot
     */
    login(token) {
        this.client.login(token);
    }

    /**
     * set the prefix for this bot
     * @param {string} prefix The prefix to set
     */
    setPrefix(prefix) {
        if (typeof prefix == 'string') {
            this.prefix = prefix;
        }  else {
            console.log("trying to set non-string as a prefix!");
        }
    }
}

/**
 * The DiscMod module
 * @module DiscMod
 */
module.exports = {
    Discord: Discord,
    Module: Module,
    Bot: Bot
};
