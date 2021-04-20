const { Client, MessageEmbed } = require('discord.js');
const {token, prefix, ticket_start_message, emoji, support_team_role, ticket_caotgory_ID, ping_support_team, main_color} = require('./config.json');
const client = new Client({partials: ["CHANNEL", "REACTION", "MESSAGE"]});
const channels = new Set();
const map = new Map();
client.on("ready", () => {
    console.log("Ready!");
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLocaleLowerCase();

    

    if (command === 'start-tickets') {
      //  console.log('sm')
        message.channel.send(ticket_start_message).then((m) => {
            m.react(emoji).then(() => {
                client.on("messageReactionAdd", async(reaction, user) => {
                    if (reaction.message.partial) await reaction.message.fetch();
                    if (reaction.partial) await reaction.fetch();
                    if (user.bot) return;
                    if (!reaction.message.guild) return;

                    if (reaction.message.channel.id == message.channel.id) {
                        if (reaction.emoji.name === emoji) {
                            if (map.has(user.id)) return reaction.message.channel.send(`<@${user.id}> You already have a ticket open! In <#${map.get(user.id).channel}>`).then(msg => msg.delete({timeout: "5000"}));
                            reaction.message.guild.channels.create(`${user.username}-ticket`, {
                                type: 'text',
                                parent: ticket_caotgory_ID,
                                permissionOverwrites: [{
                                    id: user.id,
                                    allow: ['VIEW_CHANNEL', "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                                }, {
                                    id: reaction.message.guild.roles.cache.find(role => role.name === '@everyone').id,
                                    deny: ['SEND_MESSAGES', "VIEW_CHANNEL"]
                                }, {
                                    id: support_team_role,
                                    allow: ['SEND_MESSAGES', "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]
                                }]
                            }).then(c => {
                                map.set(user.id, {
                                    channel: c.id
                                })
                                channels.add(c.id);
                                const openTicket = new MessageEmbed()
                                .setColor(main_color)
                                .setDescription(`New ticket opned by <@${user.id}>`)
                                c.send(ping_support_team === true ? `<@&${support_team_role}> New Ticket` : "New Ticket",openTicket).then(() => {
                                    c.send(`<@${user.id}>`).then(mm => mm.delete({timeout: '1'}));
                                })
                            })
                        }
                    }
                })
            })
        })
    }
    if (command === 'close') {
     //   console.log(1)
        if (channels.has(message.channel.id)) {
        if (map.has(message.author.id)) {
           
                message.channel.send('Deleting ticket..').then(() => {
                    message.channel.delete().then(() => {
                        map.delete(message.author.id)
                        channels.delete(message.channel.id);
                    })
                })
            } else {
                return message.channel.send("Only the ticket owner can delete the ticket");
            }
        } 
    }

    if (command === 'add') {
        if (!channels.has(message.channel.id)) return console.log('ca')
        if (!message.member.roles.cache.has(support_team_role)) return message.reply('Only the support team can use this command.');
      const userAdd = args[0];
      
      if (message.guild.roles.cache.get(userAdd)) {
        message.channel.updateOverwrite(userAdd, {
            SEND_MESSAGES: true,
            READ_MESSAGE_HISTORY: true,
            VIEW_CHANNEL: true
        })
        message.channel.send(`I have added the **${message.guild.roles.cache.get(userAdd).name}** to the channel`)
      } else {
          if(message.guild.members.cache.get(userAdd)) {
            message.channel.createOverwrite(userAdd, {
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
                VIEW_CHANNEL: true
            })
            message.channel.send(`I have added **${message.guild.members.cache.get(userAdd).user.username}** to the channel`)
          }
      }
    }

    if (command === 'remove') {
    
        if (!channels.has(message.channel.id)) return console.log('ca')
        if (!message.member.roles.cache.has(support_team_role)) return message.reply('Only the support team can use this command.');
      const userAdd = args[0];
      
      if (message.guild.roles.cache.get(userAdd)) {
        message.channel.updateOverwrite(userAdd, {
            SEND_MESSAGES: false,
            READ_MESSAGE_HISTORY: false,
            VIEW_CHANNEL: false
        })
        message.channel.send(`I have removed the **${message.guild.roles.cache.get(userAdd).name}** to the channel`)
      } else {
          if(message.guild.members.cache.get(userAdd)) {
            message.channel.createOverwrite(userAdd, {
                SEND_MESSAGES: false,
                READ_MESSAGE_HISTORY: false,
                VIEW_CHANNEL: false
            })
            message.channel.send(`I have removed **${message.guild.members.cache.get(userAdd).user.username}** from the channel`)
          }
      }

    }

    if (command === 'help') {
        const helpEmbed = new MessageEmbed()
        .setColor(main_color)
        .setDescription('Help Menu')
        .addField("Commands", '`start-tickets` `close` `add` `remove` `id` `help`')
        .setFooter("Ticket bot!")

        message.channel.send(helpEmbed)
    }

    if (command === 'rename') {
        if (!channels.has(message.channel.id)) return;
        if (message.member.roles.cache.has(support_team_role)) {
            if (!args.length) return message.channel.send('No name was given')
            message.channel.setName(args.join(" "))
            message.channel.send(`Renamed the ticket to: ${args.join(" ")}`)
        }
    }

    if (command === 'id') {
        const { MessageEmbed } = require('discord.js')
      //  const prefix = message.guild.commandPrefix
        const user = message.mentions.users.last();
        const role = message.mentions.roles.first();
        const channel = message.mentions.channels.first();
        if (!role && !channel && !user) return message.channel.send('You did not mention any role/channel/user')
        if (role) {
            message.channel.send(`${role.name} ID is: ${role.id}`)
        } else {
            if (channel) {
                message.channel.send(`${channel.name} ID is: ${channel.id}`)
            } else {
                if (user) {
                    message.channel.send(user.tag + ' ID is: ' + user.id)
                }
            }
        }
    }
    
})
 
client.login(token);