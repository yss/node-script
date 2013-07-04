var fs = require('fs'),
    path = require('path');

var DEST, CWD = process.cwd();

function mkdir(dir) {
    if (!fs.existsSync(dir)) {
        console.log('Mkdir:', dir);
        fs.mkdirSync(dir);
    }
}
function isDirectory(filepath) {
    return fs.statSync(filepath).isDirectory();
}

function parse(dirname) {
    dirname = path.join(CWD, dirname);
    console.log(CWD, dirname)
    var files = fs.readdirSync(dirname);
    files.forEach(function(item) {
        var filepath = path.join(dirname, item);
        if (/\.json$/.test(item)) {
            try {
                var boards = require(filepath).boards;
                boards = boards.map(function(board) {
                    var pins = board.pins.map(function(pin) {
                        return {
                            title: pin.raw_text,
                            src: pin.file.key + '_sq75'
                        }
                    });
                    return {
                        id: board.board_id,
                        title: board.title,
                        pins: pins
                    }
                });
                fs.writeFileSync(path.join(DEST, item), JSON.stringify({ status:0, data: boards}));
            } catch(e){
                console.error('require file:', filepath, e);
            }
        } else if (item === 'boards') {
            parseBoards(filepath, item);
        }
    });
}

function parseBoards(dirpath, dirname) {
    var files = fs.readdirSync(dirpath),
        destDirname = path.join(DEST, dirname);
    mkdir(destDirname);
    files.forEach(function(file) {
        var filepath = path.join(dirpath, file);
        if (isDirectory(filepath)) {
            var destPath = path.join(destDirname, file);
            mkdir(destPath);
            var pins = fs.readdirSync(filepath);
            pins.forEach(function(pin) {
                var filep = path.join(filepath, pin);
                if (/\.json$/.test(pin)) {
                    try {
                        var board = require(filep).board,
                            title = board.title;
                        if (!board.pins.length) {
                            return;
                        }
                        var dataPins = board.pins.map(function(d) {
                            return {
                                title: d.raw_text || title,
                                maxWidth: d.file.width,
                                maxHeight: d.file.height,
                                height: Math.ceil(d.file.height * 236 / d.file.width),
                                src: d.file.key + '_fw236'
                            };
                        });
                        fs.writeFileSync(path.join(destPath, pin), JSON.stringify({ status: 0, data: dataPins }));
                    } catch(e) {
                        console.error('require file:', filep, e);
                    }
                }
            });
        }
    });
}

if (process.argv.length > 2) {
    DEST = path.join(CWD, process.argv[3] || 'tmp');
    mkdir(DEST);
    parse(process.argv[2]);
}
