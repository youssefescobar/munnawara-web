import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  CanvasTexture,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

const BUS_LENGTH = 5
// The model's nose points down +Z after normalising; flip if the livery reads backwards.
const FRONT_YAW = 0

type Shot = {
  az: number // degrees around the bus, 0 = looking at the nose
  el: number // degrees above the ground
  dist: number // camera distance in bus-length units
  shift: number // screen-space shift of the bus, -1..1 of viewport width
  lower: number // drop the bus down the frame, fraction of viewport height
}

// One shot per story scene. Scrolling interpolates between neighbours.
const SHOTS: readonly Shot[] = [
  { az: 38, el: 11, dist: 1.8, shift: 0.3, lower: 0 },
  { az: 90, el: 5, dist: 2.5, shift: 0.38, lower: 0 },
  { az: 6, el: 4, dist: 1.25, shift: 0.24, lower: 0 },
  { az: -42, el: 20, dist: 2.6, shift: 0, lower: 0.22 },
]

const smooth = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const sampleShot = (p: number): Shot => {
  const f = Math.min(Math.max(p, 0), 1) * (SHOTS.length - 1)
  const i = Math.min(Math.floor(f), SHOTS.length - 2)
  const t = smooth(f - i)
  const a = SHOTS[i]
  const b = SHOTS[i + 1]
  return {
    az: lerp(a.az, b.az, t),
    el: lerp(a.el, b.el, t),
    dist: lerp(a.dist, b.dist, t),
    shift: lerp(a.shift, b.shift, t),
    lower: lerp(a.lower, b.lower, t),
  }
}

type BusStageOptions = {
  container: HTMLElement
  modelUrl: string
  /** 1 puts the bus on the right of the text column, -1 on the left (RTL). */
  side: 1 | -1
  animate: boolean
  onFrame?: (progress: number) => void
  onReady?: () => void
  onError?: () => void
}

export const createBusStage = ({
  container,
  modelUrl,
  side,
  animate,
  onFrame,
  onReady,
  onError,
}: BusStageOptions) => {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true })
  } catch {
    onError?.()
    return { setProgress: () => {}, dispose: () => {} }
  }

  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%"
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envMap
  scene.environmentIntensity = 0.85
  scene.add(new AmbientLight(0xffffff, 0.35))

  const sun = new DirectionalLight(0xfff1e0, 2.4)
  sun.position.set(-4, 7, 5)
  scene.add(sun)

  // Soft contact blob so the bus never looks like it floats.
  const blobCanvas = document.createElement("canvas")
  blobCanvas.width = blobCanvas.height = 128
  const bctx = blobCanvas.getContext("2d")
  if (bctx) {
    const g = bctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, "rgba(0,0,0,0.55)")
    g.addColorStop(1, "rgba(0,0,0,0)")
    bctx.fillStyle = g
    bctx.fillRect(0, 0, 128, 128)
  }
  const blobTexture = new CanvasTexture(blobCanvas)
  const addBlob = (w: number, h: number, opacity: number, y: number) => {
    const blob = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ map: blobTexture, transparent: true, depthWrite: false, opacity }),
    )
    blob.rotation.x = -Math.PI / 2
    blob.position.y = y
    scene.add(blob)
  }
  addBlob(BUS_LENGTH * 0.55, BUS_LENGTH * 1.5, 0.38, 0.004)
  addBlob(BUS_LENGTH * 0.2, BUS_LENGTH * 1.02, 0.7, 0.006)

  const bus = new Group()
  scene.add(bus)

  const camera = new PerspectiveCamera(30, 1, 0.1, 100)
  const lookAt = new Vector3(0, BUS_LENGTH * 0.13, 0)

  let width = 1
  let height = 1
  const resize = () => {
    width = container.clientWidth || 1
    height = container.clientHeight || 1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 700 ? 1.5 : 2))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  let target = 0
  let current = 0
  let visible = true
  let raf = 0
  let last = performance.now()
  let disposed = false

  const draw = (now: number, dt: number) => {
    current += (target - current) * (animate ? 1 - Math.exp(-dt * 4.5) : 1)
    const shot = sampleShot(current)
    const portrait = width < height
    // Narrow screens need more distance to keep the whole coach in frame.
    const fit = portrait ? Math.min(2.6, (height / width) * 0.95) : 1
    const idle = animate ? Math.sin(now / 2600) * 2.5 : 0
    const az = ((shot.az + idle) * Math.PI) / 180
    const el = (shot.el * Math.PI) / 180
    const d = shot.dist * BUS_LENGTH * fit
    camera.position.set(
      lookAt.x + d * Math.sin(az) * Math.cos(el),
      lookAt.y + d * Math.sin(el),
      lookAt.z + d * Math.cos(az) * Math.cos(el),
    )
    camera.lookAt(lookAt)
    // Desktop: park the bus beside the copy. Mobile: sit it low under the headline.
    if (portrait) {
      camera.setViewOffset(width, height, 0, -height * (0.24 + shot.lower * 0.15), width, height)
    } else {
      camera.setViewOffset(width, height, -width * shot.shift * side * 0.5, -height * shot.lower, width, height)
    }
    renderer.render(scene, camera)
    onFrame?.(current)
  }

  const loop = (now: number) => {
    raf = 0
    if (disposed || !visible || document.hidden) return
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    draw(now, dt)
    const settling = Math.abs(target - current) > 0.0005
    if (animate || settling) raf = requestAnimationFrame(loop)
  }
  const kick = () => {
    if (!raf && !disposed) {
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
  }

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) kick()
  })
  intersection.observe(container)
  const onVisibility = () => kick()
  document.addEventListener("visibilitychange", onVisibility)
  window.addEventListener("resize", kick)

  new GLTFLoader().load(
    modelUrl,
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3())
      const center = box.getCenter(new Vector3())
      model.position.sub(new Vector3(center.x, box.min.y, center.z))
      const pivot = new Group()
      pivot.add(model)
      // Longest horizontal axis becomes Z so every shot can reason about "nose = +Z".
      if (size.x > size.z) pivot.rotation.y = Math.PI / 2
      pivot.rotation.y += FRONT_YAW
      const scale = BUS_LENGTH / Math.max(size.x, size.z)
      pivot.scale.setScalar(scale)
      bus.add(pivot)
      onReady?.()
      kick()
    },
    undefined,
    () => onError?.(),
  )

  return {
    setProgress: (p: number) => {
      target = p
      kick()
    },
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", kick)
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          for (const m of mats) {
            for (const v of Object.values(m)) {
              if (v instanceof Texture) v.dispose()
            }
            m.dispose()
          }
        }
      })
      envMap.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
