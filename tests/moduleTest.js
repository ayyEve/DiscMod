const app = require("../app");
const Module = app.Module;


const mod = new Module("Test");

mod.on("message", (msg) => {
    console.log("test successful");
});

mod.emit("message", {});
