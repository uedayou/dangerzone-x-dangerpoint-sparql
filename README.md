# 危険地帯 x 危険ポイント

LODチャレンジJapan2014 ビジュアライゼーション部門 優秀賞 受賞作品「[大阪市 警察署 x 犯罪発生](http://uedayou.net/osakacrimemap/)」を他のデータにも適用できるようにしたアプリです。

## デモ

<http://uedayou.net/osakacrimemap/>
※ 上記は、大阪市 警察署 x 犯罪発生です。

## 使い方

config.js に 危険地帯の情報を取得するSPARQLエンドポイント、クエリと、危険ポイントの情報を取得するエンドポイント、クエリ
さらに、最初に表示する中心位置（緯度、経度）とズーム率を指定してください。

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
    var initial_zoom = 11;

SPARQLクエリは、`(function () {/* ... */}).toString().match(/\n([\s\S]*)\n/)[1];` の `...` の部分に置き換えて記述してください。また、`?latitude`, `?longitude` にWGS84の緯度、経度を取得するようにクエリを書いてください。

