export const captionComponent = {
  schema: {
    script: {type: 'string'},  // the full script
    duration: {type: 'number'},  // audio length in seconds
    chunkSize: {type: 'int', default: 6},  // number of words per caption
    audioId: {type: 'string'},
    textId: {type: 'string'},
  },

  init() {
    // const newCaptionComp = document.createElement('a-entity')

    // const fullScript = 'Hello, young explorers! ...'
    // const audioDuration = 50

    // newCaptionComp.setAttribute('caption-sync', {
    //   script: fullScript,
    //   duration: audioDuration,
    //   chunkSize: 5,
    //   audioId: 'trexSound',
    //   textId: 'captionText',
    // })

    const {audioId, textId, script, duration, chunkSize} = this.data

    this.audio = document.getElementById(this.data.audioId)
    this.captionText = document.getElementById(this.data.textId)
    // this.captionText = document.querySelector(`#${textId}`)
    this.currentCaptionIndex = 0


    // capture null
    if (!this.audio || !this.captionText) {
      console.error(`[captions] Couldn't find audio or text entity: audioId=${this.data.audioId}, textId=${this.data.textId}`)
      return
    }

    // Process script into timed captions
    const words = this.data.script.split(' ')
    const totalChunks = Math.ceil(words.length / this.data.chunkSize)  // how many sets of chunksize amt of words
    const interval = this.data.duration / totalChunks  // interval is time each word set takes

    this.captions = []
    //
    for (let i = 0; i < totalChunks; i++) {
      const startTime = i * interval
      const chunk = words.slice(i * this.data.chunkSize, (i + 1) * this.data.chunkSize).join(' ')  // slice script
      this.captions.push({time: startTime, text: chunk})
    }
  },

  tick() {
    if (!this.audio || !this.audio.currentTime || this.currentCaptionIndex >= this.captions.length) return

    const {currentTime} = this.audio
    const nextCaption = this.captions[this.currentCaptionIndex]

    if (currentTime >= nextCaption.time) {
      this.captionText.setAttribute('value', nextCaption.text)
      this.currentCaptionIndex++
    }
  },

}

// window.addEventListener('DOMContentLoaded', () => {
//   const captionController = document.getElementById('captionController')

//   if (!captionController) {
//     console.error('captionController entity not found in DOM')
//     return
//   }

//   const fullScript = 'Hello, young explorers! ...'
//   const audioDuration = 50

//   captionController.setAttribute('caption-sync', {
//     script: fullScript,
//     duration: audioDuration,
//     chunkSize: 5,
//     audioId: 'trexSound',
//     textId: 'captionText',
//   })
// })
