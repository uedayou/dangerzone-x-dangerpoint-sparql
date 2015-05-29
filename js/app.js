//
// 危険地帯 x 危険ポイント(大阪市 警察署 x 犯罪地点)
// Copyright (c) 2015 @uedayou(http://uedayou.net/)
// 

// http://qiita.com/tabo_purify/items/e0210a1df321e9091a59
(function(){
    var _UA = navigator.userAgent;
    if (_UA.indexOf('iPhone') > -1 || _UA.indexOf('iPod') > -1 || _UA.indexOf('Android') > -1) {
        document.write('<link rel="stylesheet" href="css/mobile.css">');
    }
})();

function initialize() {
  $(window).resize(function () {
    _fit();
    $(".modal-backdrop").css("height","100%");
  });
  $(window).ready(function () {
    _fit();
  });

  // 大阪市 警察署 x 犯罪地点　アプリ用設定
  if (typeof isCrimeApp != "undefined" && isCrimeApp) {
    $(".hidden-xs").addClass("col-sm-3 col-md-2");
    $(".col-xs-12").addClass("col-sm-9 col-md-10");
    $(".hidden-xs").css("display","inherit");
    $(".hidden-nav").css("display","inherit");
    $(".social-likes").css("display","inherit");
    // 最初に about のモーダルを開く
    $('#about').modal();
  }

  $.when(
    // 危険地帯の実行
    sendQuery(dz_endpoint, dz_query),
    // 危険ポイントの実行
    sendQuery(dp_endpoint, dp_query)
  )
  .done(function(data_a, data_b) {
    // すべて成功した時の処理
    console.log(data_a, data_b);
    // 位置情報データから母点の座標情報に
    var sitePointsCoordinates = [];
    data_a[0].results.bindings.forEach(function(point){
      sitePointsCoordinates.push([point.longitude.value, point.latitude.value, point.label.value]);
    });
    var sitePointsCoordinates2 = [];
    data_b[0].results.bindings.forEach(function(point){
      sitePointsCoordinates2.push([point.longitude.value, point.latitude.value, point.label.value]);
      console.log(point.longitude.value+", "+point.latitude.value+","+point.label.value);
    });
    drawMap(sitePointsCoordinates, sitePointsCoordinates2);
  })
  .fail(
    function (xhr, textStatus, thrownError) {
      alert("Error: A '" + textStatus+ "' occurred.");
    }
  );

  // スレッド起動
  thread();
}

function _fit() {
  $(".col-xs-12").height($(window).height()-$(".navbar-header").height());
  $(".hidden-xs").height($(window).height()-$(".navbar-header").height());
  $(".app-description").css("padding","10px 5px");
  if ($(".navbar").width()<767) {
    $(".hidden-nav").show();
  }
  else {
    $(".hidden-nav").hide();
  }
}

var flag = false;
var slideUpMarkerInfo = function(label) {
  if (!flag) {
    flag = true;
    $("#marker_info").slideDown("slow");
    $("#marker-label").html(label);
  }
  else {
    $("#marker-label").fadeOut("fast",function(){
      $("#marker-label").html(label);
      $("#marker-label").fadeIn("fast");
    });
  }
  counter =3
}

var counter = 0;
var thread = function() {
    if (flag) {
      if (counter==0) {
        $("#marker_info").slideUp( "slow" );
        flag = false;
      }
      else { counter--; }
    }
    setTimeout(thread,1000);
}

