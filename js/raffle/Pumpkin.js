// includes
var fs = require('fs');
var https = require('https');

var id = 72271; // pumpkin id
var users = {}; // the list of users found with entries into the raffle
var logItems = []; // the list of entries into the raffle
var added = 0; // new entries discovered on this run

var filename = 'log.json'; // the database of raffle entries, saved to the local filesystem.

loadData(); // loads log of previously saved entries
readGuildData(); // calls the gw2 api and gets the latest info from the guild bank

/**
 * Calls the GW2 API and gets the latest info from the guild storage
 */
function readGuildData() {
    console.log('Fetching latest guild info from api');
    https.get('https://api.guildwars2.com/v2/guild/239F7382-9E2F-E511-A5A9-AC162DAE5A05/log?access_token=B2A35DED-9550-7044-9B1D-A0676E03384D3AD9486C-73ED-435F-9258-2FB2BA53F035', function(res) {
        res.setEncoding('utf8');
        var body = '';

        res.on('data', function(data) {
            body += data;
        });
        res.on('end', function() {
            body = JSON.parse(body);
            body.forEach(function(logItem) {
                // look for new entries into the raffle
                if (logItem.type == 'upgrade' && logItem.action == 'completed' && logItem.item_id == id) {
                    // is this entry already logged?
                    if (!logExist(logItem)) {
                        logItems.push(logItem);
                        added++;
                    }
                }
            });
            parseData();
        });
    });
}

/**
 * Determines if a raffle entry has already been logged
 * @param {Object} logItem The log item to check if already exists in log.json
 * @return {bool} True if raffle entry already exists, else false
 */
function logExist(logItem) {
    var logged = false;

    // TODO: optimize by keying from id
    logItems.forEach(function(existItem) {
        if (logItem.type == existItem.type &&
            logItem.item_id == existItem.item_id &&
            logItem.count == existItem.count &&
            logItem.action == existItem.action &&
            logItem.id == existItem.id &&
            // logItem.time == existItem.time && // times can change by ~1 sec during successive api calls, lolwut
            // ignore timestamp, go exclusively from deposit id above
            logItem.upgrade_id == existItem.upgrade_id) {
            logged = true;
        }
    });
    return logged;
}

/**
 * Called after the latest information has been fetched from the GW2 API
 */
function parseData() {
    // calculate totals for each user
    logItems.forEach(function(logItem) {
        var user = logItem.user;

        if (user in users) {
            users[user]++;
        } else {
            users[user] = 1;
        }
    });

    showInfo(); // display info

    if (added > 0) {
        saveData(); // write the latest version of the db
    }
}

/**
 * Displays helpful information
 */
function showInfo() {
    if (added > 0) {
        console.log('\nAdded ' + added + ' new entries!');
    }

    console.log();

    // show totals for each user
    for (var user in users) {
        if (users.hasOwnProperty(user)) {
            var deposits = users[user];

            console.log(user + ' = ' + deposits);
        }
    }
    // console.log(logItems);
}

/**
 * Loads the list of previously discovered transactions
 * from a database on the filesystem
 */
function loadData() {
    if (!fs.existsSync(filename)) return;

    console.log('Reading ' + filename);
    logItems = JSON.parse(fs.readFileSync(filename));
    console.log('Parsed ' + logItems.length + ' entries');
}

/**
 * Writes the latest version of the database
 * to the filesystem
 */
function saveData() {
    var file = fs.createWriteStream(filename);
    var json = JSON.stringify(logItems);

    file.write(json);
    file.end();
}
