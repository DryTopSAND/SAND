// includes
const https = require('https');
const discord = require('discord.js');
const moment = require('moment');

const dailies = 'https://api.guildwars2.com/v2/achievements/daily';
const dailies_tomorrow = 'https://api.guildwars2.com/v2/achievements/daily/tomorrow';
const achievements = 'https://api.guildwars2.com/v2/achievements?ids=';

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
                if (category == 'pve')
                {
                    var dailies = json[category];
                    get_achievement_info(url, dailies);
                    return;
                }
            }
        });
    });
}

function get_achievement_info(url, dailies)
{
    var ids = get_daily_ids(dailies);
    
    // fetch achievement info
    var achievement_url = achievements + ids;
    console.log('Fetching ' + achievement_url);
    
    https.get(achievement_url, res => {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', data => {
            body += data;
        });
        res.on('end', () => {
            var achievements = JSON.parse(body);
            process_dailies(url, dailies, achievements);
        });
    });
}

function process_dailies(url, dailies, achievements)
{
    var event_completer = 0;
    for (var idx in dailies)
    {
        var daily = dailies[idx];
        var achievement = achievements.find(i => i.id == daily.id);
        if (achievement.name.indexOf('Event Completer') != -1)
            event_completer++;
        if (daily.id == dryTopID)
        {
            post_discord(url, event_completer == 1);
            return;
        }
    }
}

function get_daily_ids(dailies)
{
    // build comma-delimited ids
    var ids = '';
    for (var idx in dailies)
    {
        var daily = dailies[idx];
        if (ids.length > 0)
            ids += ',';
        ids += daily.id;
    }
    return ids;
}

function post_discord(url, all)
{
    var channelID = '241058184905621504';     // SAND general

    var client = new discord.Client();
    
    console.log('Posting to Discord: ' + url);

    client.on('ready', () => {
      
      var message = '';
      
      if (url.includes('tomorrow'))
      {
          var tomorrow = moment().add(1, 'days');
          message = "Hey SAND, Dry Top will be a daily tomorrow on " + tomorrow.format('dddd, MMMM Do') + "!";
      }
      else
          message = "Hey SAND, Dry Top is on the list of dailies today!";
      
      if (!all)
          message += " (for those who don't own the expansions)";
      
      client.channels.get(channelID).send(message).then(function() {
        process.exit();  
      });
      
    });
    client.login('enter discord bot token here');
}
