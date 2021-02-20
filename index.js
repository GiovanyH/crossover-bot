const { Client, MessageEmbed } = require("discord.js");
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
                        // Fetch webhooks
                        pegarHook(message.channel).then(hook =>{
                            if (hook) return;
                            criarHook(message.channel)
                        })
                        
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
                    pegarHook(channel).then(async hook =>{
                        if (!hook) return;
                        const avatar = message.author.avatarURL()
                        const user = "<"+server.name+"> "+message.author.username
                        await hook.send(message.content, {
                            username: user,
                            avatarURL: avatar,
                        });
                        
                    })                     

                }
            }
        }
})

function criarHook(channel) {
    channel.createWebhook('crossover-bot', {
        avatar: 'https://i.pinimg.com/originals/d7/96/3b/d7963b33fec9c7eea90be6cc52bc0c06.png',
    })
    .then(async webhook => {
        const avatarBot = client.user.avatarURL()
        await webhook.send('eu sou o crossover', {
            username: 'ohayo',
            avatarURL: avatarBot,
        });
    })
    .catch(console.error);
}

function pegarHook(channel) {
    return channel.fetchWebhooks()
        .then(hooks => {
            // checa os webhooks pra achar o do crossover
            for (var value of hooks.values()) {
                if (value.name == "crossover-bot") { 
                    return new Promise((res) =>{res(value)})
                }
            }
            return new Promise((res) =>{res(null)})
        })
        .catch(console.error);
}
client.login(process.env.TOKEN);