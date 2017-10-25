var mostRecentMessage;

$.get('https://api.guildwars2.com/v2/guild/239F7382-9E2F-E511-A5A9-AC162DAE5A05/log?access_token=B2A35DED-9550-7044-9B1D-A0676E03384D3AD9486C-73ED-435F-9258-2FB2BA53F035', function(data) {
  var messages = [];
  var chatLinks = [];
  var itemIDs = [];
  var itemNames = [];

  data.forEach(function(logItem) {
    if (logItem.type === 'motd') {
      messages.push(logItem.motd);
    }
  });

  mostRecentMessage = messages[0];

  // Replace the line breaks in the message response with break tags
  mostRecentMessage = mostRecentMessage.replace(/(?:\r\n|\r|\n)/g, '<br />');

  // Remove guild meeting notes line
  mostRecentMessage = mostRecentMessage.replace(/<br \/>[^>]*meeting.*notes[^>]*<br \/>/gim, '');

  // Remove guild meeting line
  mostRecentMessage = mostRecentMessage.replace(/<br \/>[^>]*sandmeeting[^>]*<br \/>/gim, '');

  // Add links to urls starting with http or https
  var httpReplace = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

  mostRecentMessage = mostRecentMessage.replace(httpReplace, '<a href="$1" target="_blank">$1</a>');

  // Add links to urls starting with just www.
  var wwwReplace = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

  mostRecentMessage = mostRecentMessage.replace(wwwReplace, '$1<a href="http://$2" target="_blank">$2</a>');

  // Add links to Teamspeak3 urls
  var ts3Replace = /(^|[^\/])(ts3\.[\S]+(\b|$))/gim;

  mostRecentMessage = mostRecentMessage.replace(ts3Replace, '$1<a href="http://$2" target="_blank">$2</a>');

  // Handle GW2 chat codes by turning them into item names
  chatLinks = mostRecentMessage.match(/\[&Ag([\w]+)\]/gm);

  if (chatLinks) {
    chatLinks.forEach(function(chatCode) {
        // Via darthmaim, converts chat code item to item id
        var data = atob(chatCode.match(/^\[&(.*)\]$/)[1])
                .split('')
                .map(function(c) {
c.charCodeAt();
});
        var id = data[3] << 8 | data[2];

        itemIDs.push((data.length > 4 ? data[4] << 16 : 0) | id);
    });

    itemIDs.forEach(function(id, index) {
      // get item info from API via item id created above
      $.get('https://api.guildwars2.com/v2/items/' + id, function(data) {
        itemNames[index] = data.name;

        // Replace chat links with item names
        mostRecentMessage = mostRecentMessage.replace(chatLinks[index], itemNames[index]);
      }).then(function() {
        $('#motd').html(mostRecentMessage);
      });
    });
  } else {
    $('#motd').html(mostRecentMessage);
  }
}, 'json');
