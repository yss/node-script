var fs = require('fs'),
    path = require('path');

var files = fs.readdirSync('./tmp');
files.forEach(function(file) {
    if (/\.html$/.test(file)) {
        var cont = fs.readFileSync('./tmp/' + file, 'utf8'),
            bd = [];

        cont.replace(/<div class="content" title="([^"]+)">([^<]+)<\/div>[^<]*(?:<div class="thumb">[^<]*<img src="([^"]+)")?/g, function($0, $1, $2, $3) {
            bd.push({
                content: $2.trim(),
                time: $1.trim(),
                imgSrc: $3 || ''
            });
            return '';
        });
        fs.writeFileSync('./data/' + file.replace('.html', '.json'), JSON.stringify(bd));
    }
});
