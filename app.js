require('dotenv').config();
const Discord = require('discord.js');
const request = require('request');
const package = require('./package.json');
const config = require('./config.json');
const fetch = require('node-fetch');
const cron = require('node-cron');
const client = new Discord.Client({disableEveryone: true});

client.on('ready', async () => {
  console.log(`\nYouVersion Verse Of The Day\n Created By: ` + package.author + `\n GitHub Repository: ` + package.homepage + `\n`);
});

//
// Get the day of year that YouVersion should display
//
function getDayOfYear() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  var oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

//
// Get today's full date [Tuesday 11 June 2019]
//
function getFullDate() {
  var date = new Date();
  var dayofweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var day = String(date.getDate()).padStart(2, '0');
  var monthofyear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var month = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var year = date.getFullYear();

  date = dayofweek[date.getDay()] + " " + day + " " + monthofyear[date.getMonth()] + " " + year;
  return date;
}

//
// The main code that runs once a day at a configured time.
//
cron.schedule(`${config.minute} ${config.hour} * * *`, () => {
  broadcastVerseOfTheDay();
}, {
  scheduled: true,
  timezone: "Australia/Sydney"
});

function broadcastVerseOfTheDay() {
  fetch(`https://developers.youversionapi.com/1.0/verse_of_the_day/${getDayOfYear()}?version_id=206`, {
    headers: {
        'X-YouVersion-Developer-Token': `${process.env.youversiontoken}`,
        'Accept-Language': 'en',
        Accept: 'application/json',
    }
  }).then((result, client) => result.json()).then((json) => {
    let embed = new Discord.MessageEmbed()
      .setTitle(`Verse Of The Day`)
      .setColor('#ffff66')
      .setDescription(json.verse.text)
      .setFooter(json.verse.human_reference + ' // ' + getFullDate())

      var guildList = client.guilds.cache.array();
      try {
        guildList.forEach(guild => {
          let sendchannel = guild.channels.cache.find(channel => channel.name === config.messagechannel);
          if (!sendchannel) return;
          sendchannel.send(embed);
        });
        console.log(`[CONSOLE] Sent Verse of the Day to ${guild.name}.`);
      } catch (err) {
        console.log(`[ERROR] The Verse Of The Day could not be reached to some guilds.`);
      };
  });
}

// 
// Debug Mode
// 
// Run task every minute if debug is true.
if (config.debug == true) {
  cron.schedule(`* * * * *`, () => {
    broadcastVerseOfTheDay();
  });
}

client.login(process.env.discordtoken);
