var http = require('http'),
    querystring = require('querystring'),
    path = require('path'),
    fs = require('fs');

var code = 'hil0k7m9',
    codeList = '0123456789abcdefghijklmnopqrstuvwxyz',
    param = { limit: 20, wfl: 1};

// 获取不一样的Code
function getCode(code) {
    code = code.split('');
    var len = code.length;
    if (code[len-1] == 'z') {
        code[len-1] = 0;
        if (len > 1) {
            return getCode(code.slice(0, -1).join('')) + 0;
        }
    } else {
        code[len-1] = codeList.charAt(codeList.indexOf(code[len-1]) + 1);
    }
    return code.join('');
}
// 顾名思义
function mkdir(dir) {
    if (!fs.existsSync(dir)) {
        console.log('makedir:', dir);
        fs.mkdirSync(dir);
    }
}

function run(count, uri, dir, filterName, callback) {
    if (count > 444) {
        return callback&&callback();
    }
    var reqOption = {
            hostname: 'huaban.com',
            port: 80,
            path: uri + (count > 0 ? '?' + code + '&' + querystring.stringify(param) : ''),
            method: 'GET',
            headers: {
                "Accept": 'application/json',
                "Connection": "keep-alive",
                "Accept-Encoding": "gzip,deflate,sdch",
                "Accept-Language": "zh-CN,zh;q=0.8",
                "Cookie": '_hb_chrome_extention=true; sid=vi5vuZy5zmidmRTC05uq9gfS.%2BcHeDWPsJig3qEVsAlFk2pATOi9p2fo%2BA3h4IO9y%2BgM; __utma=170314297.1433670659.1372335136.1372335136.1372345361.2; __utmb=170314297.9.10.1372345361; __utmc=170314297; __utmz=170314297.1372335136.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmv=170314297.|3=hb_week=201326=1',
                'Host': 'huaban.com',
                'Referer': 'http://huaban.com' + uri,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36',
                "X-Request": "JSON",
                "X-Requested-With":"XMLHttpRequest"
            }
        },
        body = '';
    console.log('Get:', reqOption.path);
    var req = http.request(reqOption, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function() {
            req.abort();
            console.log('End:', count);
            var bd = body.match(new RegExp('"' + filterName + '":\\d+', 'g'));
            if (bd && bd.length) {
                fs.writeFileSync(path.join('./', dir, count + '.json'), body)
                param.max = bd.pop().split(':')[1];
                code = getCode(code);
                run(++count, uri, dir, filterName, callback);
            } else {
                if (~body.indexOf('nginx/40')) {
                    console.log('BODY is:', body);
                    return run(count, uri, dir, filterName, callback);
                }
                console.log('BODY is:', body);
                console.log('Data is collection....');
                callback && callback();
            }
        });
    });
    req.on('error', function(e) { console.log(e.message); })
    req.end();
}

function forReq(uri, dirname) {
    // 如果没有文件夹则创建
    mkdir(path.join('./', dirname));
    console.log('Uri is:', uri);
    console.log('Dirname is:', dirname);
    run(0, uri, dirname, 'board_id', function() { forBoards(dirname); });
}

function forBoards(dirname) {
    console.log('Dirname is:', dirname);
    var DIR = path.join('./', dirname),
        currDir = fs.readdirSync(DIR),
        dirLen = currDir.length;

    console.error(currDir);
    mkdir(path.join(DIR, 'boards'));

    function getFile() {
        while (dirLen-- > 0) {
            if (/\.json$/.test(currDir[dirLen])) {
                console.error(currDir[dirLen]);
                return currDir[dirLen];
            }
        }
        return '';
    }

    function readBoards() {
        var file = getFile();
        console.log(file);
        if (file) {
            var json = require('./' + path.join(DIR, file));
            if (!json || !json.boards || !json.boards.length) {
                console.log('Ignore Empty FIle:', path.join(DIR, file));
                readBoards();
            }
            var boards = json.boards,
                boardsLen = boards.length;

            function getBoards() {
                if (boardsLen-- > 0) {
                    var uri = '/boards/' + boards[boardsLen]["board_id"],
                        dir = path.join(DIR, uri);
                    mkdir(dir);
                    run(0, uri, dir, 'pin_id', function() { getBoards(); });
                } else {
                    readBoards();
                }
            }
            getBoards();
        } else {
            console.log('Boards Data is collected! All Over...');
        }
    }

    readBoards();
}

// node get.js /boards/favorite/funny funny
if (process.argv.length > 3) {
    forReq(process.argv[2], process.argv[3]);
} else if (process.argv.length == 3) {
    forBoards(process.argv[2]);
}
