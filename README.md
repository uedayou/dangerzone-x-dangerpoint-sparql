# ○○危険地帯

LODチャレンジJapan2013データ提供パートナー賞受賞作品「[トイレ危険地帯](http://lod.sfc.keio.ac.jp/challenge2013/show_status.php?id=v008)」
を汎用的に利用できるように修正しました。

## デモ

<http://uedayou.github.io/dangerzone-sparql/>

## 使い方

config.js に SPARQLエンドポイント、クエリ、最初に表示する中心位置（緯度、経度）とズーム率を指定してください。

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
    */}).toString().match(/\n([\s\S]*)\n/)[1];
    // 中心位置を指定
    var initial_latitude =34.68206400648744;
    var initial_longitude =135.49816131591797;
    // ズーム率を指定
    var initial_zoom = 11;

SPARQLクエリは、`(function () {/* ... */}).toString().match(/\n([\s\S]*)\n/)[1];` の `...` の部分に置き換えて記述してください。また、`?latitude`, `?longitude` にWGS84の緯度、経度を取得するようにクエリを書いてください。

`icon.svg`を変更すると、地図上のアイコンを変更することができます。

その他の詳細については、「[トイレ危険地帯](https://github.com/y4ashida/toilet)」を見てください。
