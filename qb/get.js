var request = require('request'),
    qs = require('querystring'),
    fs = require('fs'),
    path = require('path');

var len = 444, full, uri = 'http://www.qiushibaike.com/month';
var DEST, CWD = process.cwd();
var param = {
    s: 4577309
};
mkdir(process.argv[3] || 'tmp');
DEST = path.join(CWD, process.argv[3] || 'tmp');

function getData() {
    if (--len) {
        full = uri + (len> 1 ? '/page/' + len + '?' + qs.stringify(param) : '');
        var options = {
            uri: full,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language':'zh-CN,zh;q=0.8',
                'Cache-Control':'max-age=0',
                'Connection':'keep-alive',
                'Cookie':'bdshare_firstime=1358090496248; _qqq_session_id=13b374e9a617fb3288051baaf5b8f870c58ab5a8; __utmmobile=0xbd1141c9c9834dc2; Hm_lvt_743362d4b71e22775786fbc54283175c=1371391954,1373188084; _qqq_uuid_=1163e43341536486c4dc59bb339bf1ace5f2375a; __gads=ID=feea6f43514aaaf0:T=1374034357:S=ALNI_Maml9GSb8TzjW0xYuUsy7q7eSr8Ng; Hm_lvt_2670efbdd59c7e3ed3749b458cafaa37=1372897081,1373070203,1373182313,1374034358; Hm_lpvt_2670efbdd59c7e3ed3749b458cafaa37=1374034358; __utma=210674965.263917533.1358090496.1373197172.1374034358.15; __utmb=210674965.1.10.1374034358; __utmc=210674965; __utmz=210674965.1369212654.3.3.utmcsr=r.mail.qq.com|utmccn=(referral)|utmcmd=referral|utmcct=/cgi-bin/reader_main; _cmstat=2; _cmdate=Wed%20Jul%2017%202013',
                'Host':'www.qiushibaike.com',
                'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36'
            }
        };
        request(options, function(err, res, body) {
            if (err) {
                return console.error(err);
            }
            console.log('Get:', full);
            fs.writeFileSync(path.join(DEST, len + '.html'), body);
            return getData();
            var bd = [];
            body.replace(/<div class="content"[^>]*>([^<]+)<\/div>[^<]*(?:<div class="thumb">\s*<img src="([^"]+)")?/g, function($0, $1, $2) {
                bd.push({ content: $1.trim(), img: $2 || '' });
            });
            if (bd.length) {
                fs.writeFileSync(path.join(DEST, count + '.json'), JSON.strinify(bd));
                getData();
            }
        });
    }
}
getData();
