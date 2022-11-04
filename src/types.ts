export type Speech = {
  dok_hangar_id: string;
  dok_id: string;
  dok_titel: string;
  dok_rm: string;
  dok_nummer: string;
  dok_datum: string;
  avsnittsrubrik: string;
  underrubrik: string;
  kammaraktivitet: string;
  anforande_id: string;
  anforande_nummer: string;
  talare: string;
  parti: string;
  anforandetext: string;
  intressent_id: string;
  rel_dok_id: string;
  replik: string;
  systemdatum: string;
  systemnyckel: string;
  anforande_url_xml: string;
  anforande_url_html: string;
  protokoll_url_www: string;
};

export type FullSpeech = {
  anforande: {
    dok_hangar_id: string;
    dok_id: string;
    dok_titel: string;
    dok_rm: string;
    dok_nummer: string;
    dok_datum: string;
    avsnittsrubrik: string;
    underrubrik: string;
    kammaraktivitet: string;
    anforande_id: string;
    anforande_nummer: string;
    talare: string;
    parti: string;
    anforandetext: string;
    intressent_id: string;
    rel_dok_id: string;
    replik: string;
    systemdatum: string;
    systemnyckel: string;
    anforande_url_xml: string;
    anforande_url_html: string;
    protokoll_url_www: string;
  };
};

export type MongoDocument = {
  docId: string;
  _id: string;
  url: string;
  party: string;
  speaker: {
    name: string;
    imgUrl: string;
  };
  date: string;
  title: string;
  text: string;
};
