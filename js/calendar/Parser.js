/**
 * Parser.js
 * Handles the parsing of messages from the Guild MOTD
 */
// includes
var fs = require('fs');
eval(fs.readFileSync('Event.js')+'');

// test message
var msg = "Website: drytopsand.com\nTwitter: @DryTopSAND\nDiscord: Ask for a server link from an officer or Moon! <3\n\n===Guild Missions===\nSunday: 2:15 pm PDT\nMonday: 7:15 pm PDT\n\n===Dry Top===\nWe are BACK! We're going to say hello to our SANDie roots in Dry Top on Sunday the 8th, starting 1 hour after reset at 6 pm PDT! I hope to see you folks out there! <3 Scheduling is still a bit tough for me right now. Expect us to do events in the new maps soon, too!\n\n===Recruitment===\nOur guild Recruitment is currently closed! This is to allow new and old members to settle in and get to know each other. A purge is taking place for inactive accounts. Family and close friends of current SAND members are an exception.";

/**
 * Parser contains all of the events found in the message
 */
var Parser = function()
{
	this.current_header = null;	// a location found in a ===Header=== section

	this.locations = ["Dry Top", "Verdant Brink", "Auric Basin", "Tangled Depths", "Dragon's Stand", "Dragons Stand", "Achievement Run"];
	
	this.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
	this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	this.events = [];	// a list of Event objects that were parsed
};

/**
 * Returns the individual sentences from a string
 */
Parser.prototype.get_sentences = function(text)
{
	var sentences = text.split("\n");
	
	return sentences;
}

/**
 * Splits a string up into individual sentences
 */
Parser.prototype.parse = function(text)
{
	this.events = [];
	this.current_header = null;
	
	var sentences = parser.get_sentences(text);
	
	sentences.forEach(function(sentence) {

		//console.log(sentence);
		parser.parse_sentence(sentence);
	});
	
	return this.events;
};

/**
 * Parses a string for events and times
 */
Parser.prototype.parse_sentence = function(text)
{
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
	var day_month = this.parse_day_month(text);
	var times = this.parse_time(text);
	
	if ((day == null && day_month == null) || times.length == 0 || this.get_cancelled(text)) return;
	
	/*console.log("Detected event: " + location);
	if (day != null) console.log("Detected day of week: " + day);
	if (month != null) console.log("Detected month: " + month);
	if (day_month != null) console.log("Detected day of month: " + day_month);
	if (time != null) console.log("Detected time: " + time);*/
	
	times.forEach(function(time) {
		
		var timestamp = parser.get_timestamp(day, month, day_month, time);
		
		//console.log("Timestamp: " + timestamp);
		
		// create a new event object
		var event = new Event();
		event.location = location;
		event.day_of_week = day;
		event.month = month;
		event.year = new Date().getFullYear();		// use current year?
		event.day_of_month = day_month;
		event.start_time = time;
		event.end_time = parser.get_end_time(timestamp);
		event.timestamp = timestamp;
		
		parser.events.push(event);
	});
};

/**
 * Parses ===Section Headers===
 */
Parser.prototype.parse_header = function(text)
{
	if (text.indexOf('==') == -1) return null;
	
	var regex = /={2,}([^=]+)/;
	var matches = text.match(regex);
	if (matches == null) return null;
	
	// is this header a known zone/location?
	var header = matches[1];
	if (this.locations.indexOf(header) == -1) return null;
	return header;
};

/**
 * Parses a string for events
 */
Parser.prototype.parse_event = function(text)
{
	var found = null;
	
	this.locations.forEach(function(event) {
		
		if (text.indexOf(event) !== -1)
		{
			//console.log("Detected event: " + event);
			found = event;
		}
	});
	
	return found;
};

/**
 * Parses the day of the week
 */
Parser.prototype.parse_day = function(text)
{
	var found = null;
	
	this.days.forEach(function(day) {
		
		if (text.indexOf(day) !== -1)
		{
			//console.log("Detected day of week: " + day);
			found = day;
		}
	});
	
	return found;
};

/**
 * Parses a possible month
 */
Parser.prototype.parse_month = function(text)
{
	var found = null;
	
	this.months.forEach(function(month) {
		
		if (text.indexOf(month) !== -1)
		{
			//console.log("Detected month: " + month);
			found = month;
		}
	});
	
	if (found == null)
	{
		// default to current month
		found = this.get_current_month();
	}
	
	return found;
};

/**
 * Returns the current month fullname
 */
Parser.prototype.get_current_month = function()
{
	var today = new Date();
	return this.months[today.getMonth()];
};

/**
 * Parses the day of the month
 */
Parser.prototype.parse_day_month = function(text)
{
	var regex = /([0-9]{1,2})(st|nd|rd|th)/;
	var found = text.match(regex);
	if (found !== null)
	{
		//console.log("Detected day of month: " + found[1]);
		return found[1];
	}
	return null;
};

/**
 * Parses a string for start/end times
 */
Parser.prototype.parse_time = function(text)
{
	var times = [];
	var startIdx = 0;
	
	// search for # - # (am|pm) ranges
	var foundTime = false;
	do
	{
		foundTime = false;
		var regex = /([0-9]+) - ([0-9]+) (am|pm)/;
		found = text.match(regex);
		if (found != null)
		{
			startIdx = text.indexOf(found[0]) + found[0].length;
			var start_time = found[1];
			var end_time = found[2];
			var am_pm = found[3];
			var time = start_time + ":00 " + am_pm;
			times.push(time);
			foundTime = true;
		}
		else
		{
			regex = /([0-9]+)(:[0-9]+)* (am|pm)/;
			found = text.match(regex);
			if (found != null)
			{
				var time = found[0];
				startIdx = text.indexOf(found[0])  + found[0].length;

				// add :00 if no suffix
				if (time.indexOf(':') == -1)
				{
					var idx = time.indexOf(' ');
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
 */
Parser.prototype.get_timestamp = function(day, month, day_month, time)
{
	var currentTime = new Date();
	var year = currentTime.getFullYear();
	
	var timeStr = day + ", " + month + " " + day_month + " " + year + " @ " + time + " PDT";	// todo: differentiate between PDT/PST
	//console.log("timeStr: " + timeStr);
	var timestamp = Date.parse(timeStr);
	return timestamp;
};

/**
 * Defaults to 2 hours after start time
 */
Parser.prototype.get_end_time = function(start_time)
{
	var end_time = start_time + (2*60*60*1000);
	return end_time;
};

/**
 * Checks for cancelled events
 */
Parser.prototype.get_cancelled = function(text)
{
	text = text.toLowerCase();
	if (text.indexOf('cancelled') != -1 || text.indexOf('canceled') != -1)	// misspelling found in previous motd
		return true;
	
	return false;
};

var parser = new Parser();
//parser.parse(msg);

module.exports.parser = parser;