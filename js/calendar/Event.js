/**
 * Defines the data structure for events and time ranges
 */
var Event = function()
{
	this.location = null;		// The map or zone the event takes place in, ie. Dry Top
	this.day_of_week = null;	// Monday, Tuesday, Wednesday, etc.
	this.month = null;			// January, February, March, etc.
	this.day_of_month = null;	// 1-31
	this.year = null;			// ie. 2017
	this.start_time = null;		// The start time of the event, ie. 6 pm
	this.end_time = null;		// The end time of the event. If none given, assumed to be 2 hours after the start time
	this.timestamp = null;		// A Date object representing all of the previous temporal info
};