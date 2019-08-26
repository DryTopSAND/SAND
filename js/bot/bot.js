// includes
const https = require('https');
const discord = require('discord.js');
const moment = require('moment');

const dailies = 'https://api.guildwars2.com/v2/achievements/daily';
const dailies_tomorrow = 'https://api.guildwars2.com/v2/achievements/daily/tomorrow';

const dryTopID = 1955;

check_dailies(dailies);
check_dailies(dailies_tomorrow);

function check_dailies(url)
{
    console.log('Fetching ' + url);
    
    https.get(url, res => {
        
        res.setEncoding('utf8');
        var body = '';
        res.on('data', data => {
            body += data;
        });
        res.on('end', () => {
            var json = JSON.parse(body);
            for (var category in json)
            {
                if (category != 'pve') continue;
                var dailies = json[category];
                for (var idx in dailies)
                {
                    var daily = dailies[idx];
                    if (daily.id == dryTopID)
                        post_discord(url);
                }
            }
        });
    });
}

function post_discord(url)
{
    var channelID = '241058184905621504';   // SAND general

    var client = new discord.Client();

    client.on('ready', () => {
      
      var message = '';
      
      if (url.includes('tomorrow'))
      {
          var tomorrow = moment().add(1, 'days');
          message = "Hey SAND, Dry Top will be a daily tomorrow on " + tomorrow.format('dddd, MMMM Do') + "!";
      }
      else
          message = "Hey SAND, Dry Top is on the list of dailies today!";
      
      client.channels.get(channelID).send(message).then(function() {
        process.exit();  
      });
      
    });
    client.login('enter discord bot token here');
}
