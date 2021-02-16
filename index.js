const { Client } = require("discord.js");
const client = new Client(); 
require('dotenv').config();

let config = {
    prefix: "c:"
}

let totalServers = []

let configuredServers = []

client.on("ready", async () =>  {
    var getGuilds = new Promise((resolve,reject)=>{
        let servers = []
        client.guilds.cache.forEach((guild) => {
            servers.push(guild)
        })//.join("\n")
        resolve(servers)
    })
    getGuilds.then(async (resp)=>{
        totalServers = resp
        console.log('conectado em ',resp.length," servers")
    })
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

                case "servers":
                    let names = []
                    for ( guild in totalServers ) {
                        names.push(totalServers[guild].name)
                    }
                    message.channel.send("Servers: "+names)
                    break; 

                case "connect":
                    if(!configuredServers[message.guild.id]) {
                        configuredServers[message.guild.id] = message.channel.id
                        await message.channel.send("este chat foi conectado com o crossover")
                    } else {
                        await message.channel.send("este chat já está no crossover '-' ")
                    }
                break;

            }
        }

        // parte de enviar pra todos fica aqui
        else if (configuredServers[message.guild.id] == message.channel.id && !message.author.bot) {
            for ( key in configuredServers) {
                const value = configuredServers[key]
                if (key != message.guild.id) {
                    const server = client.guilds.cache.get(key)
                    const channel = server.channels.cache.get(value)
                    await channel.send(message.author.username+": "+message.content)

                }
            }
        }
})

client.login(process.env.TOKEN);