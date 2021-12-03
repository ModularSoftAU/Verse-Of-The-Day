const { Discord, MessageEmbed } = require('discord.js');
const config = require('../config.json');
const database = require('../databaseController');

module.exports = {
    name: 'config',
    aliases: ['conf'],
    description: 'Configuration command.',
    category: 'Configuration',
    permissions: ['ADMINISTRATOR'],
    slash: true,
    guildOnly: true,
    testOnly: true,

    options: [
        {
            "name": "show",
            "description": "Show the current configuration.",
            "type": 1
        },
        {
            "name": "setvotdchannel",
            "description": "Set the VOTD Channel",
            "type": 1,
            "options": [
                {
                    "name": "votdchannel",
                    "description": "The channel to send the VOTD to.",
                    "type": 7,
                    "required": true
                }
            ]
        },
        {
            "name": "setversion",
            "description": "Set the Bible Version for the VOTD",
            "type": 1,
            "options": [
                {
                    "name": "version",
                    "description": "Version for the VOTD.",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "settime",
            "description": "Set Time to send VOTD daily.",
            "type": 1,
            "options": [
                {
                    "name": "hour",
                    "description": "The hour to set.",
                    "type": 10,
                    "required": true
                },
                {
                    "name": "minute",
                    "description": "The minute to set.",
                    "type": 10,
                    "required": true
                },
                {
                    "name": "timezone",
                    "name": "timezone",
                    "description": "The timezone to set.",
                    "type": 3,
                    "required": true
                }
            ]
        }
    ],
    
    callback: ({ client, interaction }) => {
        // 
        // /config show
        // 
        if (interaction.options.getSubcommand() === "show") {
            try {
                database.query (`SELECT * FROM config WHERE guildID=?;`, [interaction.guildId], function (error, results, fields) {
                    if (error) {
                      throw error;
                    } else {
                        let votdChannelDisplayName = interaction.guild.channels.cache.get(results[0].votdChannel);

                        const embed = new MessageEmbed()
                        .setTitle(`${interaction.guild.name}'s Configuration`)
                        .setColor(`${config.colours.info}`)
                        .addField(`VOTD Version`, `${results[0].votdVersion}`)

                        if (interaction.guild.channels.cache.get(results[0].votdChannel) == undefined) {
                            embed.addField(`VOTD Request Channel`, `\`Not Yet Set\``)
                        } else {
                            embed.addField(`VOTD Request Channel`, `${votdChannelDisplayName}`)
                        };

                        if (interaction.guild.channels.cache.get(results[0].votdTimeTimezone) == undefined) {
                            embed.addField(`VOTD Time(zone)`, `\`Not Yet Set\``)
                        } else {
                            embed.addField(`VOTD Time(zone)`, `${results[0].votdTimeHour}:${results[0].votdTimeMinute} (${results[0].votdTimeTimezone})`)
                        };
            
                        interaction.reply({
                            embeds: [embed],
                            ephemeral: true 
                        });
                        return
                    }
                });
                return
            } catch (error) {
                console.log(error);
                return   
            }
        }

        // 
        // /config setvotdchannel
        // 
        if (interaction.options.getSubcommand() === "setvotdchannel") {
            const votdChannelID = interaction.options.getChannel('votdchannel').id;
            const votdChannelDisplayName = interaction.options.getChannel('votdchannel').name;

            try {
                database.query (`SELECT * FROM config WHERE guildID=?; UPDATE config SET votdChannel=? WHERE guildID=?;`, [interaction.guildId, votdChannelID, interaction.guildId], function (error, results, fields) {
                    if (error) {
                      throw error;
                    } else {
                        const embed = new MessageEmbed()
                        .setTitle(`The VOTD channel has been set.`)
                        .setColor(`${config.colours.success}`)
                        .setDescription(`The channel where the VOTD will go has been set to \`${votdChannelDisplayName}\``)
            
                        interaction.reply({
                            embeds: [embed],
                            ephemeral: true 
                        });
                        return
                    }
                });
            } catch (error) {
                console.log(error);
                return   
            }
        }

        // 
        // /config setversion
        // 
        if (interaction.options.getSubcommand() === "setversion") {
            const votdVersion = interaction.options.getString('version');

            try {
                database.query (`SELECT * FROM config WHERE guildID=?; UPDATE config SET votdVersion=? WHERE guildID=?;`, [interaction.guildId, votdVersion, interaction.guildId], function (error, results, fields) {
                    if (error) {
                      throw error;
                    } else {
                        const embed = new MessageEmbed()
                        .setTitle(`The VOTD version has been set.`)
                        .setColor(`${config.colours.success}`)
                        .setDescription(`The VOTD version \`${votdVersion}\``)
            
                        interaction.reply({
                            embeds: [embed],
                            ephemeral: true 
                        });
                        return
                    }
                });
            } catch (error) {
                console.log(error);
                return   
            }
        }


        // 
        // /config settime
        // 
        if (interaction.options.getSubcommand() === "settime") {
            const votdHour = interaction.options.getNumber('hour');
            const votdMinute = interaction.options.getNumber('minute');
            const votdTimezone = interaction.options.getString('timezone');

            try {
                database.query (`SELECT * FROM config WHERE guildID=?; UPDATE config SET votdTimeHour=?, votdTimeMinute=?, votdTimeTimezone=? WHERE guildID=?;`, [interaction.guildId, votdHour, votdMinute, votdTimezone, interaction.guildId], function (error, results, fields) {
                    if (error) {
                      throw error;
                    } else {
                        const embed = new MessageEmbed()
                        .setTitle(`The VOTD Time has been set.`)
                        .setColor(`${config.colours.success}`)
                        .setDescription(`The VOTD daily post has been set to \`${votdHour}:${votdMinute} (${votdTimezone})\``)
            
                        interaction.reply({
                            embeds: [embed],
                            ephemeral: true 
                        });
                        return
                    }
                });                
            } catch (error) {
                console.log(error);
                return   
            }
        }
    },
}