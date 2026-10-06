import {
  ACESFilmicToneMapping,
  AmbientLight,
  RepeatWrapping,
  PointLight,
  Color,
  AdditiveBlending,
  Box3,
  CanvasTexture,
  DirectionalLight,
  BufferGeometry,
  Group,
  Object3D,
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
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

const BUS_LENGTH = 5
// The model's nose points down +Z after normalising; flip if the livery reads backwards.
const FRONT_YAW = Math.PI

type Shot = {
  az: number // degrees around the bus, 0 = looking at the nose
  el: number // degrees above the ground
  dist: number // camera distance in bus-length units
  shift: number // screen-space shift of the bus, -1..1 of viewport width
  lower: number // drop the bus down the frame, fraction of viewport height
  drive: number // bus offset along its length, bus-length units (+ = ahead of centre)
  glow: number // headlight intensity 0..1
}

// One shot per story scene. Scrolling interpolates between neighbours.
const SHOTS: readonly Shot[] = [
  { az: 48, el: 9, dist: 1.7, shift: 0.36, lower: 0, drive: 0, glow: 0.35 },
  { az: 90, el: 4, dist: 2.3, shift: 0.38, lower: 0, drive: 0.12, glow: 0.2 },
  { az: 0, el: 3, dist: 1.15, shift: 0.3, lower: 0, drive: -0.1, glow: 1 },
  { az: -150, el: 24, dist: 2.7, shift: 0, lower: 0.22, drive: 0.5, glow: 0 },
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
    drive: lerp(a.drive, b.drive, t),
    glow: lerp(a.glow, b.glow, t),
  }
}

// The GLB is one merged mesh, so carve each tyre out by position and spin it on its own axle.
// Numbers are in the mesh's local space (nose = -z), measured from this model.
// ponytail: hand-measured axles; re-measure if the GLB is rebuilt.
const WHEEL_R = 0.0755 // hub centre to ground (bbox bottom is -0.272)
const WHEEL_Y = -0.1965 // hub centre height, fitted from the outer rim face
const AXLES = [-0.5859, 0.354, 0.5645]
const WHEEL_X_MIN = 0.1
// World radius of a tyre: mesh scale 1.25, then the pivot scales local length 2.5 to BUS_LENGTH.
const WHEEL_WORLD_R = WHEEL_R * 1.25 * (BUS_LENGTH / 2.5)

