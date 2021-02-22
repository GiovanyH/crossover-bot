const fs = require("fs")
const { Client, MessageEmbed, Collection } = require("discord.js")
const client = new Client()
require('dotenv').config()

let config = {
    prefix: "c:"
}

let totalServers = []

let configuredServers = []

client.commands = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    console.log(command.name)
    client.commands.set(command.name, command)
}

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
            if (!client.commands.has(comando)) return

            try {
                client.commands.get(comando).execute(client, message, configuredServers, totalServers)
            } catch (error) {
                console.error(error)
                message.reply('Aconteceu um erro ao executar esse comando!');
            }
        }

        // parte de enviar pra todos fica aqui
        else if (configuredServers[message.guild.id] == message.channel.id && !message.author.bot) {
            for ( key in configuredServers) {
                const value = configuredServers[key]
                if (key != message.guild.id) {
                    const server = client.guilds.cache.get(key)
                    const channel = server.channels.cache.get(value)
                    const WebhooksFn = require('./WebhooksFn.js')
                    WebhooksFn.pegarHook(channel).then(async hook =>{
                        if (!hook) return;
                        const avatar = message.author.avatarURL()
                        const user = "<"+message.guild.name+"> "+message.author.username
                        await hook.send(message.content, {
                            username: user,
                            avatarURL: avatar,
                        });
                        
                    })

                }
            }
        }
})
client.login(process.env.TOKEN)
