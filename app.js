//@ts-check

const EventEmitter = require("events");
const Fs           = require("fs");
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
    'message',
    'messageDelete',
    'messageDeleteBulk',
    'messageReactionAdd',
    'messageReactionRemove',
    'messageReactionRemoveAll',
    'messageUpdate',
    'presenceUpdate',
    'rateLimit',
    'ready',
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
class Module { // extends EventEmitter
    /**
     * The Constructor
     * @param {string} name name of the command
     */
    constructor(name) {
        console.log("setting up module \"" + name + "\"");
        /**
         * The name of the module
         * @type {string} 
         */
        this.name = name;

        /**
         * The event emitter for this object
         * @type {EventEmitter}
         */
        this.eventEmitter = new EventEmitter();
    }

    /**
     * Add your events here
     * @param {String} event 
     * @param {function(*):*} callback 
     */
    on(event, callback) {
        // if (typeof event !== "string") {
        //     throw new Error("event is not a string!");
        // }
        this.eventEmitter.on(event, callback);
    }

    /**
     * Called to emit an event
     * (tbh I should find a better way to pass arguments)
     * @param {string} event Event name
     * @param {...*=} args Arguments
     */
    emit(event, ...args) {
        this.eventEmitter.emit(event, ...args);
    }
}

/**
 * This is the class you create when you want to make a bot
 * If you want to access the discord.js bot, use {@link Bot.bot}
 */
class Bot {
    /**
     * Bot Constructor
     * @param {(Discord.ClientOptions|Discord.Client)} options Either a discord.js bot you already defined or the arguments you would pass to a normal discord.js bot
     * @param {string} [modulePath="./modules"] the path to the modules
     */
    constructor (options, modulePath=__dirname+"/modules") {
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

        // check if options is a discord bot
        if (options instanceof Discord.Client) {
            this.client = options;
        } else {
            this.client = new Discord.Client(options);
        }

        // =============
        // load Modules
        // =============

        // check directory
        const dirExists = Fs.existsSync(modulePath);

        // check if directory exists
        if (!dirExists) {
            // throw an error if it doesnt, no point in continuing if folders dont even exist
            throw new Error("Path to modules does not exist! (" + modulePath + ")");
        }

        const files = Fs.readdirSync(modulePath);

        // loop through all files
        for (let i = 0; i < files.length; i++) {
            
            // define file
            const file = files[i];

            // catch in case of faulty module
            try {
                // load the file
                const mod = require(modulePath + "/" + file);

                // add it to the list
                this.modules.push(mod);

                // log it loaded correctly
                console.log("Loaded " + mod.name);
            } catch (err) {

                // log the error
                console.error("Error loading module \"" + file + "\"", err);
            }
        } // end for i


        // =============
        // add Listeners
        // =============

        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            this.client.on(event, (a0, a1, a2, a3, a4, a5, a6) => {
                this.emit(event, a0, a1, a2, a3, a4, a5, a6);
            });
        }

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
     * @param {Module} module The module to add
     */
    addModule (module) {
        // since its already a module we dont need to worry about checking for errors,
        // just add it to the list
        this.modules.push(module);

        // log it loaded correctly
        console.log("Loaded " + module.name);
    }
    
    /**
     * Called to emit an event
     * (tbh I should find a better way to pass arguments)
     * @param {string} event Event name
     * @param {...*=} args Arguments
     */
    emit (event, ...args) {
        // loop through events
        this.modules.map((module) => {
            // catch issues so we dont crash if theres an issue
            try {
                // run the event in the module
                module.emit(event, ...args);
            } catch (err) {

                // log an error if any
                console.error("Error running '" + event + "' in module '" + module.name + "': ", err);
            }
        });
    }

    /**
     * Adds an event to the bot ()
     * You should create a module for this instead
     * @param {string} event The event name
     * @param {function(*):*} callback The callback for the event
     */
    on (event, callback) {
        console.log("It is recommended you use modules instead of directly adding events! (for event \"" + event +"\"");
        this.client.on(event, callback);
    }

    /**
     * login to discord
     * @param {string} token The token for the discord bot
     */
    login (token) {
        this.client.login(token);
    }
}

/**
 * The DiscMod module
 * @module DiscMod
 */
module.exports = Discord;
module.exports.Module = Module;
module.exports.Bot = Bot;