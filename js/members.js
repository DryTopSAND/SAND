var guildId = '239F7382-9E2F-E511-A5A9-AC162DAE5A05';
var token = 'B2A35DED-9550-7044-9B1D-A0676E03384D3AD9486C-73ED-435F-9258-2FB2BA53F035';

var commonName = function(name) {
  var accounts = {
    'Zekowah.6480': 'Muirellthe Moon',
    'trumpetman.3028': 'Stel Edelweiss',
    'glehmann.9586': 'Victoria Arcwright',
    'Irrell.3524': '',
    //'Peregrinari.5906': 'Ciannali',
    'Finix.8672': 'Allisandra',
    'Kolya.8032': 'Kolya Mistiyani',
    'Aeraki Baer.5238': 'Sand Panda Commanda',
    'PwnedbyJuice.9738': 'Athena Graylight',
    // 'memattm.1469': 'Eldrazzi',
    // 'ArcticRose.5280': 'Rosie Arrow',
    // 'Caliber.9237': 'Major Caliber',
    'Arithmancer.5307': 'Dancira',
    'briana.3092': 'Kenwynna',
    'gmriggs.4628': 'L Cifarelli',
    'El Quia.1397': 'Oriana Lai'
  };

  return accounts[name] ? accounts[name] : '';
};

$.get('https://api.guildwars2.com/v2/guild/' + guildId + '/members?access_token=' + token, function(data) {
  var leaders = [];
  var officers = [];
  var webdevs = [];
  var leaderCode = '';
  var officerCode = '';
  var webDevCode = '';
  var memberCode = function(member, index, array) {
    var size = function() {
      if (array.length === 1 || (array.length % 2 === 1 && index === array.length - 1)) {
        return 'col-xs-12'
      } else {
        return 'col-xs-6'
      }
    };
    var row = (index % 2 === 1) ? ['<div class="row">', '</div>'] : ['', ''];

    return row[0] + "<div class='" + size() + "'>" +
        "<h2>" + member.name + "</h2>" +
        "<p>" + member.rank + "</p>" +
        "<h4>" + commonName(member.name) + "</h4>" +
        "</div>" + row[1];
  };

  data.forEach(function(member) {
    //todo don't hard code rank names -- this is rank.order 1 && rank.order 2-4
    switch (member.rank) {
      case 'Moondremoth':
        leaders.push(member);
        break;
      case 'Dragon Champion':
      case 'Aspect Master':
      case 'Death God':
        officers.push(member);
        break;
      default:
        if (member.name === 'Arithmancer.5307') {
          webdevs.push(member);
        }
    }
  });

  leaders.forEach(function(member, index, array) {
    leaderCode = leaderCode + memberCode(member, index, array);
  });

  officers.forEach(function(member, index, array) {
    officerCode = officerCode + memberCode(member, index, array);
  });

  webdevs.forEach(function(member, index, array) {
    webDevCode = webDevCode + memberCode(member, index, array);
  });

  $("#leader-info").html(leaderCode);
  $('#officer-info').html(officerCode);
  $('#web-dev').html(webDevCode);
  $('#member-count').html(data.length);
}, "json");
