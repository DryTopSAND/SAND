var guildId = '239F7382-9E2F-E511-A5A9-AC162DAE5A05';
var token = 'B2A35DED-9550-7044-9B1D-A0676E03384D3AD9486C-73ED-435F-9258-2FB2BA53F035';

$.get(
    'https://api.guildwars2.com/v2/guild/' + guildId + '/ranks?access_token=' + token,
    function(data) {
      var code = '';

      data.forEach(function(rank) {
        // todo order by id?
        code = code +
            '<div class=\'col-md-4\'>' +
            '<p>' +
            '<img src=\'' + rank.icon + '\'> ' +
            rank.id +
            '</p>' +
            '</div>';
      });

      $('#ranks').html(code);
    },
    'json'
);
