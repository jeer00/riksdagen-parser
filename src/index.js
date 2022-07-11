import { XMLParser } from "fast-xml-parser";
import axios from "axios";
import urlencode from "urlencode";
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
  // const data = await axios.get(url);

  // const res = data.data;

  // console.log(res.anforandelista.anforande);
  // console.log(res.anforandelista.anforande[0].dok_datum);
  // console.log(
  //   res.anforandelista.anforande[res.anforandelista.anforande.length - 1]
  //     .dok_datum
  // );

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
  const data = await axios.get(res[0]);
  console.log(data.data.anfo); // funkar

  console.log(res);
  res.map(async (elem) => {
    setTimeout(async () => {
      const data = await axios.get(elem);
      const res = data.data;
      const text = res.anforandetext;
      console.log(text);
    }),
      2000;
  });
}
const url2 =
  "https://data.riksdagen.se/anforandelista/?rm=&anftyp=nej&d=2000-01-01&ts=1990-01-01&parti=s&iid=&sz=100000&utformat=json";
const url = "https://data.riksdagen.se/anforande/H909139-40";
await parseXML();
