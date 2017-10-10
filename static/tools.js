
// 递归更新替换默认值（深拷贝
var extend = function (obj1, obj2) {
  for (var k in obj2) {
    if (obj1.hasOwnProperty(k) && typeof obj1[k] == 'object' && !(obj1[k] instanceof Array)) {
      extend(obj1[k], obj2[k]);
    } else {
      obj1[k] = obj2[k];
    }
  }
}

//解析json=> param
var bodyPrase = function (object) {
  if (!(object instanceof Object)) {
    throw error('can not parse without a object')
    return
  }
  var keys = Object.keys(object), string = '', key;
  for (key of keys) {
    string += `${key}=${object[key]}&`
  }
  return string.substr(0, string.length - 1)
}

//下雨canvas
var Rain = (function () {
  var options = {
    speed: 200,
    delay: 60,
    styles: {
      rainColor: '#999',
      rainW: 3
    }
  }
  var element, styles, speed, delay, context, rains = [], rain = {};
  var drawingLine = function (w, h) {
    var speedH = speed / 60 + 5
    rains.push({ y: 0, x: Math.floor(Math.random() * w) })
    context.beginPath();
    for (var i = 0; i < rains.length; i++) {
      if (rains[i].y > h) {
        rains.splice(i, 1)
      } else {
        if (styles.rainColor) {
          context.strokeStyle = styles.rainColor;
          context.lineWidth = styles.rainW || 3;
        }
        context.moveTo(rains[i].x, rains[i].y)
        context.lineTo(rains[i].x - 5, rains[i].y + 20);
        context.lineTo(rains[i].x - 3, rains[i].y + 20);
        context.lineTo(rains[i].x, rains[i].y);
        rains[i].y += speedH
        rains[i].x -= 2
      }
    }
    context.closePath();
    context.stroke();
    setTimeout(function () {
      context.clearRect(0, 0, w, h);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, w, h);
      drawingLine(w, h)
    }, delay)

  }

  var drawing = function (w, h) {
    styles = options.styles
    speed = options.speed
    delay = options.delay
    context = element.getContext('2d');
    drawingLine(w, h)
  }
  rain.init = function (opt) {
    extend(options, opt)
    element = element || document.getElementById(opt.el)
    var w = element.offsetWidth,
      h = element.offsetHeight;
    drawing(w, h)
  }
  return rain
})()

