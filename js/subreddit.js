$.get('https://www.reddit.com/r/minionsofmoondremoth/new.json?limit=3', function(response) {
  var widgetHTML = '';

  response.data.children.forEach(function(obj) {
    var postText = obj.data.selftext.replace(/(?:\r\n|\r|\n)/g, '<br />');

    widgetHTML = widgetHTML +
        '<div class=\'col-sm-12\'>' +
        '<h3>' + obj.data.title + '</h3>' +
        '<h4>' +
        '/u/' + obj.data.author +
        (obj.data.author_flair_text ? (' (' + obj.data.author_flair_text + ')</h4>') : ('</h4>')) +
        '<p><a href="' + obj.data.url + '">' + obj.data.title + '</a></p>' +
        postText +
        '</div>';
  });

  $('#reddit-feed').html(widgetHTML);
}, 'json');
