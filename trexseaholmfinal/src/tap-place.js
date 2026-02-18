
export const tapPlaceComponent = {
  schema: {
    min: {default: 6},
    max: {default: 10},
  },
  init() {
    const ground = document.getElementById('ground')
    this.prompt = document.getElementById('promptText')

    // initialize bird position offsets
    const birdYOffset = 10
    const birdZOffset = 8
    const birdXOffset = 2

    // initialize cam and posiion for making models face cam
    const camera = document.getElementById('camera')
    const cameraWorldPos = new THREE.Vector3()
    camera.object3D.getWorldPosition(cameraWorldPos)

    // set models scale size
    const birdScale = 4
    const trexScale = 58  // 66 is about human size
    let hasClicked = false

    ground.addEventListener('click', (event) => {
      if (!hasClicked) {
        // prevent users from populating more
        hasClicked = true

        // Dismiss the prompt text.
        this.prompt.style.display = 'none'

        // Create new entity for the new object
        const newElementBird = document.createElement('a-entity')
        const newElementTrex = document.createElement('a-entity')
        const trexModel = document.getElementById('trexModel')

        // The raycaster gives a location of the touch in the scene
        const touchPoint = event.detail.intersection.point

        // Clone the touchPoint so we don't mutate it for the Trex
        const birdPosition = {...touchPoint}
        birdPosition.y += birdYOffset
        birdPosition.z += birdZOffset
        birdPosition.x += birdXOffset

        newElementBird.setAttribute('position', birdPosition)
        newElementTrex.setAttribute('position', touchPoint)

        // const randomYRotation = Math.random() * 360
        // direction from object to camera
        const dx = cameraWorldPos.x - touchPoint.x
        const dz = cameraWorldPos.z - touchPoint.z
        const angle = Math.atan2(dx, dz) * (180 / Math.PI)

        newElementBird.setAttribute('rotation', `0 ${angle} 0`)
        newElementTrex.setAttribute('rotation', `0 ${angle} 0`)

        // const randomScale = Math.floor(Math.random() * (Math.floor(this.data.max) - Math.ceil(this.data.min)) + Math.ceil(this.data.min))

        newElementBird.setAttribute('visible', 'false')
        newElementBird.setAttribute('scale', '0.0001 0.0001 0.0001')
        newElementTrex.setAttribute('scale', '0.0001 0.0001 0.0001')
        newElementTrex.setAttribute('visible', 'false')

        // doesn't allow object to have shadow casted
        // newElementBird.setAttribute('shadow', {
        //   receive: false,
        // })

        newElementBird.setAttribute('gltf-model', '#birdModel')
        newElementBird.setAttribute('animation-mixer', '')

        newElementTrex.setAttribute('gltf-model', '#trexModel')
        newElementTrex.setAttribute('animation-mixer', '')
        newElementTrex.setAttribute('anim-controller', '')
        newElementTrex.setAttribute('sound', {
          src: '#trexSound',
          autoplay: true,
          positional: true,
          volume: 5,
        })

        this.el.sceneEl.appendChild(newElementBird)
        this.el.sceneEl.appendChild(newElementTrex)

        newElementBird.addEventListener('model-loaded', () => {
        // Once the model is loaded, we are ready to show it popping in using an animation
          newElementBird.setAttribute('visible', 'true')
          newElementBird.setAttribute('animation', {
            property: 'scale',
            to: `${birdScale} ${birdScale} ${birdScale}`,
            easing: 'easeOutElastic',
            dur: 800,
          })
        })

        newElementTrex.addEventListener('model-loaded', () => {
        // Once the model is loaded, we are ready to show it popping in using an animation
          newElementTrex.setAttribute('visible', 'true')
          newElementTrex.setAttribute('animation', {
            property: 'scale',
            to: `${trexScale} ${trexScale} ${trexScale}`,
            easing: 'easeOutElastic',
            dur: 800,
          })
          newElementTrex.setAttribute('sound', {

          })
        })

        newElementTrex.dispatchEvent(new CustomEvent('trex-added', {bubbles: true}))
      }
    })
  },
}