function drawMap(sitePointsCoordinates, sitePointsCoordinates2) {
  var mapOptions = {
    center : new google.maps.LatLng(
                    initial_latitude,
                    initial_longitude),
    zoom   : initial_zoom,
    navigationControlOptions : {
      position: google.maps.ControlPosition.RIGHT
    }
  };

  var map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
  var overlay = new google.maps.OverlayView();

  overlay.onAdd = function () {
//    var layer = d3.select(this.getPanes().overlayLayer).append("div").classed("svg_container", true);
    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").classed("svg_container", true);

    var svg = layer.append("svg");
    // 一旦すべてデータをクリア
    svg.selectAll("*").remove();
    var svg2 = svg.append("g");
    var voronoiVertexContainer = svg.append("g")
                                    .classed("voronoi_vertex_container", true)
                                    .attr("opacity", "0.4");

    overlay.draw = function () {
      // 緯度・経度データをピクセル情報に変換
      var projection = this.getProjection();
      var googleMapProjection = function (coordinates) {
          var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
          var coordinatesPx = projection.fromLatLngToDivPixel(googleCoordinates);
          var label = coordinates[2];
          return [coordinatesPx.x + 4000, coordinatesPx.y + 4000, label];
      };
      var sitePointsCoordinatesPx = [];
      sitePointsCoordinates.forEach(function(coordinates) {
        sitePointsCoordinatesPx.push(googleMapProjection(coordinates));
      });


      var googleMapProjection2 = function (coordinates) {
          var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
          var coordinatesPx = projection.fromLatLngToDivPixel(googleCoordinates);
          var category = coordinates[2];
          console.log(category);
          return [coordinatesPx.x + 4000, coordinatesPx.y + 4000, category];
      };
      var sitePointsCoordinatesPx2 = [];
      sitePointsCoordinates2.forEach(function(coordinates) {
        sitePointsCoordinatesPx2.push(googleMapProjection2(coordinates));
      });


      // 母点が存在する座標の範囲を求める
      var maxXPx, maxYPx, minXPx, minYPx;
      sitePointsCoordinatesPx.forEach(function(sp){
        if(sp[0]>maxXPx || maxXPx == null) {
          maxXPx = sp[0];
        } else if(sp[0]<minXPx || minXPx == null) {
          minXPx = sp[0];
        }
        if(sp[1]>maxYPx || maxYPx == null) {
          maxYPx = sp[1];
        } else if(sp[1]<minYPx || minYPx == null) {
          minYPx = sp[1];
        }
      });

      // 母点の座標(px)からボロノイ点の座標(px)と各ボロノイ点について最も近い母点との距離(px)を求める
      var getDistance = function (point1, point2) {
        xDiff = point1[0]-point2[0];
        yDiff = point1[1]-point2[1];
        return Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
      };
      var polygons = d3.geom.voronoi(sitePointsCoordinatesPx);
      var voronoiPoints = [];
      for (var polyKey = 0; polyKey < polygons.length; polyKey++) {
        // エラー処理
        if (!(polyKey in polygons)) continue;
        polygons[polyKey].forEach(function(polygon){
          var voronoiPoint = {
            coordinatesPx : [ polygon[0],
                              polygon[1] ],
            distancePx    : getDistance(polygon,sitePointsCoordinatesPx[polyKey])
          };

          // 同座標の点は、最も近い母点との距離を採用する
          var isValid = true;
          if(voronoiPoint.coordinatesPx[0]<=maxXPx && voronoiPoint.coordinatesPx[0]>=minXPx &&
             voronoiPoint.coordinatesPx[1]<=maxYPx && voronoiPoint.coordinatesPx[1]>=minYPx){
            for(var vorKey = 0; vorKey < voronoiPoints.length; vorKey++){
              if(voronoiPoints[vorKey].coordinatesPx.toString() == voronoiPoint.coordinatesPx.toString()){
                if(voronoiPoints[vorKey].distance <= voronoiPoint.distance) {
                  isValid = false;
                } else {
                  voronoiPoints.splice(vorKey,1);
                  break;
                }
              }
            }
          } else {
            isValid = false;
          }
          if(isValid) voronoiPoints.push(voronoiPoint);
        });
      }

      // 母点との距離の平均を求める
      var sumDistancePx = 0;
      voronoiPoints.forEach(function(vp){
        sumDistancePx += vp.distancePx;
      });
      var aveDistancePx = sumDistancePx/voronoiPoints.length;

      // 母点描画

      var toiletMarkSize = map.getZoom()*2;
      var sitePointsAttributes = {
        "x" : function(d, i) { return sitePointsCoordinatesPx[i][0]-toiletMarkSize/2; },
        "y" : function(d, i) { return sitePointsCoordinatesPx[i][1]-toiletMarkSize/2; },
        "xlink:href"  : function(d, i) { return dz_icon_name(sitePointsCoordinatesPx[i][2]);},
        "height" : toiletMarkSize+"px",
        "width"  : toiletMarkSize+"px"
      };
      svg2.selectAll("image.site_points")
        .data(sitePointsCoordinatesPx)
        .classed("site_points", true)
        .attr(sitePointsAttributes)
        .enter()
        .append("svg:image")
        .classed("site_points", true)
        .attr(sitePointsAttributes)
        .on("click",  function(d,i){
          var img = $("<img />", {src:dz_icon_name(""), style:"width:20px;height:20px;margin-top:-5px;padding:0;"});
          var span = $("<span>", {style:"padding-left:10px;"});
          span.append(sitePointsCoordinatesPx[i][2]);
          // 大阪市 警察署 x 犯罪地点　アプリ用設定
          if (typeof isCrimeApp != "undefined" && isCrimeApp) {
            var a = $("<a>", {href:"http://www.google.co.jp/search?hl=ja&source=hp&q="+encodeURIComponent("大阪市+"+sitePointsCoordinatesPx[i][2]), target:"_blank"});
            a.append(span);
            slideUpMarkerInfo(img[0].outerHTML+a[0].outerHTML);
          }
          else {
            slideUpMarkerInfo(img[0].outerHTML+span[0].outerHTML);
          }
          map.panTo(new google.maps.LatLng(sitePointsCoordinates[i][1], sitePointsCoordinates[i][0]));
        });

      var toiletMarkSize2 = map.getZoom()*1.5;
      var sitePointsAttributes2 = {
        "x" : function(d, i) { return sitePointsCoordinatesPx2[i][0]-toiletMarkSize2/2; },
        "y" : function(d, i) { return sitePointsCoordinatesPx2[i][1]-toiletMarkSize2/2; },
        "xlink:href"  : function(d, i) {
          return dp_icon_name(sitePointsCoordinatesPx2[i][2]);
        },
        "height" : toiletMarkSize2+"px",
        "width"  : toiletMarkSize2+"px"
      };
      svg.selectAll("image.site_points2")
        .data(sitePointsCoordinatesPx2)
        .classed("site_points2", true)
        .attr(sitePointsAttributes2)
        .enter()
        .append("svg:image")
        .classed("site_points2", true)
        .attr(sitePointsAttributes2)
        .on("click",  function(d,i){
          var img = $("<img />", {src:dp_icon_name(sitePointsCoordinatesPx2[i][2]), style:"width:20px;height:20px;margin-top:-5px;padding:0;"});
          var span = $("<span>", {style:"padding-left:10px;"});
          span.append(sitePointsCoordinatesPx2[i][2]);
          slideUpMarkerInfo(img[0].outerHTML+span[0].outerHTML);
          map.panTo(new google.maps.LatLng(sitePointsCoordinates2[i][1], sitePointsCoordinates2[i][0]));
        });

      // ボロノイ点描画
      var voronoiPointsAttributes = {
        "cx":function(d, i) { return voronoiPoints[i].coordinatesPx[0]; },
        "cy":function(d, i) { return voronoiPoints[i].coordinatesPx[1]; },
        "r" :function(d, i) {
          var radius = voronoiPoints[i].distancePx - aveDistancePx/2;
          if(radius>0){
            return radius;
          } else {
            return 0;
          }
        },
        "fill":"#e74c3c"
      }
      voronoiVertexContainer.selectAll("circle.voronoi_points")
        .data(voronoiPoints)
        .classed("voronoi_points", true)
        .attr(voronoiPointsAttributes)
        .enter()
        .append("svg:circle")
        .classed("voronoi_points", true)
        .attr(voronoiPointsAttributes);
    };
  };
  overlay.setMap(map);
}
google.maps.event.addDomListener(window, 'load', initialize);


// Google Map の標準POIを押すと、ポップアップが開くのを無効にする
// http://d.hatena.ne.jp/scientre/20140410/disable_poi_popup
// http://stackoverflow.com/questions/7950030/can-i-remove-just-the-popup-bubbles-of-pois-in-google-maps-api-v3/19710396#19710396
(function fixInfoWindow() {
  var set = google.maps.InfoWindow.prototype.set;
  google.maps.InfoWindow.prototype.set = function(key, val) {
    if (key === "map") {
      if (! this.get("noSupress")) {
        return;
      }
    }
    set.apply(this, arguments);
  }
})();