//多边形canvas
var Radar = (function () {

  var options = {

    styles: {
      offset: {
        top: 15,
        left: 0
      },
      border: {
        width: 2,
        color: '#2EC8CA'
      },
      splitLine: {
        color: '#ccc'
      },
      title: {
        font: 'bold 52px Microsoft YaHei',
        color: '#F56948'
      },
      valueRange: {
        border: {
          width: 4,
          color: '#FF0101'
        },
        background: '#F56948',
        arrow: 2
      },
      inner: {
        radius: 70,
        background: '#fff'
      },
      label: {
        image: '',
        font: '16px Microsoft YaHei',
        color: '#666'
      }
    }
  };

  var element,
    styles,
    borderStyle,
    splitLineStyle,
    titleStyle,
    valueRangeStyle,
    innerStyle,
    labelStyle,
    promise,
    textAreas = [];

  // 返回设置数量的极点坐标
  var calcLocation = function (cp, r, angle) {

    return {
      x: cp[0] + r * Math.cos(angle),
      y: cp[1] + r * Math.sin(angle)
    };
  }
  // 通过点连线
  var drawLine = function (line) {
    var lines = line.lines;
    context.beginPath();
    context.moveTo(lines[0].x, lines[0].y);

    for (var i = 1; i < lines.length; i++) {
      context.lineTo(lines[i].x, lines[i].y);
    }

    context.closePath();

    if (line.style) {
      context.strokeStyle = line.style;
      context.lineWidth = line.width || 1;
      context.stroke();
    }

    if (line.fill) {
      context.fillStyle = line.fill;
      context.fill();
    }
  }
  // 从内存中读取设置并画出对应文字
  var fillText = function (opts) {
    context.font = opts.font;
    context.fillStyle = opts.color;
    context.textAlign = opts.align || 'center';
    context.textBaseline = opts.vertical || 'middle';
    context.moveTo(opts.x, opts.y);
    context.fillText(opts.text, opts.x, opts.y);
  }
  // 画出label文字
  var drawLabel = function (borderLoc, polar, cp) {
    textAreas = []
    for (var n = 0; n < borderLoc.length; n++) {
      var text = polar[n].text,
        size = parseInt(options.styles.label.font),
        loc = borderLoc[n],
        x = loc.x == cp[0] ? loc.x : loc.x > cp[0] ? loc.x + size + 30 : loc.x - size - 30,
        y = loc.y >= cp[1] ? loc.y + size : loc.y - size;
      textAreas.push({ x: Math.floor(x), y: Math.floor(y), text })
      fillText({
        font: labelStyle.font,
        color: labelStyle.color,
        text: text,
        x: Math.floor(x),
        y: Math.floor(y)
      });
    }
  }
  //画坐标轴
  var drawAxis = function (opt) {
    var x = opt.cp[0], y = opt.cp[1], w = opt.width/2, h = opt.height/2;
    context.strokeStyle = opt.style.color;
    context.lineWidth = opt.style.width || "2";
    // x 轴
    context.beginPath();
    context.moveTo(x-w,y+h);
    context.lineTo(x+w,y+h);
    context.lineTo(x+w-15,y+h+15);
    // y 轴
    context.moveTo(x-w,y+h);
    context.lineTo(x-w,y-h);
    context.lineTo(x-w-15,y-h+15);
    // 总数
    fillText({
      font: "22px Microsoft YaHei",
      color: labelStyle.color,
      text: opt.sum,
      x: Math.floor(x-w),
      y: Math.floor(y-h-15)
    });
  }
  //绘制每帧柱形画布
  var drawCloum = function (cp,width,height,valueRangeLoc, bStyle, valueSum) {
    drawAxis({
      cp: cp,
      width: width,
      height: height,
      style: bStyle,
      sum: valueSum
    });
    var xArea = Math.floor(width/(valueRangeLoc.length*2+1)),
      yArea = Math.floor(height/valueSum),
      len = valueRangeLoc.length;
    
    context.fillStyle="#F56948";
    textAreas = []
    for(var i = 0 ; i < len; i++) {
      var x = cp[0]-width/2+xArea*(i+0.5)*2,
        y = cp[1]+height/2
      // y 轴数量
      textAreas.push({
        x: x + xArea/2 *len,
        y: y + 20*len,
        text: valueRangeLoc[i].text
      })
      fillText({
        font: labelStyle.font,
        color: labelStyle.color,
        text: valueRangeLoc[i].text,
        x: x + xArea/2,
        y: y + 20
      });
      //x 轴单位
      fillText({
        font: labelStyle.font,
        color: labelStyle.color,
        text: valueRangeLoc[i].val,
        x: x + xArea/2,
        y: y -valueRangeLoc[i].val*yArea - 20
      });
      console.log(valueRangeLoc[i].val)
      //绘制柱状图（X坐标，Y坐标，宽度，高度)
      context.fillRect(x,y,xArea,-valueRangeLoc[i].val*yArea);
    }
    context.stroke()
  }

  // 绘制每帧多边形画布
  var drawInner = function (cp, valueRangeLoc, borderLoc, innerLoc, valueSum) {
    drawLine({
      lines: borderLoc,
      style: borderStyle.color,
      width: borderStyle.width
    });

    drawLine({
      lines: valueRangeLoc,
      style: valueRangeStyle.border.color,
      width: valueRangeStyle.border.width,
      fill: valueRangeStyle.background
    });

    for (var j = 0; j < borderLoc.length; j++) {
      drawLine({
        lines: [{ x: cp[0], y: cp[1] }, borderLoc[j]],
        style: splitLineStyle.color
      });
    }

    drawLine({
      lines: innerLoc,
      fill: innerStyle.background
    });

    fillText({
      font: titleStyle.font,
      color: titleStyle.color,
      text: options.title.replace('{v}', valueSum),
      x: cp[0],
      y: cp[1]
    });

    for (var k = valueRangeLoc.length - 1; k >= 0; k--) {
      var x = valueRangeLoc[k].x,
        y = valueRangeLoc[k].y;
      context.beginPath();
      context.moveTo(x, y);
      context.arc(x, y, valueRangeStyle.arrow, 0, Math.PI * 2);
      context.closePath();
      context.strokeStyle = valueRangeStyle.border.color;
      context.lineWidth = valueRangeStyle.border.width;
      context.stroke();
      context.fillStyle = '#fff';
      context.fill();
    }
  }
  // 设置舞台，方便画布清楚和重绘
  var calcRedrawPath = function (borderLoc) {
    var startLoc = borderLoc[0];
    var minX = startLoc.x,
      minY = startLoc.y,
      maxX = startLoc.x,
      maxY = startLoc.y;

    for (var i = 1; i < borderLoc.length; i++) {
      var loc = borderLoc[i];
      minX = loc.x < minX ? loc.x : minX;
      minY = loc.y < minY ? loc.y : minY;
      maxX = loc.x > maxX ? loc.x : maxX;
      maxY = loc.y > maxY ? loc.y : maxY;
    }

    var borderW = borderStyle.width;
    return {
      x: minX - borderW,
      y: minY - borderW,
      w: maxX - minX + borderW * 2,
      h: maxY - minY + borderW * 2
    };
  }
  // 全部元素开始画
  var drawing = function (cp, w, h) {
    var polar = options.polar,
      polarCount = polar.length,
      data = options.data;
    // 判断使用图形
    if (exports.type == "radar") { 
      var radius = options.radius,
        angles = [],
        borderLoc = [],
        dataTemp = [];
      for (var i = 0; i < polarCount; i++) {
        dataTemp.push(0);
        var end = i * (2 / polarCount) - 0.5;
        angles.push(end);
        borderLoc.push(calcLocation(cp, radius, Math.PI * end));
      }
      context.fillStyle = "#fff";
      context.fillRect(0, 0, w, h);
      var redrawPath = calcRedrawPath(borderLoc);
      // 更新数据重新绘制画布
      var timer = setInterval(function () {
        var eqCount = 0,
          valueSum = 0,
          valueRangeLoc = [],
          innerLoc = [];
        for (var i = 0; i < polarCount; i++) {
          dataTemp[i] = dataTemp[i] + 5 > data[i] ? data[i] : dataTemp[i] + 5;
          if (dataTemp[i] === data[i]) {
            ++eqCount;
          }
          var end = angles[i];
          // inner
          var ir = innerStyle.radius;
          innerLoc.push(calcLocation(cp, innerStyle.radius, Math.PI * end));
          // valueRange
          var vr = dataTemp[i] / polar[i].max * (radius - ir) + ir;
          valueRangeLoc.push(calcLocation(cp, vr, Math.PI * end));
          valueSum += dataTemp[i];
        }
        context.clearRect(redrawPath.x, redrawPath.y, redrawPath.w, redrawPath.h);
        context.fillStyle = "#fff";
        context.fillRect(redrawPath.x, redrawPath.y, redrawPath.w, redrawPath.h);
        if (eqCount === polarCount) {
          clearInterval(timer);
          drawLabel(borderLoc, polar, cp)
          valueSum = polar[0] ? polar[0].max : 0
          promise.then(function (callback) {
            callback(textAreas)
          })
        }
        drawInner(cp, valueRangeLoc, borderLoc, innerLoc, valueSum);

      }, 60);
    } else {
      var valueRangeLoc = [],valueSum = polar[0] && polar[0].max || 0,step=2;
     
      var timer = function(){
        
        timer.sum = 0;
        timer.t = setTimeout(function ()  {
          context.clearRect(0, 0, w, h);
          context.fillStyle = "#fff";
          context.fillRect(0, 0, w, h);
          for(var i = 0; i < polarCount; i++) {
            valueRangeLoc[i] = valueRangeLoc[i] || { val: 0 } 
            valueRangeLoc[i].text = polar[i].text
            valueRangeLoc[i].val= valueRangeLoc[i].val + step > data[i] ? data[i] : valueRangeLoc[i].val + step
            timer.sum ++
          }
          drawCloum(cp,300,260,valueRangeLoc,borderStyle,valueSum)
          clearTimeout(timer.t)
          if( timer.sum < polar.length ) {
            timer()
          } else if (timer.sum === polar.length) {
            timer()
            timer.sum ++
            promise.then(function (callback) {
              callback(textAreas)
            })
          }
        },60)
      }
      timer()
    }
  }

  var exports = {};
  // 初始化设置值，并返回对象（链式调用）
  exports.setOptions = function (opts) {
    exports.type = opts.polar.length < 3 ? "Column" : "radar";
    extend(options, opts);
    styles = options.styles;
    borderStyle = styles.border;
    splitLineStyle = styles.splitLine;
    titleStyle = styles.title,
      valueRangeStyle = styles.valueRange,
      innerStyle = styles.inner;
    labelStyle = styles.label;
    promise = null;
    element = typeof options.element == 'string' ? document.getElementById(options.element) : options.element;
    context = element.getContext('2d');
    return exports;
  };
  // 初始化函数
  exports.init = function () {
    var w = element.offsetWidth,
      h = element.offsetHeight;

    var ofs = options.styles.offset;
    drawing([w / 2 + ofs.left, h / 2 + ofs.top], w, h);
    return exports;
  }

  //目标区域
  exports.textArea = function (callback) {
    promise = new Promise(function (resolve, reject) { resolve(callback) })
  };

  return exports;

})();
