/**
 * Parser.js
 * Handles the parsing of messages from the Guild MOTD
 */
// includes
var fs = require('fs');

eval(fs.readFileSync('Event.js')+'');

// test message:

// Website: drytopsand.com
// Twitter: @DryTopSAND
// Discord: Ask for a server link from an officer or Moon! <3\
//
// ===Guild Missions===
// Sunday: 2:15 pm PDT
// Monday: 7:15 pm PDT
//
// ===Dry Top===
// We are BACK! We\'re going to say hello to our SANDie roots in Dry Top on Sunday the 8th, starting 1 hour after reset at 6 pm PDT!
// I hope to see you folks out there! <3 Scheduling is still a bit tough for me right now. Expect us to do events in the new maps soon, too!
//
// ===Recruitment===
// Our guild Recruitment is currently closed! This is to allow new and old members to settle in and get to know each other. A purge is taking place for inactive accounts. Family and close friends of current SAND members are an exception

/**
 * Parser contains all of the events found in the message
 */
var Parser = function() {
    this.current_header = null; // a location found in a ===Header=== section

    this.locations = ['Dry Top', 'Verdant Brink', 'Auric Basin', 'Tangled Depths', 'Dragon\'s Stand', 'Dragons Stand', 'Achievement Run', 'Guild Meeting'];

    this.header_partials = ['Party'];

    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.events = []; // a list of Event objects that were parsed
};

/**
 * Parses the individual sentences from a string
 * @param {String} text A string to split by newline \n chars
 * @return {Array} The individual sentences
 */
Parser.prototype.get_sentences = function(text) {
    var sentences = text.split('\n');

    return sentences;
};

/**
 * Parses the entire MOTD for events
 * @param {String} text A string to split into sentences and parse for events
 * @return {Array} A list of events found
 */
Parser.prototype.parse = function(text) {
    this.events = [];
    this.current_header = null;

    var sentences = parser.get_sentences(text);

    sentences.forEach(function(sentence) {
        // console.log(sentence);
        parser.parse_sentence(sentence);
    });

    return this.events;
};

/**
 * Parses a string for events and times
 * @param {String} text An individual sentence for parse for events
 */
Parser.prototype.parse_sentence = function(text) {
    // parse ===Section Headers===
    var header = this.parse_header(text);

    if (header != null) this.current_header = header;

    // try to parse the zone names
    location = this.parse_event(text);
    if (location == null) location = this.current_header;
    if (location == null) return;

    // if zone name found, try to parse date / time
    var day = this.parse_day(text);
    var month = this.parse_month(text);
    var dayOfMonth = this.parse_day_month(text);
    var times = this.parse_time(text);

    if ((day == null && dayOfMonth == null) || times.length == 0 || this.get_cancelled(text)) return;

    /* console.log("Detected event: " + location);
    if (day != null) console.log("Detected day of week: " + day);
    if (month != null) console.log("Detected month: " + month);
    if (dayOfMonth != null) console.log("Detected day of month: " + dayOfMonth);
    if (times != null) console.log("Detected time: " + times);*/

    times.forEach(function(time) {
        var timestamp = parser.get_timestamp(day, month, dayOfMonth, time);

        // console.log("Timestamp: " + timestamp);

        // create a new event object
        var event = new Event();

        event.location = location;
        event.day_of_week = day;
        event.month = month;
        event.year = new Date().getFullYear(); // use current year?
        event.day_of_month = dayOfMonth;
        event.start_time = time;
        event.end_time = parser.get_end_time(timestamp);
        event.timestamp = timestamp;

        parser.events.push(event);
    });
};

/**
 * Parses ===Section Headers===
 * @param {String} text The section header to parse for event locations
 * @return {String} the section header if a match was found, or null if none
 */
Parser.prototype.parse_header = function(text) {
    if (text.indexOf('==') == -1) return null;

    var regex = /={2,}([^=]+)/;
    var matches = text.match(regex);

    if (matches == null) return null;

    // is this header a known zone/location?
    var header = matches[1];

    if (this.locations.indexOf(header) !== -1) {
        return header;
    }

    // check for partial matches in header location
    for (var i = 0; i < this.header_partials.length; i++) {
        var partial = this.header_partials[i];

        if (header.indexOf(partial) !== -1) {
            return header;
        }
    }
    return null;
};

/**
 * Parses a string for events
 * @param {String} text The string to look for event locations
 * @return {String} The name of the location if found, or null
 */
