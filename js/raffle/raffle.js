/* eslint new-cap: 0 */
var id = 72271; // pumpkin id
var users = {};

$(function() {
    // fetch the transaction history from a remote server
    $.getJSON('http://167.114.130.199/SAND/log.json', function(logItems) {
        // calculate totals
        $.each(logItems, function(i, logItem) {
            if (logItem.type == 'upgrade' && logItem.action == 'completed' && logItem.item_id == id) {
                var user = logItem.user;

                if (user in users) {
                    users[user]++;
                } else {
                    users[user] = 1;
                }
            }
        });
        var html = '';

        $.each(users, function(idx, val) {
            html += idx + ' = ' + val + '<br>';
        });
        $('#total').html(html);

        // build the log table
        var cols = {
            '#': {
                index: 1,
                type: 'number',
                unique: true,
                sortOrder: 'desc',
            },
            'id': {
                index: 2,
                type: 'number',
                unique: true,
            },
            'user': {
                index: 3,
                type: 'string',
                unique: false,
            },
            'time': {
                index: 4,
                type: 'string',
                unique: false,
            },
        };
        // reformat data
        var rows = [];

        for (var i = 0; i < logItems.length; i++) {
            var logItem = logItems[logItems.length - 1 - i];
            var row = {
                '#': i + 1,
                'id': logItem.id,
                'user': logItem.user,
                'time': moment(logItem.time).format('MMM D YYYY hh:mm:ss a'),
            };

            rows.push(row);
        }
        var data = {
            cols: cols,
            rows: rows,
        };

        $('#log').WATable({
            data: data,
            pageSize: 20,
        });
    });
});
