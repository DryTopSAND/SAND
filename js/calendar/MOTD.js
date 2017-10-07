/**
 * MOTD.js
 * NodeJS-compatible MOTD reader
 */
const https = require('https');

var MOTD = function()
{
	this.motd = null;		// the current MOTD for the guild
	
	this.prev_motd = [];	// some of the previous MOTDs
};

/**
 * Fetches the current Guild MOTD
 * as well as any previous MOTDs that are still accessible
 */
MOTD.prototype.get_motd = function(callback)
{
	https.get('https://api.guildwars2.com/v2/guild/239F7382-9E2F-E511-A5A9-AC162DAE5A05/log?access_token=B2A35DED-9550-7044-9B1D-A0676E03384D3AD9486C-73ED-435F-9258-2FB2BA53F035', res => {
		res.setEncoding('utf8');
		let body = '';
		res.on('data', data => {
			body += data;
		});
		res.on('end', () => {
			body = JSON.parse(body);
			body.forEach(function(logItem) {
				if (logItem.type === 'motd') {
					if (motd.motd == null)
					{
						motd.motd = logItem.motd;
					}
					else
						motd.prev_motd.push(logItem.motd);
				}
			});
			callback(motd.motd);
		});
	});
};

/**
 * Simple callback for testing
 */
MOTD.prototype.after_motd = function()
{
	console.log(motd.motd);
};

var motd = new MOTD();
//motd.get_motd(motd.after_motd);

module.exports.motd = motd;