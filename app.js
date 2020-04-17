'use strict';

const fs = require('fs');

const util = require('util');
const readdir = util.promisify(fs.readdir);

const readline = require('readline');

const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({
    'input': rs,
    'output': {}
});

const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

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
        //return pair2[1].change - pair1[1].change; // 降順
        return pair1[1].change - pair2[1].change; // 昇順
    });

    console.log("2010 年から 2015 年にかけて 15〜19 歳の人が減った割合の都道府県ランキング");
    const rankingStrings = rankingArray.map(([key, value], i) => {
        return `第${i+1}位: ${key}: ${value.popu10} => ${value.popu15} , 変化率: ${value.change}`;
        // return key + ": " + value.popu10 + " => " + value.popu15 + " , 変化率: " + value.change;
    });
    console.log(rankingStrings);
});