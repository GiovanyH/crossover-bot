const { Client } = require("discord.js");
const client = new Client(); 
require('dotenv').config();


let config = {
    prefix: "c:"
}

let servers = {}

client.on("ready", async () =>  {
        console.log('conectado em ',Object.keys(client)," servers")
});

client.on("message", async message =>{
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const comando = args.shift().toLowerCase()
        if(message.content.indexOf(config.prefix) == 0) { 
        switch(comando){
            case "ping":
                const m = await message.channel.send("Ping?");
                console.log("ping")
                m.edit(`Pong! A Latência é ${m.createdTimestamp - message.createdTimestamp}ms.`);
                break;
        }
        }
})

client.login(process.env.TOKEN);