const splitWheels = (model: Object3D): Group[] => {
  let body: Mesh | undefined
  model.traverse((o) => {
    if (o instanceof Mesh && (!body || o.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = o
  })
  const index = body?.geometry.index
  if (!body || !index) return []
  const pos = body.geometry.attributes.position
  const taken = new Map<string, number[]>()
  const keep: number[] = []
  const r2 = (WHEEL_R * 1.04) ** 2
  const key = (z: number, x: number) => `${AXLES.findIndex((a) => Math.abs(a - z) < 0.12)}${x > 0 ? "R" : "L"}`
  for (let i = 0; i < index.count; i += 3) {
    const t = [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
    const cz = (pos.getZ(t[0]) + pos.getZ(t[1]) + pos.getZ(t[2])) / 3
    const cx = (pos.getX(t[0]) + pos.getX(t[1]) + pos.getX(t[2])) / 3
    const axle = AXLES.find((a) => Math.abs(a - cz) < 0.12)
    const inside =
      axle !== undefined &&
      Math.abs(cx) > WHEEL_X_MIN &&
      t.every((v) => (pos.getZ(v) - axle) ** 2 + (pos.getY(v) - WHEEL_Y) ** 2 <= r2)
    if (inside) {
      const k = key(cz, cx)
      const list = taken.get(k) ?? []
      list.push(...t)
      taken.set(k, list)
    } else keep.push(...t)
  }
  body.geometry.setIndex(keep)
  const groups: Group[] = []
  for (const [k, tris] of taken) {
    const axle = AXLES[Number(k[0])]
    const geo = new BufferGeometry()
    for (const [name, attr] of Object.entries(body.geometry.attributes)) geo.setAttribute(name, attr)
    geo.setIndex(tris)
    const tyre = new Mesh(geo, body.material)
    tyre.position.set(0, -WHEEL_Y, -axle) // the pivot below sits on the axle centre
    const pivot = new Group()
    pivot.position.set(k.endsWith("R") ? 0.178 : -0.178, WHEEL_Y, axle)
    // Each wheel spins about the bus's x axis, so offset x is handled by the pivot, not the tyre.
    tyre.position.x = k.endsWith("R") ? -0.178 : 0.178
    pivot.add(tyre)
    body.add(pivot)
    groups.push(pivot)
  }
  return groups
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
  renderer.toneMappingExposure = 1.25
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%"
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envMap
  scene.environmentIntensity = 1.1
  scene.add(new AmbientLight(0xffffff, 0.35))

  const sun = new DirectionalLight(0xfff1e0, 2.4)
  sun.position.set(-4, 7, 5)
  scene.add(sun)

  // Brand-coloured rim lights so the black coach keeps its silhouette on a dark stage.
  const rimWarm = new DirectionalLight(0xff8a3d, 2.2)
  rimWarm.position.set(5, 3, -6)
  scene.add(rimWarm)
  const rimCool = new DirectionalLight(0x9b7bff, 1.6)
  rimCool.position.set(-6, 4, -4)
  scene.add(rimCool)

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

  // Road: dashed lane lines that stream past as you scroll, which sells the motion.
  const laneCanvas = document.createElement("canvas")
  laneCanvas.width = 64
  laneCanvas.height = 256
  const lctx = laneCanvas.getContext("2d")
  if (lctx) {
    lctx.fillStyle = "#fff"
    lctx.fillRect(24, 16, 16, 112)
  }
  const laneTexture = new CanvasTexture(laneCanvas)
  laneTexture.wrapT = RepeatWrapping
  laneTexture.repeat.set(1, 6)
  const lanes = new Group()
  for (const x of [-0.42, 0.42]) {
    const mat = new MeshBasicMaterial({
      map: laneTexture,
      color: new Color(0xff8a3d),
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })
    const lane = new Mesh(new PlaneGeometry(BUS_LENGTH * 0.06, BUS_LENGTH * 3), mat)
    lane.rotation.x = -Math.PI / 2
    lane.position.set(x * BUS_LENGTH * 0.6, 0.002, 0)
    lanes.add(lane)
  }
  scene.add(lanes)

  const bus = new Group()
  scene.add(bus)

  // Headlights: real point lights plus additive halos that bloom on the head-on shot.
  const haloCanvas = document.createElement("canvas")
  haloCanvas.width = haloCanvas.height = 128
  const hctx = haloCanvas.getContext("2d")
  if (hctx) {
    const g = hctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, "rgba(255,244,220,1)")
    g.addColorStop(0.25, "rgba(255,214,150,0.45)")
    g.addColorStop(1, "rgba(255,200,120,0)")
    hctx.fillStyle = g
    hctx.fillRect(0, 0, 128, 128)
  }
  const haloTexture = new CanvasTexture(haloCanvas)
  const headlights = new Group()
  const halos: Mesh[] = []
  // ponytail: positions are eyeballed for this model; recalibrate if the GLB changes.
  const HEADLIGHT = { x: 0.075, y: 0.075, z: BUS_LENGTH / 2 + 0.02 }
  for (const sx of [-1, 1]) {
    const halo = new Mesh(
      new PlaneGeometry(BUS_LENGTH * 0.12, BUS_LENGTH * 0.12),
      new MeshBasicMaterial({
        map: haloTexture,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        opacity: 0,
      }),
    )
    halo.position.set(sx * HEADLIGHT.x * BUS_LENGTH, HEADLIGHT.y * BUS_LENGTH, HEADLIGHT.z)
    headlights.add(halo)
    halos.push(halo)
  }
  const beam = new PointLight(0xffe2b0, 0, BUS_LENGTH * 2, 1.6)
  beam.position.set(0, HEADLIGHT.y * BUS_LENGTH, HEADLIGHT.z + 1.2)
  headlights.add(beam)
  bus.add(headlights)

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

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  if (animate) window.addEventListener("pointermove", onPointer)
  // Intro: the coach rolls in from behind the camera while the camera swings round to the hero angle.
  let intro = animate ? 0 : 1
  const wheels: Group[] = []
  let target = 0
  let current = 0
  let visible = true
  let raf = 0
  let last = performance.now()
  let disposed = false

  const draw = (now: number, dt: number) => {
    current += (target - current) * (animate ? 1 - Math.exp(-dt * 4.5) : 1)
    intro = Math.min(intro + dt / 2.6, 1)
    const ie = 1 - Math.pow(1 - intro, 3)
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 3))
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 3))
    const shot = sampleShot(current)
    const portrait = width < height
    // Narrow screens need more distance to keep the whole coach in frame.
    const fit = portrait ? Math.min(2.6, (height / width) * 0.95) : 1
    const idle = animate ? Math.sin(now / 2600) * 2.5 : 0
    const az = ((shot.az + idle + pointer.sx * 6 + (1 - ie) * 70) * Math.PI) / 180
    const el = ((shot.el + pointer.sy * -2.5 + (1 - ie) * 14) * Math.PI) / 180
    const d = shot.dist * BUS_LENGTH * fit * (1 + (1 - ie) * 0.9)
    bus.position.z = (shot.drive - (1 - ie) * 0.9) * BUS_LENGTH
    // Lanes scroll with progress and idle-drift, so the road never sits still.
    laneTexture.offset.y = -(current * 2.2 + (animate ? now / 9000 : 0)) % 1
    // Tyres roll exactly as far as the lane lines travel (one texture repeat = BUS_LENGTH*3/6 world units).
    const roll = ((current * 2.2 + (animate ? now / 9000 : 0)) * (BUS_LENGTH * 0.5)) / WHEEL_WORLD_R
    for (const w of wheels) w.rotation.x = -roll
    const glow = shot.glow * ie
    for (const h of halos) (h.material as MeshBasicMaterial).opacity = glow * 0.7
    beam.intensity = glow * 2.5
    for (const h of halos) h.lookAt(camera.position)
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

  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  loader.load(
    modelUrl,
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      wheels.push(...splitWheels(model))
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
      if (animate) intro = 0
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
      window.removeEventListener("pointermove", onPointer)
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
