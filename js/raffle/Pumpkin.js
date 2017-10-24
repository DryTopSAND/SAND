// includes
var fs = require('fs');
var https = require('https');

var id = 72271;		// pumpkin id
var users = {};		// the list of users found with entries into the raffle
var logItems = [];	// the list of entries into the raffle
var added = 0;		// new entries discovered on this run

var filename = 'log.json';		// the database of raffle entries, saved to the local filesystem.

load_data();		// loads log of previously saved entries
read_guild_data();	// calls the gw2 api and gets the latest info from the guild bank

/**
 * Calls the GW2 API and gets the latest info from the guild storage
 */
function read_guild_data()
{
	console.log('Fetching latest guild info from api');
	https.get('https://api.guildwars2.com/v2/guild/239F7382-9E2F-E511-A5A9-AC162DAE5A05/log?access_token=B2A35DED-9550-7044-9B1D-A0676E03384D3AD9486C-73ED-435F-9258-2FB2BA53F035', res => {
		res.setEncoding('utf8');
		var body = '';
		res.on('data', data => {
			body += data;
		});
		res.on('end', () => {
			body = JSON.parse(body);
			body.forEach(function(logItem) {
				
				// look for new entries into the raffle
				if (logItem.type == 'upgrade' && logItem.action == 'completed' && logItem.item_id == id) {
					
					// is this entry already logged?
					if (!log_exist(logItem))
					{
						logItems.push(logItem);
						added++;
					}
				}
			});
			parse_data();
		});
	});	
}

/**
 * Determines if a raffle entry has already been logged
 */
function log_exist(logItem)
{
	var logged = false;
	
	// TODO: optimize by keying from id
	logItems.forEach(function(existItem) {
		
		if (logItem.type == existItem.type &&
			logItem.item_id == existItem.item_id &&
			logItem.count == existItem.count &&
			logItem.action == existItem.action &&
			logItem.id == existItem.id &&
			//logItem.time == existItem.time &&		// times can change by ~1 sec during successive api calls, lolwut
													// ignore timestamp, go exclusively from deposit id above
			logItem.upgrade_id == existItem.upgrade_id)
		{
			logged = true;
		}
	});
	return logged;
}

/**
 * Called after the latest information has been fetched from the GW2 API
 */
function parse_data()
{
	// calculate totals for each user
	logItems.forEach(function(logItem) {
		var user = logItem.user;
		if (user in users)
			users[user]++;
		else
			users[user] = 1;
	});
	
	show_info();	// display info
	
	if (added > 0)
		save_data();	// write the latest version of the db
}

/**
 * Displays helpful information
 */
function show_info()
{
	if (added > 0)
		console.log('\nAdded ' + added + ' new entries!');
	
	console.log();
	
	// show totals for each user
	for (var user in users)
	{
		var deposits = users[user];
		console.log(user + ' = ' + deposits);
	}
	//console.log(logItems);
}

/**
 * Loads the list of previously discovered transactions
 * from a database on the filesystem
 */
function load_data()
{
	if (!fs.existsSync(filename)) return;

	console.log('Reading ' + filename);
	logItems = JSON.parse(fs.readFileSync(filename));
	console.log('Parsed ' + logItems.length + ' entries');
}

/**
 * Writes the latest version of the database
 * to the filesystem
 */
function save_data()
{
	var file = fs.createWriteStream(filename);
	var json = JSON.stringify(logItems);
	file.write(json);
	file.end();
}
