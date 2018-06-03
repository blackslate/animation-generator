"use strict"

;(function generatorLoaded(){

  let imageArray = [
    "img/1_black.png"
  , "img/2_red.png"
  , "img/3_yellow.png"
  , "img/4_green.png"
  , "img/5_cyan.png"
  ]

  class Generator {
    constructor (imageArray) {
      this.sourceImages = []
      this.loading = imageArray.length
      this._getSourceImages(imageArray)
      this.model = document.querySelector("img.model")
      this.mask = document.querySelector("img.mask")
    }

    _getSourceImages(imageArray) {
      for ( let ii = 0; ii < imageArray.length; ii++ ) {
        let image = new Image()
        image.src = imageArray[ii]
        image.onload = this._imageLoaded.bind(this)
        image.onerror = this._imageLoaded.bind(this)
        this.sourceImages.push(image)
      }
    }

    _imageLoaded(event) {
      let target = event.target

      if (event.type === "error") {
        this._showLoadError(target)
        return
      }

      let src = target.src
      if (!--this.loading) {
        this.generateImage()
        this.generateMask()
      }
    }

    _showLoadError (target) {
      console.log("ERROR: source image for", target, "failed to load")
    }

    generateImage() {
      let count = imageArray.length
      let image = this.sourceImages[0]
      let canvas  = document.createElement('canvas')
      let context = canvas.getContext("2d")
      let x = 0
      let y = 0
      let width = image.width
      let w = 4
      let h = image.height
      let ii = 0

      let s = 1.86
      canvas.height = image.height * s
      canvas.width = image.width * s

      while (x < width) {
        context.drawImage(image, x, y, w, h, x*s, y*s, w*s, h*s);

        ii = (++ii % count)
        x += w
        image = this.sourceImages[ii]
      }

      this.model.src = canvas.toDataURL()
    }

    generateMask() {

    }
  }

  window.illusionGenerator = new Generator(imageArray)
})()