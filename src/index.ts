import "dotenv/config";
import axios from "axios";
// @ts-ignore
import urlencode from "urlencode";
import { PromisePool } from "@supercharge/promise-pool";
import { MongoClient } from "mongodb";
import { FullSpeech, Speech } from "./types";
let nr = 0;
const years = [
  "2015/16",
  "2016/17",
  "2017/18",
  "2018/19",
  "2019/20",
  "2020/21",
  "2021/22",
];
const client = new MongoClient(process.env.MONGO as string);
async function main() {
  await client.connect();

  console.log("connected");
  const db = client.db("sosse");

  // const doc = await db.collection("allParties").count();

  // console.log(await doc);
  await parseXML();

  async function parseXML() {
    const urls = Promise.all(
      years.map(async (elem) => {
        const url = `https://data.riksdagen.se/anforandelista/?rm=${urlencode(
          elem
        )}&anftyp=&d=&ts=&parti=&iid=&sz=1000000&utformat=json`;
        const data = await axios.get(url);
        const res = data.data;
        return res.anforandelista.anforande.map((elem: Speech) => {
          return elem.anforande_url_xml + "&utformat=json";
        });
      })
    );
    const cleanUrls = [].concat(...(await urls));
    const unique = new Set(cleanUrls);
    console.log("urlSize:", cleanUrls.length);
    console.log("sets size:", unique.size);
    return getText(Array.from(unique));
  }

  async function getText(arr: string[]) {
    await PromisePool.for(arr).process(async (datas: any) => {
      const data = await axios.get(datas);
      const res: FullSpeech = data.data;
      const obj = {
        docId: res.anforande.dok_id,
        parliament_id: res.anforande.anforande_id,
        url: res.anforande.protokoll_url_www,
        party: res.anforande.parti,
        speaker: await getPerson(
          res.anforande.intressent_id,
          res.anforande.talare
        ),
        date: new Date(res.anforande.dok_datum),
        title: res.anforande.dok_titel,
        text: res.anforande.anforandetext,
      };

      const doc = await db
        .collection("allParties")
        .find({ parliament_id: res.anforande.anforande_id })
        .toArray();

      if (!doc.length) {
        db.collection("allParties").insertOne(obj);
      } else {
      }
    });
  }

  // console.log(await parseXML());

  console.log("disconnecting...");
  client.close();

  async function getPerson(
    iid: string,
    speaker: string
  ): Promise<{ name: string; imgUrl: string }> {
    const url = `https://data.riksdagen.se/personlista/?iid=${iid}&fnamn=&enamn=&f_ar=&kn=&parti=&valkrets=&rdlstatus=&org=&utformat=json&sort=sorteringsnamn&sortorder=asc&termlista=`;
    const res = await axios.get(url);
    const data = res.data;
    return {
      name: speaker,
      imgUrl: data.personlista.person.bild_url_max,
    };
  }
}
main();
