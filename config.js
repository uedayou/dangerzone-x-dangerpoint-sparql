// SPARQLエンドポイントを指定
var endpoint = "http://db.lodc.jp/sparql";
// SPARQLクエリを指定
var query = (function () {/*
SELECT DISTINCT *
FROM <http://lod.sfc.keio.ac.jp/challenge2013/show_status.php?id=d030>
WHERE{
  ?uri <http://lodosaka.hozo.jp/category_1> "公衆トイレ"@ja ;
  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ;
  <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude .
}
LIMIT 1000
*/}).toString().match(/\n([\s\S]*)\n/)[1];
// 中心位置を指定
var initial_latitude =34.68206400648744;
var initial_longitude =135.49816131591797;
// ズーム率を指定
var initial_zoom = 11;

var icon_name = "icon.svg";