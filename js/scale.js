"use strict"

;(function animationsLoaded(paperAnimations){

  if (!paperAnimations) {
    paperAnimations = window.paperAnimations = {}
  }


  class Slider {

    constructor (options) {
      this.range = options.range
      this.number = options.number
      this.callback = options.callback
      this.useShiftKey = options.useShiftKey || false // x 10
      this.useCtrlKey = options.useCtrlKey || false   // ÷ 10

      this.value = options.value || this.number.valueAsNumber
      this.shiftKey = false
      this.ctrlKey = false

      this.range.max  = this.number.max
      this.range.min  = this.number.min
      this.range.step = this.number.step

      let listener = this.rangeChange.bind(this)
      this.range.addEventListener("input", listener, true)
      this.range.addEventListener("change", listener, true)

      listener = this.valueChange.bind(this)
      this.number.addEventListener("input", listener, true)
      this.number.addEventListener("change", listener, true)

      // Detect if the shiftKey is down during input or change event.
      // NOTE: mousedown is triggered before the first input or change
      // event, but releasing or pressing a modifier key during a
      // series of input events will not trigger a mousedown, so the
      // value of shiftKey or ctrlKey will not change dynamically.
      listener = this.click.bind(this)
      document.body.addEventListener("mousedown", listener, true)
    }


    initialize () {
      this.valueChange( { target: { value: this.value } }, true )
    }

   
    rangeChange (event) {
      let value = event.target.valueAsNumber
      this._treatRangeChange(value)
    }


    _treatRangeChange(value) {
      value = this._snap(value)

      this.setValue(value)

      this.callback(this.value)
    }


    valueChange (event, delayCallback) {
      let value = parseInt(event.target.value, 10)
      this._treatValueChange(value, delayCallback)
    }


    _treatValueChange(value, delayCallback) {
      this.setValue(value)

      if (delayCallback) {
        setTimeout(() => {
          this.callback(value)
        }, 0)
      } else {
        this.callback(value)
      }
    }


    click (event) {
      this.shiftKey = this.useShiftKey && event.shiftKey
      this.ctrlKey = this.useCtrlKey && event.ctrlKey
    }


    setValue(value, options = {}) {
      value = Math.max(this.number.min,Math.min(value,this.number.max))
      this.value = value

      this.range.value = this.number.value = value
    }


    _snap (value) {
      if (this.shiftKey) {
        value = Math.round(value * 10) / 10
      } else if (!this.ctrlKey) {
        value = Math.round(value * 100) / 100
      }

      return value
    }
  }


  /**
   * @class  FractionalSlider
   * 
   * Used to combine one input[type=range] and one input[type=number]
   * element to create a slider with numerical input. The range input
   * uses a logarithmic scale. Pressing the Shift or Ctrl keys affects
   * the granularity of the output number.
   */
  class FractionalSlider extends Slider{
    constructor (options) {
      super(options)
      // this.range = options.range
      // this.number = options.number
      // this.callback = options.callback

      // this.value = options.value || this.number.valueAsNumber
      // this.shiftKey = false
      // this.ctrlKey = false

      this.maxLog  = Math.log(this.number.max)
      this.sigFigs = 1 / this.number.step

      this.range.max = "1"
      if (this.number.min) {
        this.range.min = - (1 / this.number.max) / this.number.min
      } else {
        this.range.min = -10000
      }
      // this.range.step = this.number.step

      // this.valueChange( { target: { value: this.value } }, true )

      // let listener = this.rangeChange.bind(this)
      // this.range.addEventListener("input", listener, true)
      // this.range.addEventListener("change", listener, true)

      // listener = this.valueChange.bind(this)
      // this.number.addEventListener("input", listener, true)
      // this.number.addEventListener("change", listener, true)

      // // Detect if the shiftKey is down during input or change event.
      // // NOTE: mousedown is triggered before the first input or change
      // // event, but releasing or pressing a modifier key during a
      // // series of input events will not trigger a mousedown, so the
      // // value of shiftKey or ctrlKey will not change dynamically.
      // listener = this.click.bind(this)
      // document.body.addEventListener("mousedown", listener, true)
    }
   

    rangeChange (event) {
      let value = event.target.valueAsNumber
      value = Math.exp(value * this.maxLog)
      this._treatRangeChange(value)
    }


    valueChange (event, delayCallback) {
      let value = this._magnitude(parseFloat(event.target.value))

      this._treatValueChange (value, delayCallback)
    }


    // click (event) {
    //   this.shiftKey = event.shiftKey
    //   this.ctrlKey = event.ctrlKey
    // }


    setValue(value, options = {}) {
      value = Math.max(this.number.min,Math.min(value,this.number.max))
      value = this._round(value)
      this.value = value

      // if (!options.notRange) {
        this.range.value = Math.log(value ) / this.maxLog
      // }

      // if (!options.notNumber) {
        this.number.value = value
      // }
    }


    _magnitude(value) {
      let delta = this._round(value - this.value)

      if (this.shiftKey) {
        value = this.value + delta * 100
      } else if (!this.ctrlKey) {
        value = this.value + delta * 10
      } else {
        delta = false
      }

      return value
    }


    _snap (value) {
      if (this.shiftKey) {
        value = Math.round(value * 10) / 10
      } else if (!this.ctrlKey) {
        value = Math.round(value * 100) / 100
      }

      return value
    }


    _round(value) {
      return Math.round(value * this.sigFigs) / this.sigFigs
    }

  }


  class Scaler {

    constructor () {
      this.initial = undefined
      this.value = this._getSavedValue()
      this.model = document.querySelector("img.model")
      this.mask = document.querySelector("img.mask")

      let options = {
        range: document.querySelector("input.scale[type=range]")
      , number: document.querySelector("input.scale[type=number]")
      , value: this.value
      , callback: this.update.bind(this)
      , useShiftKey: true
      , useCtrlKey: true
      }

      this.slider = new FractionalSlider (options)
      this.slider.initialize()
    }


    update (value) {
      if (!this.initial) {
        this.initial = parseInt(this.model.width)
      }

      let width = (this.initial * value)
      localStorage.setItem('scaleValue', value)

      width += "px"
      this.model.style.width = width
      this.mask.style.width = width
    }


    _getSavedValue() {
      let value = parseFloat(localStorage.getItem('scaleValue'))
      return value || undefined // may be NaN
    }
  }


  class FrameCounter {

    constructor () {
      this.initial = undefined
      this.value = this._getSavedValue()

      let options = {
        range: document.querySelector("input.frames[type=range]")
      , number: document.querySelector("input.frames[type=number]")
      , value: this.value
      , callback: this.update.bind(this)
      }

      this.slider = new Slider (options)
      this.slider.initialize()  
    }


    update (value) {
      localStorage.setItem('frameCount', value)
    }


    _getSavedValue() {
      let value = parseFloat(localStorage.getItem('frameCount'))
      return value || undefined // may be NaN
    }
  }

  paperAnimations.scaler = new Scaler()
  paperAnimations.counter = new FrameCounter()

})(window.paperAnimations)