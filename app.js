const Discord = require('discord.js');
// const config = require('./config.json');
const request = require('request');
const package = require('./package.json');
const chalk = require('chalk');
const fetch = require('node-fetch');
const cron = require('node-cron');
const client = new Discord.Client({disableEveryone: true});

client.on('ready', async () => {
  console.log(chalk.yellow(`\nYouVersion Verse Of The Day\n`) + chalk.green('Created By: ') + package.author + '\n' + chalk.green('GitHub Repository: ') + package.homepage + '\n');

  let pluralnonpluralservers = (client.guilds.size > 1) ? 'Servers' : 'Server';
  let pluralnonpluralusers = (client.users.size > 1) ? 'Users' : 'User';
  setActivity(); setInterval(setActivity, 60000);

  function setActivity() {
    // Sets Activity in a rotation
    const Gameinfo = [`Using ${(((process.memoryUsage().heapUsed)/1024)/1024).toFixed(0)}MBs of RAM`, 'Developer: shadowolf#9212', `Running on ${client.guilds.size} ${pluralnonpluralservers}`, `Running for ${client.users.size} ${pluralnonpluralusers}`, `Running daily at ${process.env.hour || config.hour}:${process.env.minute || config.minute}`];
    var info = Gameinfo[Math.floor(Math.random() * Gameinfo.length)];

    client.user.setActivity(info);
    console.log(chalk.yellow('[Console]') + ` Activity set to (${info})`);
  }
});

//
// Get the day of year that YouVersion should display
//
function getDayOfYear() {
  var now = new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"});
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  var oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

//
// Get today's full date [Tueday 11 June 2019]
//
function getFullDate() {
  var date = new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"});
  var dayofweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var day = date.getUTCDay();
  var monthofyear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var year = date.getUTCFullYear();
  return dayofweek[date.getDay()] + ' ' + day + ', ' + monthofyear[date.getMonth()] + ' ' + year;
}

//
// The main code that runs once a day at a configured time.
//
cron.schedule(`${process.env.minute || config.minute} ${process.env.hour || config.hour} * * *`, () => {
  fetch(`https://developers.youversionapi.com/1.0/verse_of_the_day/${getDayOfYear()}?version_id=206`, {
    headers: {
        'X-YouVersion-Developer-Token': `${process.env.youversiontoken || config.youversiontoken}`,
        'Accept-Language': 'en',
        Accept: 'application/json',
    }
  }).then((result) => result.json()).then((json) => {
    let embed = new Discord.RichEmbed()
      .setTitle(`Verse Of The Day`)
      .setColor('#ffff66')
      .setDescription(json.verse.text)
      .setFooter(json.verse.human_reference + ' // ' + getFullDate())


      var guildList = client.guilds.array();
      try {
        guildList.forEach(guild => {
          let sendchannel = guild.channels.find(channel => channel.name === process.env.messagechannel);
          if (!sendchannel) return;
          sendchannel.send(embed);
        })
        // guild.defaultChannel.send("messageToSend"));
      } catch (err) {
        console.log("Could not send message to " + guild.name);
      };

    // TODO: The channel name defination doesn't use both the process and the config.
    // || config.messagechannel
    // let sendchannel = client.channels.find(channel => channel.name === process.env.messagechannel);
    // if (!sendchannel) return;
    // sendchannel.send(embed);
  });
}, {
  timezone: "Australia/Sydney"
});

client.login(process.env.discordtoken || config.discordtoken);
