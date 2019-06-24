//logs.js
const util = require('../../utils/util.js')
import { mapData } from '../../utils/map'
import { decode } from '../../utils/decode'

Page({
  data: {
    logs: [],
    mapList: mapData
  },
  scale: 1,
  translate: {
    tx: 0,
    ty: 0
  },
  onLoad: function () {
    var data = decode(mapData)
    var colors = ["#ccc", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]
    const plat = wx.getSystemInfoSync()
    const width = plat.windowWidth
    const height = plat.windowHeight;
    this.rectW = width
    this.rectH = height
    this.ctx = wx.createCanvasContext('editor');
    var bounds= this.getBoundingBox(data)
    this.drawMap(width, height, bounds, data, this.ctx, colors)
    this.setupFps()
  },
  getBoundingBox(data) {
    var bounds = {}, coords;
    data = data.features;
    bounds.xMin = 180;
    bounds.xMax = 0;
    bounds.yMin = 90;
    bounds.yMax = 0
    for (var i = 0; i < data.length; i++) {
        var coorda = data[i].geometry.coordinates
        for (var k = 0; k < coorda.length; k++) {
            coords = coorda[k];
            if (coords.length == 1) {
                coords = coords[0]
            }
            for (var j = 0; j < coords.length; j++) {
                var longitude = coords[j][0];
                var latitude = coords[j][1];
                var point = {
                    x: longitude, // Transform “longitude” in some way
                    y: latitude // Transform “latitude” in some way
                }
                bounds.xMin = bounds.xMin < point.x ? bounds.xMin : point.x;
                bounds.xMax = bounds.xMax > point.x ? bounds.xMax : point.x;
                bounds.yMin = bounds.yMin < point.y ? bounds.yMin : point.y;
                bounds.yMax = bounds.yMax > point.y ? bounds.yMax : point.y;
            }
        }
    }
    return bounds;
  },
  drawMap(width, height, bounds, da, context, colors) {
    var coords, point;
    var data = da.features;
    var xScale = width / Math.abs(bounds.xMax - bounds.xMin);
    var yScale = height / Math.abs(bounds.yMax - bounds.yMin);
    var scale = xScale < yScale ? xScale : yScale;
    var xoffset=width/2.0-Math.abs(bounds.xMax - bounds.xMin)/2*scale
    var yoffset=height/2.0-Math.abs(bounds.yMax - bounds.yMin)/2*scale
      
    for (var i = 0; i < data.length; i++) {
      context.fillStyle = colors[0];
      var coorda = data[i].geometry.coordinates
      for (var k = 0; k < coorda.length; k++) {
        coords = coorda[k];
        if (coords.length == 1) {
          coords = coords[0]
        }
        for (var j = 0; j < coords.length; j++) {
          point = this.coordinateToPoint(coords[j][1], coords[j][0],bounds,scale,xoffset,yoffset)
          if (j === 0) {
            context.beginPath();
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
          
        }
        context.fill();
      }
    }
  },
  coordinateToPoint(latitude, longitude,bounds,scale,xoffset,yoffset) {
    return {
      x: (longitude - bounds.xMin) * scale+xoffset,
      y: (bounds.yMax - latitude) * scale+yoffset
    }
  },
  setupFps() {
    this.draw()
  },
  draw() {
    const color = '#ffffff'
    this.ctx.fillStyle = color // 设置填充色
    this.ctx.fillRect(0,0,this.rectW,this.rectH) // 设置矩形
    // this.drawPixels()
    const strokeColor = ["#ebebeb", "#d6d6d6"]
    this.drawGrid(strokeColor[0], this.gridSize())
    this.drawGrid(strokeColor[1], this.gridSize())
    this.ctx.draw()
  },
  gridSize() {
    return 10 * this.scale
  },
  drawGrid(color, width) {
    this.ctx.beginPath() // 开始
    this.ctx.setStrokeStyle(color)
    this.ctx.setLineWidth(1)
    for(var i = this.translate, s = i.tx % width, r = i.ty % width; s < this.rectW;) {
      this.ctx.moveTo(s, 0)
      this.ctx.lineTo(s, this.rectH)
      s += width
    }
    for(; r < this.rectH; ) {
      this.ctx.moveTo(0, r)
      this.ctx.lineTo(this.rectW, r)
      r += width
    }
    this.ctx.stroke()
  },
})
