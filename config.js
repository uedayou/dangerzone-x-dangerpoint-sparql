//
// 危険地帯 x 危険ポイント(大阪市 警察署 x 犯罪地点)
// Copyright (c) 2015 @uedayou(http://uedayou.net/)
// 

// 危険地帯用SPARQLエンドポイントを指定
var dz_endpoint = "http://db.lodc.jp/sparql";

// 危険地帯用SPARQLクエリを指定
// ?latitude , ?longitude, ?label を必ず指定してください
var dz_query = (function () {/*
SELECT DISTINCT *
FROM <http://lod.sfc.keio.ac.jp/challenge2013/show_status.php?id=d030>
WHERE{
  ?uri <http://lodosaka.hozo.jp/category_2> "警察・交番"@ja ;
  <http://schema.org/name> ?label;
  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ;
  <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude .
}
LIMIT 1000
*/}).toString().match(/\n([\s\S]*)\n/)[1];


// 危険ポイント用SPARQLエンドポイントを指定
var dp_endpoint = "http://lodcu.cs.chubu.ac.jp/SparqlEPCU/api/uedayou20150118";

// 危険ポイント用SPARQLクエリを指定
// ?latitude , ?longitude, ?label を必ず指定してください
var dp_query = (function () {/*
select * where {
  ?uri geo:lat ?latitude;
  geo:long ?longitude;
  <http://linkdata.org/property/rdf1s2565i#category> ?label.
  filter(xsd:float(?latitude)>34.586018936001786)
} 
*/}).toString().match(/\n([\s\S]*)\n/)[1];


// 中心位置を指定
var initial_latitude =34.68206400648744;
var initial_longitude =135.49816131591797;
// ズーム率を指定
var initial_zoom = 12;

// 危険地帯のアイコン
var dz_icon_name = function(label) {
  // データのラベルに応じて変更したい場合は、ここにコードを書いてください。
  //return "ico05.png";
  return "star.png";
}


//var isCrimeApp = true;

// 危険ポイントのアイコン
// "icon00.png" : 赤
// "icon01.png" : 水色
// "icon02.png" : 黄色
// "icon03.png" : 青
// "icon04.png" : 黄緑
var dp_icon_name = function(label) {
  if(typeof isCrimeApp == "undefined" || !isCrimeApp) {
    // データのラベルに応じて変更したい場合は、ここにコードを書いてください。
    return "icon00.png"; // 赤
  }
  //
  // 以下 大阪市 警察署 x 犯罪発生のためのコード
  // 

  var num;
  if (label=="ひったくり") {
    num = "00";
  }
  else if (label=="路上強盗") {
    num = "04";
  }
  else if (label=="子供被害情報") {
    num = "03";
  }
  else if (label=="自動車盗難") {
    num = "02";
  }
  else if (label=="侵入盗") {
    num = "01";
    return "";
  }
  if (typeof num === "undefined") {
    return "ico05.png";
  } else {
    return "icon"+num+".png";
  }
}

