'use strict';

const fs = require('fs');

const util = require('util');
const readdir = util.promisify(fs.readdir);

const readline = require('readline');
/*
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({
    'input': rs,
    'output': {}
});
*/
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

async function read(file) {
    return new Promise(resolve => {
        //let header;
        //const label = `read-${file}`;
        //console.log(header);
        //console.time(label);
        const stream= fs.createReadStream(file, {encoding: 'utf8'});
        const rl = readline.createInterface({
            'input': stream,
            'output': {}
        });

        rl.on('line', (lineString) => {
            // console.log(lineString);
            const columns = lineString.split(',');
            const year = parseInt(columns[0]);
            const pref = columns[1];
            const popu = parseInt(columns[3]);
        
            if(year === 2010 || year === 2015 || year === 2018) {
                let value = prefectureDataMap.get(pref);
                if(!value) {
                    value = {
                        popu10: 0,
                        popu15: 0,
                        popu18: 0,
                        change: null
                    };
                }
        
                if(year === 2010) {
                    value.popu10 = popu;
                }
                if(year === 2015) {
                    value.popu15 = popu;
                }
                if(year === 2018) {
                    value.popu18 = popu;
                }
                prefectureDataMap.set(pref, value);
            }
        });
        
        rl.on('close', () => {
            // ここに書くと、ファイルを読み込んだ回数分だけ処理が実行される
            // console.log("end");
            resolve();
        });

        // stream.on('data', data => {
        //     header = data.split(/\n/)[0];
        //     stream.destroy();
        // });
        // stream.on('close', () => {
        //     //console.timeEnd(label);
        //     resolve();
        // });
    });
}

async function startTest(files) {
    for (let file of files) {
        // console.log(file);
        await read(file);
    }

    for(let [key, value] of prefectureDataMap) {
        value.change = value.popu18 / value.popu15;
    }
    // データの並び替え
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    const rankingStrings = rankingArray.map(([key, value]) => {
        return `${key}: ${value.popu15} => ${value.popu18} , 変化率: ${value.change}`;
        // return key + ": " + value.popu10 + " => " + value.popu15 + " , 変化率: " + value.change;
    });
    console.log(rankingStrings);
}

// console.log("__dirname: ", __dirname);
readdir(__dirname).then(files => {
    startTest(files.filter(file => /popu-pref\d*\.csv/.test(file)));
});

/*
rl.on('line', (lineString) => {
    // console.log(lineString);
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const pref = columns[1];
    const popu = parseInt(columns[3]);

    if(year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(pref);
        if(!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }

        if(year === 2010) {
            value.popu10 = popu;
        }
        if(year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(pref, value);
    }
});

rl.on('close', () => {
    // 変化率はその県のデータが揃ったあとでしか正しく行えないので、closeイベントの中に実装する
    for(let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    // データの並び替え
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    const rankingStrings = rankingArray.map(([key, value]) => {
        return `${key}: ${value.popu10} => ${value.popu15} , 変化率: ${value.change}`;
        // return key + ": " + value.popu10 + " => " + value.popu15 + " , 変化率: " + value.change;
    });
    console.log(rankingStrings);
});
*/