Parser.prototype.parse_event = function(text) {
    var found = null;

    this.locations.forEach(function(event) {
        if (text.indexOf(event) !== -1) {
            // console.log("Detected event: " + event);
            found = event;
        }
    });

    return found;
};

/**
 * Parses the day of the wee
 * @param {String} text The string to parse for days of the week
 * @return {String} The day of the week if found, or null
 */
Parser.prototype.parse_day = function(text) {
    var found = null;

    this.days.forEach(function(day) {
        if (text.indexOf(day) !== -1) {
            // console.log("Detected day of week: " + day);
            found = day;
        }
    });

    return found;
};

/**
 * Parses a possible month
 * @param {String} text The string to parse for month names
 * @return {String} The name of the month if found, or null
 */
Parser.prototype.parse_month = function(text) {
    var found = null;

    this.months.forEach(function(month) {
        if (text.indexOf(month) !== -1) {
            // console.log("Detected month: " + month);
            found = month;
        }
    });

    if (found == null) {
        // default to current month
        found = this.get_current_month();
    }

    return found;
};

/**
 * Gets the full name of the current month
 * @return {String} The full name of the current month
 */
Parser.prototype.get_current_month = function() {
    var today = new Date();

    return this.months[today.getMonth()];
};

/**
 * Parses the day of the month
 * @param {String} text Parses a day of the month, ie. 1st 2nd 3rd
 * @return {String} The day of the month if found, or null
 */
Parser.prototype.parse_day_month = function(text) {
    var regex = /([0-9]{1,2})(st|nd|rd|th)/;
    var found = text.match(regex);

    if (found !== null) {
        // console.log("Detected day of month: " + found[1]);
        return found[1];
    }
    return null;
};

/**
 * Parses a string for start/end times
 * @param {String} text Parses a time, ie. 6 pm, or time range, ie. 6 - 8 pm
 * @return {Array} The list of times found
 */
Parser.prototype.parse_time = function(text) {
    var times = [];
    var startIdx = 0;

    // search for # - # (am|pm) ranges
    var foundTime = false;

    do {
        foundTime = false;
        var regex = /([0-9]+) - ([0-9]+) (am|pm)/i;

        found = text.match(regex);
        if (found != null) {
            startIdx = text.indexOf(found[0]) + found[0].length;
            var startTime = found[1];
            // var endTime = found[2];
            var amOrPm = found[3];
            var time = startTime + ':00 ' + amOrPm;

            times.push(time);
            foundTime = true;
        } else {
            regex = /([0-9]+)(:[0-9]+)* (am|pm)/i;
            found = text.match(regex);
            if (found != null) {
                var time = found[0];

                startIdx = text.indexOf(found[0]) + found[0].length;

                // add :00 if no suffix
                if (time.indexOf(':') == -1) {
                    // var idx = time.indexOf(' ');

                    time = found[1] + ':00 ' + found[3];
                }

                times.push(time);
                foundTime = true;
            }
        }

        text = text.substring(startIdx);
    }
    while (foundTime);

    return times;
};

/**
 * Returns a Date object representing
 * the start date/time for the event
 * @param {String} day The day of the week, ie. Monday
 * @param {String} month The name of the mont, ie. September
 * @param {int} dayMonth The day of the month, 1-31
 * @param {String} time The time of the event, ie. 6 pm
 * @return {Date} A Date timestamp object representing the time
 */
Parser.prototype.get_timestamp = function(day, month, dayMonth, time) {
    var currentTime = new Date();
    var year = currentTime.getFullYear();

    var timeStr = day + ', ' + month + ' ' + dayMonth + ' ' + year + ' @ ' + time + ' PDT'; // todo: differentiate between PDT/PST
    // console.log("timeStr: " + timeStr);
    var timestamp = Date.parse(timeStr);

    return timestamp;
};

/**
 * Defaults to 2 hours after start time
 * @param {int} startTime A time in unix timestamp format
 * @return {int} A time in unix timestamp format 2 hours after the start time
 */
Parser.prototype.get_end_time = function(startTime) {
    var endTime = startTime + (2*60*60*1000);

    return endTime;
};

/**
 * Checks for cancelled events
 * @param {String} text A string to search for cancellation notice
 * @return {bool} true if event is cancelled, else false
 */
Parser.prototype.get_cancelled = function(text) {
    text = text.toLowerCase();
    if (text.indexOf('cancelled') != -1 || text.indexOf('canceled') != -1) { // misspelling found in previous motd
        return true;
    }
    return false;
};

var parser = new Parser();
// parser.parse(msg);

module.exports.parser = parser;
