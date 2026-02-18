// parse the string into object
function parseAttributeString(attrString) {
  // console.log('attrString:', attrString)  // check what it really is

  const obj = {}
  if (typeof attrString !== 'string') {
    console.warn('Expected a string but got:', typeof attrString)
    return obj
  }

  attrString.split(';').forEach((pair) => {
    const [key, value] = pair.split(':').map(s => s.trim())
    if (key && value) obj[key] = value
  })
  return obj
}

// component creation
export const captionComponent = {
  schema: {
    script: {type: 'string', default: 'Default message'},  // the full script
    duration: {type: 'number'},  // audio length in seconds
    chunkSize: {type: 'int', default: 7},  // number of words per caption
    audioId: {type: 'string'},
    textId: {type: 'string'},
  },
  init() {
    // _----GATHER VARIABLES-------
    this.currentCaptionIndex = 0
    this.captionController = document.getElementById('captionController')
    const rawInfo = this.captionController.getAttribute('info')
    const captionData = this.captionController.getAttribute('captions')  // object with property `script`
    if (!rawInfo || !captionData) {
      console.error('Caption data or raw info not found'); return
    }

    // all script text
    const scriptText = captionData.script

    // ------- DATA CLEAN ---------
    // if rawinfo string then parse into object, else keep as is or if null/undefined then make empty
    const infoData = typeof rawInfo === 'string' ? parseAttributeString(rawInfo) : rawInfo || {}
    if (!infoData) {
      console.error('info data not found')
      return
    }

    // chunkSize and duration come from infoData, NOT scriptText
    const chunkSize = parseInt(infoData.chunkSize, 10) || 6  // fallback default
    const duration = parseFloat(infoData.duration) || 0

    // ----TEXT MANIPULATION------
    this.captionText = document.getElementById(infoData.textId)  // text element used to display caption

    if (!this.captionText) {
      console.error(`[captions] Couldn't find text entity: textId=${infoData.textId}`)
      return
    }

    // Process script into timed captions
    const words = scriptText.split(' ')  // each individual word gotten from script
    const totalChunks = Math.ceil(words.length / chunkSize)  // how many sets of chunksize amt of words
    const paceFactor = 1  // make slower
    const interval = (duration / totalChunks) * paceFactor  // interval is time each word set takes

    // create captions, array of chunks of words
    this.captions = []
    for (let i = 0; i < totalChunks; i++) {
      const startTime = i * interval
      const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ')  // slice script
      this.captions.push({time: startTime, text: chunk})
    }

    // -------AUDIO MANIPULATE--------------
    // listen for trex element created
    this.el.sceneEl.addEventListener('trex-added', (event) => {
      const soundEntity = event.target
      if (soundEntity && soundEntity.components.sound) {
        this.setupSound(soundEntity)
      }
    })

    // fallback - Poll for sound entity every 100ms
    this.checkSoundEntityInterval = setInterval(() => {
      const soundEntity = document.querySelector('[sound][gltf-model="#trexModel"]')
      if (soundEntity && soundEntity.components.sound) {
        clearInterval(this.checkSoundEntityInterval)
        this.setupSound(soundEntity)
      }
    }, 100)
  },

  // once sound loaded, set audio ready
  setupSound(soundEntity) {
    soundEntity.addEventListener('sound-loaded', () => {
      // console.log('Sound loaded and ready.')
      this.audio = soundEntity.components.sound.pool.children[0]
      this.audioReady = true

      this.audio.addEventListener('play', () => {
        // console.log('Internal audio started playing')
        this.audioReady = true
      })
    })
  },

  tick() {
    // console.log('Audio:', this.audio, 'Time:', this.audio?.currentTime, 'Text:', this.captionText, 'Index:', this.currentCaptionIndex, '/', this.captions?.length)

    if (!this.audioReady || !this.audio || !this.captionText || this.currentCaptionIndex >= this.captions.length) return

    // figure out audio elapsing of time
    const audioContext = this.audio.context
    const startedAt = this.audio._startedAr || 0
    const currentTime = audioContext.currentTime - startedAt

    // set up next caption and if time has hit for the next caption, switch it out --> keep going til captionindex >=  captions.len
    const nextCaption = this.captions[this.currentCaptionIndex]
    // console.log('Audio time:', this.audio.currentTime, 'Next caption at:', this.captions[this.currentCaptionIndex].time)
    if (currentTime >= nextCaption.time) {
      // this.captionText.setAttribute('text', 'value', nextCaption.text)
      this.captionText.textContent = nextCaption.text
      this.currentCaptionIndex++
    }
  },

}
