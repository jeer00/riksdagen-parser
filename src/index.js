import "dotenv/config";
import axios from "axios";
import urlencode from "urlencode";
import { PromisePool } from "@supercharge/promise-pool";

import { MongoClient } from "mongodb";
console.log(process.env.MONGO);

const years = [
  "2013/14",
  "2014/15",
  "2015/16",
  "2016/17",
  "2017/18",
  "2018/19",
  "2019/20",
  "2020/21",
  "2021/22",
];
async function parseXML() {
  const urls = Promise.all(
    years.map(async (elem) => {
      const url = `https://data.riksdagen.se/anforandelista/?rm=${urlencode(
        elem
      )}&anftyp=&d=&ts=&parti=s&iid=&sz=6000&utformat=json`;
      const data = await axios.get(url);
      const res = data.data;
      return res.anforandelista.anforande.map((elem) => {
        // console.log(elem.anforande_url_xml);
        return elem.anforande_url_xml + "&utformat=json";
      });
    })
  );
  const cleanUrls = [].concat(...(await urls));

  return getText(cleanUrls);
}

async function getText(res) {
  await PromisePool.for(res).process(async (datas) => {
    const data = await axios.get(datas);
    const resp = data.data;
    const obj = {
      dok_id: resp.anforande.dok_id,
      id: resp.anforande.anforande_id,
      url: resp.anforande.protokoll_url_www,
      party: resp.anforande.parti,
      speaker: resp.anforande.talare,
      date: resp.anforande.dok_datum,
      title: resp.anforande.dok_titel,
      text: resp.anforande.anforandetext,
    };
    MongoClient.connect(process.env.MONGO, function (err, db) {
      if (err) throw err;
      const dbo = db.db("sosse");

      dbo.collection("sosse").insertOne(obj, function (err, res) {
        if (err) throw err;
        db.close();
      });
    });
  });
}

// console.log(await parseXML());
async function search() {
  MongoClient.connect(process.env.MONGO, async function (err, db) {
    if (err) throw err;
    const dbo = db.db("sosse");
    const sosse = dbo.collection("sosse");
    const index = await sosse.createIndex({ text: "text" });
    const projection = {
      _id: 0,
      text: 1,
    };
    const cursor = await sosse
      .find({ $text: { $search: "Löfven" } })
      .project(projection);
    console.log(
      `Hittade ${await cursor.count()} dokument med ordet "Löfven" i: \n \n`
    );

    return cursor;
  });
}
console.log(await search());
