//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    selectedColor: '#000000'
  },
  scale: 1,
  translate: {
    tx: 0,
    ty: 0
  },
  onLoad: function () {
    const plat = wx.getSystemInfoSync()
    const width = plat.windowWidth
    const height = plat.windowHeight;
    this.rectW = width
    this.rectH = height - 60
    this.ctx = wx.createCanvasContext('editor');
    this.setupFps()
    // this.setRepaint();
  },
  setupFps() {
    this.draw()
  },
  draw() {
    const color = '#ffffff'
    this.ctx.setFillStyle(color) // 设置填充色
    this.ctx.fillRect(0,0,this.rectW,this.rectH) // 设置矩形
    // this.drawPixels()
    const strokeColor = ["#ebebeb", "#d6d6d6"]
    this.drawGrid(strokeColor[0], this.gridSize())
    this.drawGrid(strokeColor[1], this.gridSize())
    this.ctx.draw()
  },
  gridSize() {
    return 15 * this.scale
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
  drawPixels() {

  },
  show(e) {
    console.log(e)
    const t = e.touches;
    const ts = this.translate
    if(t.length === 1 || t.length === 2) {
      this.editingAction = {
        pixels: []
      }
      this.gesture = {
        touches0: t,
        translate0: {
          tx: ts.tx,
          ty: ts.ty
        },
        scale0: this.scale,
      }
      setTimeout(function(){
        this.editingAction.pixels = this.fillBlock({
          x: x,
          y: y
        }, this.selectedColor())
      },500)
    }
  },
  // 选中颜色
  selectedColor() {
    return this.data.selectedColor
  }
})
