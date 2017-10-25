/**
 * Calendar.js
 * Handles the updating of the Google Calendar
 */
// includes
var fs = require('fs');
var google = require('googleapis');
var GoogleAuth = require('google-auth-library');
var MOTD = require('./MOTD');
var Parser = require('./Parser');
var readline = require('readline');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

var auth = null;
var oauth2Client = null;

var events = null;

// get the latest Guild MOTD from GW2 API
MOTD.motd.get_motd(function(motd) {
    console.log(motd);

    // parse the MOTD for events and times
    events = Parser.parser.parse(motd);
    if (events == null || events.length == 0) return;

    // events detected in MOTD
    console.log(events);

    // parse previous MOTDs for testing
    /* MOTD.motd.prev_motd.forEach(function(motd) {
        console.log(motd);
        events = Parser.parser.parse(motd);
        if (events != null && events.length > 0)
            console.log(events);
        console.log("\n=======================================\n");
    });*/

    // Load client secrets from a local file.
    fs.readFile('config/client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      authorize(JSON.parse(content), getCalendar);
    });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];

    auth = new GoogleAuth();
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Called after authenticating with Google Calendar
 * @param {Array} calendarEvents The list of events already on the calendar
 */
function processEvents(calendarEvents) {
    var newEvents = [];

    // foreach event in the motd
    events.forEach(function(event) {
        // does this event already exist on the calendar?
        var found = false;

        for (var i = 0; i < calendarEvents.length; i++) {
            var calendarEvent = calendarEvents[i];
            var startTime = calendarEvent.start.dateTime;

            // check if event already exists on calendar
            if (new Date(startTime).toISOString() == new Date(event.timestamp).toISOString()) {
                console.log('\nEvent already exists on calendar');
                found = true;
                break;
            }
        }

        // event not found on calendar yet... add it to the list of new events
        if (!found) {
            newEvents.push(event);
        }
    });

    // add any new events
    createEvents(newEvents);

    // possible todo:
    // the parser currently detects cancelled events,
    // but they are not automatically removed from the calendar yet...
    // i will be able to just remove any cancelled events for now.
}

/**
 * Posts the new events to the Google Calendar
 * @param {Array} events A list of new events to add to the calendar
 */
function createEvents(events) {
    // Refer to the Node.js quickstart on how to setup the environment:
    // https://developers.google.com/google-apps/calendar/quickstart/node
    // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
    // stored credentials.
    var calendar = google.calendar('v3');

    events.forEach(function(e) {
        console.log('\nAdding event ' + e.location);

        var event = {
            'summary': e.location,
            'start': {
                'dateTime': new Date(e.timestamp),
            },
            'end': {
                'dateTime': new Date(e.end_time),
            },
        };

        console.log(event);

        calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            resource: event,
        }, function(err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event created: %s', event.htmlLink);
        });
    });
}

/**
 * Gets the latest events on the user's primary calendar.
 */
function getCalendar() {
    var calendar = google.calendar('v3');

    var oneWeekAgo = new Date(new Date() - 7 * 24 * 3600 * 1000).toISOString();

    calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: oneWeekAgo,
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
    }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var events = response.items;

        processEvents(events);
    });
}
