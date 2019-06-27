// pages/canvas/canvas.js
const decode = require('../../utils/decode.js')
const mapJson = require('../../json/china-contour.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollX: 0,
    scrollY: 0,
    windowWidth: 0,
    windowHeight: 0,
    canvasWidth: 1280,
    canvasHeight: 800,
    unitWidth: 10, // 网格单元格大小
    lineWidth: 0.5, // 网格线宽度
    lineColor: '#eee', // 网格线颜色
    fillUnit: [], // 填充单元格x、y轴集合
    context: null,
    bounds: {},
    userPosition: [{
      x:0,
      y:0
    },{
      x: 100,
      y: 100
    }],
    tempPosition: []
  },
  scale: 1,
  gesture: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    const res = wx.getSystemInfoSync()
    var context = wx.createCanvasContext('mapCanvas', this)
    let {
      windowWidth,
      windowHeight
    } = res
    this.setData({ // 设置scroll-view宽高是整个屏幕
      windowWidth,
      windowHeight,
      context
    }, () => {
      this.drawMap() // 初始化地图
      this.drawGrid() // 初始化网格
      this.data.context.draw()
      this.data.userPosition.map(item => {
        this.changeColor(item.x, item.y)
      })
    })
  },
  viewScroll(event) { // 不需要setData
    this.data.scrollX = event.detail.scrollLeft
    this.data.scrollY = event.detail.scrollTop
  },
  changeColor(x, y) {
    let list, red, green, blue, alpha, average
    const that = this
    wx.canvasGetImageData({
      canvasId: 'mapCanvas',
      x: x,
      y: y,
      width: that.data.unitWidth * that.scale,
      height: that.data.unitWidth * that.scale,
      success: function(res) {
        let flag = res.data.indexOf(245) !== -1
        for(let i = 0,len = res.data.length;i<len;i+= 4) {
          red = res.data[i]
          green = res.data[i + 1]
          blue = res.data[i + 2]
          alpha = res.data[i + 3]
          average = Math.floor((red + green + blue) / 3)
          if( flag || res.data[i] == 255) {
            res.data[i] = 255
          } else {
            res.data[i] = 1
          }
          res.data[i + 1] = 0
          res.data[i + 2]= 0
          res.data[i + 3]= 255
        }
        list = res.data
        wx.canvasPutImageData({
          canvasId: 'mapCanvas',
          x: x,
          y: y,
          width: that.data.unitWidth * that.scale,
          height: that.data.unitWidth * that.scale,
          data: list,
          success: function(result) {
            console.log(result)
          }
        })
      }
    })
  },
  touchstart(event) {
    const touch = event.touches
    const that = this
    if(touch.length === 1 || touch.length === 2) {
      this.gesture = {
        touches0: touch,
        scale0: this.scale,
        lastTouches: touch,
        moved: false,
        canceled: false
      }
      if(touch.length === 1) {
        let touchPosition = touch[0] // 获取点击的坐标
        let col = Math.ceil((touchPosition.pageX + this.data.scrollX) / this.data.unitWidth) // 第几列
        let row = Math.ceil((touchPosition.pageY + this.data.scrollY) / this.data.unitWidth) // 第几行
        let type, colWidth = col * this.data.unitWidth, rowWidth = row * this.data.unitWidth
        this.changeColor(colWidth - this.data.unitWidth, rowWidth - this.data.unitWidth)
      }
    }
  },
  touchmove(event) {
    console.log(event)
    const touch = event.touches
    const that = this
    const { touches0, scale0, lastTouches } = this.gesture
    if(touch.length === 2) {
    }
  },
  touchend() {
    console.log(3)
  },
  mapTap(event) { // 点击网格
    let touchPosition = event.detail // 获取点击的坐标
    let col = Math.ceil((touchPosition.x + this.data.scrollX) / this.data.unitWidth) // 第几列
    let row = Math.ceil((touchPosition.y + this.data.scrollY) / this.data.unitWidth) // 第几行
    let bounds = this.data.bounds
    let type, colWidth = col * this.data.unitWidth, rowWidth = row * this.data.unitWidth
    this.changeColor(colWidth - this.data.unitWidth, rowWidth - this.data.unitWidth)
    return
    let fillUnit = this.data.fillUnit
    let random = Math.random(),
      area = 1 // area表示以点击单元格为中心向外扩散多少圈
    if (random <= 0.333) {
      area = 0
    } else if (random <= 0.667) {
      area = 1
    } else if (random <= 1) {
      area = 2
    }
    fillUnit.push([col, row, area])
    this.setData({
      fillUnit
    })
    let cur = 0
    let myInterval = setInterval(() => {
      if (cur <= area) {
        fillUnit[fillUnit.length - 1][2] = cur
        this.drawMap()
        this.drawGrid() // 初始化网格
        this.drawFillUnit(fillUnit, type)
        // this.data.context.draw()
        
        cur++
      } else {
        clearInterval(myInterval)
      }
    }, 50)
  },
  drawGrid() { // 绘制网格
    var {
      context,
      lineColor,
      unitWidth,
      lineWidth,
      canvasWidth,
      canvasHeight
    } = this.data
    context.setStrokeStyle(lineColor)
    context.setLineWidth(lineWidth)
    for (let i = unitWidth  * this.scale + lineWidth; i < canvasWidth; i += unitWidth * this.scale) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, canvasHeight);
      context.stroke();
    }
    for (let i = lineWidth; i < canvasHeight; i += unitWidth * this.scale) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(canvasWidth, i);
      context.stroke();
    }
  },
  drawFillUnit(fillUnit = [], type) { // 绘制填充单元格
    var {
      context,
      unitWidth
    } = this.data
    console.log(type)
    if(type == 1) {
      context.setFillStyle('red')
    } else {
      context.setFillStyle('yellow')
    }
    for (let i = 0; i < fillUnit.length; i++) {
      context.beginPath()
      let col = fillUnit[i][0],
        row = fillUnit[i][1],
        area = fillUnit[i][2],
        colLen = col * unitWidth,
        rowLen = row * unitWidth
      context.fillRect(unitWidth * (col - 1 - area), unitWidth * (row - 1 - area), unitWidth * (1 + 2 * area), unitWidth * (1 + 2 * area))
    }
  },

  drawMap() { // 绘制地图
    var mapData = decode.decode(mapJson.data)
    var colors = ["#f5f5f5"]
    var context = this.data.context
    var bounds = this.getBoundingBox(mapData)
    var height = Math.ceil(this.data.canvasHeight);
    var width = Math.ceil(this.data.canvasWidth);
    //var center = this.coordinateToPoint(this.options.center[0], this.options.center[1]);
    var coords, point;
    var data = mapData.features;

    var xScale = width / Math.abs(bounds.xMax - bounds.xMin);
    var yScale = height / Math.abs(bounds.yMax - bounds.yMin);
    var scale = xScale < yScale ? xScale : yScale;
    var xoffset = width / 2.0 - Math.abs(bounds.xMax - bounds.xMin) / 2 * scale
    var yoffset = height / 2.0 - Math.abs(bounds.yMax - bounds.yMin) / 2 * scale

    for (var i = 0; i < data.length; i++) {
      context.fillStyle = colors[i % 20];
      var coorda = data[i].geometry.coordinates
      for (var k = 0; k < coorda.length; k++) {
        coords = coorda[k];
        if (coords.length == 1) {
          coords = coords[0]
        }
        for (var j = 0; j < coords.length; j++) {
          point = this.coordinateToPoint(coords[j][1], coords[j][0], bounds, scale, xoffset, yoffset)
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
  coordinateToPoint(latitude, longitude, bounds, scale, xoffset, yoffset) {
    return {
      x: (longitude - bounds.xMin) * scale + xoffset,
      y: (bounds.yMax - latitude) * scale + yoffset
    }
  },
  getBoundingBox(data) {
    var bounds = {},
      coords;
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
    // console.log(bounds)
    this.setData({
      bounds
    })
    return bounds;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})