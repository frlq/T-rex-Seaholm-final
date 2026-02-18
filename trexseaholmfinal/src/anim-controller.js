export const animationComponent = {
  schema: {
    mixerId: {type: 'string', default: ''},
  },

  init() {
    this.previousClip = null
    this.action = null
    this.mixer = null
    this.clips = []
    this.availableClipNames = []

    this.el.addEventListener('model-loaded', () => {
      this.setupAnimations()
    })
  },

  setupAnimations() {
    const model = this.el.getObject3D('mesh')
    if (!model) return

    this.mixer = new THREE.AnimationMixer(model)
    this.clips = this.el.components['gltf-model'].model.animations
    this.availableClipNames = this.clips.map(c => c.name)
    console.log('Available clips:', this.availableClipNames)

    this.playRandomClip()
  },

  playRandomClip() {
    if (!this.clips || this.clips.length === 0 || !this.mixer) return

    let nextClip
    do {
      nextClip = this.clips[Math.floor(Math.random() * this.clips.length)]
    } while (nextClip.name === this.previousClip?.name)

    this.previousClip = nextClip
    console.log('Playing animation clip:', nextClip.name)

    const newAction = this.mixer.clipAction(nextClip)
    newAction.reset()
    // newAction.setLoop(THREE.LoopTwice)
    newAction.setLoop(THREE.LoopRepeat, 2)
    newAction.clampWhenFinished = true

    // If previous action exists, fade between them
    if (this.action) {
      newAction.crossFadeFrom(this.action, 0.4, false)  // 0.4s fade duration
      this.action.stop()  // Clean up after fade
    }

    newAction.play()
    this.action = newAction

    // Setup finish listener
    this.mixer.removeEventListener('finished', this._onFinish)
    this._onFinish = e => this.onAnimationFinished(e)
    this.mixer.addEventListener('finished', this._onFinish)
  },

  onAnimationFinished(e) {
    // Ensure the finished clip is the one we were watching
    const finishedClipName = e.action.getClip().name
    if (finishedClipName === this.previousClip?.name) {
      this.mixer.removeEventListener('finished', this.onAnimationFinished.bind(this))
      setTimeout(() => this.playRandomClip(), 400)  // Wait briefly before playing the next
    }
  },

  tick(time, delta) {
    // Let mixer drive the animation
    if (this.mixer) this.mixer.update(delta / 1000)
  },

  remove() {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer.removeEventListener('finished', this._onFinish)
    }
  },
}

// export const animationComponent = {
//   schema: {
//     clip: {type: 'string', default: ''},  // Optional default clip
//   },

//   init() {
//     this.previousClip = null;
//     const {el} = this

//     el.addEventListener('model-loaded', () => {
//       const mesh = el.getObject3D('mesh')

//       if (!mesh || !mesh.animations || mesh.animations.length === 0) {
//         console.warn('No animations found on this model.')
//         return
//       }

//       // Store all animation clips
//       this.allClips = mesh.animations.map(clip => clip.name)
//       console.log('Available clips:', this.allClips)

//       // Get the A-Frame animation-mixer component
//       const mixerComponent = el.components['animation-mixer']
//       if (!mixerComponent) {
//         console.warn('animation-mixer component not found on element.')
//         return
//       }

//       this.mixer = mixerComponent.mixer

//       // Play the first random animation
//       this.playRandomAnimation()
//     })
//   },

//   playRandomAnimation() {
//     if (!this.mixer || !this.allClips || this.allClips.length === 0) return

//     const randomIndex = Math.floor(Math.random() * this.allClips.length)
//     const selectedClip = this.allClips[randomIndex]
//     console.log(`Playing animation clip: ${selectedClip}`)

//     // Stop all current actions
//     this.mixer.stopAllAction()

//     const clip = THREE.AnimationClip.findByName(this.el.getObject3D('mesh').animations, selectedClip)
//     const action = this.mixer.clipAction(clip)

//     if (!action) {
//       console.warn(`Could not find clip action for: ${selectedClip}`)
//       return
//     }

//     action.reset()
//     action.setLoop(THREE.LoopOnce)
//     action.clampWhenFinished = true
//     action.play()

//     // Listen for animation finished
//     action._listener = () => {
//       action.removeEventListener('finished', action._listener)
//       setTimeout(() => this.playRandomAnimation(), 500)
//     }

//     this.mixer.addEventListener('finished', (e) => {
//     const clipName = e.action.getClip().name;
//     console.log('Finished animation:', clipName);
//     // You can randomize and play next animation here
//   });

//   },
// }

//-------------
// export const animationComponent = {
//   schema: {
//     clip: {type: 'string', default: ''},  // Optional default clip name
//   },

//   init() {
//     const {el} = this

//     el.addEventListener('model-loaded', () => {
//       const mesh = el.getObject3D('mesh')

//       if (mesh && mesh.animations && mesh.animations.length > 0) {
//         // Get all animation clip names
//         const allClips = mesh.animations.map(clip => clip.name)
//         console.log('Available clips:', allClips)

//         // Randomly choose one if none provided in schema
//         let selectedClip = this.data.clip
//         if (!selectedClip || !allClips.includes(selectedClip)) {
//           const randomIndex = Math.floor(Math.random() * allClips.length)
//           selectedClip = allClips[randomIndex]
//         }

//         console.log(`Playing animation clip: ${selectedClip}`)

//         // Apply animation
//         el.setAttribute('animation-mixer', {clip: selectedClip})
//       } else {
//         console.warn('No animations found on this model.')
//       }
//     })
//   },
// }

// export const animationComponent = {
//   schema: {
//     clips: {type: 'string'},  // all clips
//   },

//   init() {
//     this.trexModel = document.getElementById()
// this.animClips = trexModel.clips
//         console.log(`animClips=${this.animClips}`)
//         const allClips = this.animClips.split(' ')

//           const randomIndex = Math.floor(Math.random() * (allClips.length))
//         const randomAnim = allClips[randomIndex]
//         console.log(`randIndex=${randomIndex}, randAnim=${randomAnim}`)

//         // Process script into timed captions
//     const words = scriptText.split(' ')  // each individual word gotten from script
//     const totalChunks = Math.ceil(words.length / chunkSize)  // how many sets of chunksize amt of words
//     const paceFactor = 1.03  // make slower
//     const interval = (duration / totalChunks) * paceFactor  // interval is time each word set takes

//     // create captions, array of chunks of words
//     this.captions = []
//     for (let i = 0; i < totalChunks; i++) {
//       const startTime = i * interval
//       const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ')  // slice script
//       this.captions.push({time: startTime, text: chunk})
//     }
//         newElementTrex.setAttribute('gltf-model', '#trexModel')
//         newElementTrex.setAttribute('animation-mixer', randomAnim)

//   }
