import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// 1. НАСТРОЙКА СЦЕНЫ
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(4, 5, -5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 2. ОСВЕЩЕНИЕ
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 3. КОНСТАНТЫ (размеры/толщины/высоты)
const WALL_HEIGHT = 1;
const WALL_LENGTH = 1;
const WALL_WIDTH = 0.1;

const BRICK_WIDTH = 0.1;

const INSULATION_MIN_WIDTH = 0.01;
const RED_LAYER_MIN_WIDTH = 0.01;
const RED_LAYER_WIDTH = 1;
const RED_LAYER_HEIGHT = 0.8;

const FOUNDATION_HEIGHT = 0.2;

const GROUND_WIDTH = 0.3;
const GROUND_HEIGHT = 0.2;
const GROUND_LENGTH = 1;

const CONCRETE_WIDTH = 0.3;
const CONCRETE_HEIGHT = 0.2;
const CONCRETE_LENGTH = 1;

// 4. ТЕКСТУРЫ И МАТЕРИАЛЫ
const textureLoader = new THREE.TextureLoader();

const brickColorTexture = textureLoader.load(
  "./assets/textures/Brick_Wall_023_basecolor.png"
);

const brickNormalTexture = textureLoader.load(
  "./assets/textures/Brick_Wall_023_normal.png"
);

const blockColorTexture = textureLoader.load(
  "./assets/textures/Brick_Wall_025_basecolor.png"
);

const blockNormalTexture = textureLoader.load(
  "./assets/textures/Brick_Wall_025_normal.png"
);

const blockAOTexture = textureLoader.load(
  "./assets/textures/Brick_Wall_025_ambientOcclusion.png"
);

const concreteBlockLightColorTexture = textureLoader.load(
  "./assets/textures/Concrete_Wall_011_basecolor.jpg"
);

const concreteBlockLightNormalTexture = textureLoader.load(
  "./assets/textures/Concrete_Wall_011_normal.jpg"
);

const concreteBlockLightAOTexture = textureLoader.load(
  "./assets/textures/Concrete_Wall_011_ambientOcclusion.jpg"
);

const concreteBlockDarkColorTexture = textureLoader.load(
  "./assets/textures/Concrete_Wall_002_basecolor.jpg"
);

const concreteBlockDarkNormalTexture = textureLoader.load(
  "./assets/textures/Concrete_Wall_002_normal.jpg"
);

const concreteBlockDarkAOTexture = textureLoader.load(
  "./assets/textures/Concrete_Wall_002_ambient_occlusion.jpg"
);

const groundColorTexture = textureLoader.load(
  "./assets/textures/Ground_Dirt_008_baseColor.jpg"
);

const groundNormalTexture = textureLoader.load(
  "./assets/textures/Ground_Dirt_008_normal.jpg"
);

const groundAOTexture = textureLoader.load(
  "./assets/textures/Ground_Dirt_008_ambientOcclusion.jpg"
);

// Повторение текстур
// brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
// brickTexture.repeat.set(3, 3);

// brickNormalTexture.wrapS = brickNormalTexture.wrapT = THREE.RepeatWrapping;
// brickNormalTexture.repeat.set(3, 3);

// blockColorTexture.wrapS = blockColorTexture.wrapT = THREE.RepeatWrapping;
// blockColorTexture.repeat.set(3, 3);

// blockNormalTexture.wrapS = blockNormalTexture.wrapT = THREE.RepeatWrapping;
// blockNormalTexture.repeat.set(3, 3);

// blockAOTexture.wrapS = blockAOTexture.wrapT = THREE.RepeatWrapping;
// blockAOTexture.repeat.set(3, 3);

const insulationMaterials = [
  new THREE.MeshStandardMaterial({ color: "#808080" }), // +X — серая (к кирпичу)
  new THREE.MeshStandardMaterial({ color: "#ff80ab" }), // -X
  new THREE.MeshStandardMaterial({ color: "#ff80ab" }), // +Y
  new THREE.MeshStandardMaterial({ color: "#ff80ab" }), // -Y
  new THREE.MeshStandardMaterial({ color: "#ff80ab" }), // +Z
  new THREE.MeshStandardMaterial({ color: "#ff80ab" }), // -Z
];

const materials = {
  brick: new THREE.MeshStandardMaterial({
    map: brickColorTexture,
    normalMap: brickNormalTexture,
  }),
  block: new THREE.MeshStandardMaterial({
    map: blockColorTexture,
    normalMap: blockNormalTexture,
    aoMap: blockAOTexture,
  }),
  concreteBlockLight: new THREE.MeshStandardMaterial({
    map: concreteBlockLightColorTexture,
    normalMap: concreteBlockLightNormalTexture,
    aoMap: concreteBlockLightAOTexture,
  }),
  concreteBlockDark: new THREE.MeshStandardMaterial({
    map: concreteBlockDarkColorTexture,
    normalMap: concreteBlockDarkNormalTexture,
    aoMap: concreteBlockDarkAOTexture,
  }),
  insulation: insulationMaterials,
  foundation: new THREE.MeshStandardMaterial({ color: 0x888888 }),
  ground: new THREE.MeshStandardMaterial({
    map: groundColorTexture,
    normalMap: groundNormalTexture,
    aoMap: groundAOTexture,
  }),
};

// Внешняя стена (кирпич — треугольная экструзия)
const triangleShape = new THREE.Shape();
triangleShape.moveTo(0, 0);
triangleShape.lineTo(0, WALL_HEIGHT);
triangleShape.lineTo(WALL_LENGTH, 0);
triangleShape.lineTo(0, 0);

const extrudeSettings = {
  steps: 1,
  depth: BRICK_WIDTH,
  bevelEnabled: false,
};

const brickWallGeometry = new THREE.ExtrudeGeometry(
  triangleShape,
  extrudeSettings
);
brickWallGeometry.rotateY(Math.PI / 2);
brickWallGeometry.translate(
  -BRICK_WIDTH / 2,
  -WALL_HEIGHT / 2,
  WALL_LENGTH / 2
);

const outerWallGroup = new THREE.Group();
const outerWall = new THREE.Mesh(brickWallGeometry, materials.brick);
outerWallGroup.add(outerWall);

// Красный слой (отдельный элемент)
const redLayer = new THREE.Mesh(
  new THREE.BoxGeometry(
    RED_LAYER_MIN_WIDTH,
    RED_LAYER_HEIGHT - FOUNDATION_HEIGHT,
    RED_LAYER_WIDTH
  ),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

redLayer.position.y =
  -(WALL_HEIGHT - RED_LAYER_HEIGHT) / 2 + FOUNDATION_HEIGHT / 2;
scene.add(redLayer);

// Прямоугольник у земли для кирпичной группы
const groundRect = new THREE.Mesh(
  new THREE.BoxGeometry(GROUND_WIDTH, GROUND_HEIGHT, GROUND_LENGTH),
  materials.ground
);

groundRect.position.set(
  WALL_WIDTH + BRICK_WIDTH,
  -(WALL_HEIGHT / 2 - GROUND_HEIGHT / 2),
  0
);

outerWallGroup.add(groundRect);
scene.add(outerWallGroup);

// Внутренняя стена (блоки)
const innerWallGroup = new THREE.Group();
const innerWall = new THREE.Mesh(
  new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_LENGTH),
  materials.block
);

innerWallGroup.add(innerWall);

const concreteRectDark = new THREE.Mesh(
  new THREE.BoxGeometry(CONCRETE_WIDTH, CONCRETE_HEIGHT, CONCRETE_LENGTH),
  materials.concreteBlockDark
);

concreteRectDark.position.set(
  -(WALL_WIDTH + BRICK_WIDTH),
  -(WALL_HEIGHT / 2 - GROUND_HEIGHT / 2),
  0
);

innerWallGroup.add(concreteRectDark);

const concreteRectLight = new THREE.Mesh(
  new THREE.BoxGeometry(CONCRETE_WIDTH, CONCRETE_HEIGHT, CONCRETE_LENGTH),
  materials.concreteBlockLight
);

concreteRectLight.position.set(
  -(WALL_WIDTH + BRICK_WIDTH),
  -(WALL_HEIGHT / 2 - GROUND_HEIGHT / 2 - CONCRETE_HEIGHT),
  0
);

innerWallGroup.add(concreteRectLight);
scene.add(innerWallGroup);

// Утеплитель (отдельный элемент)
const insulation = new THREE.Mesh(
  new THREE.BoxGeometry(1, WALL_HEIGHT - FOUNDATION_HEIGHT, WALL_LENGTH), // Ширина (X) будет меняться через scale
  materials.insulation
);

insulation.position.y = FOUNDATION_HEIGHT / 2;
scene.add(insulation);

// Фундамент
const foundation = new THREE.Mesh(
  new THREE.BoxGeometry(),
  materials.foundation
);

foundation.position.y = -WALL_HEIGHT / 2 + FOUNDATION_HEIGHT / 2;
scene.add(foundation);

const params = {
  insulationWidth: INSULATION_MIN_WIDTH,
  redLayerWidth: RED_LAYER_MIN_WIDTH,
};

function updateWallLayout() {
  // Текущие толщины
  const insulationWidth = params.insulationWidth;
  const redLayerWidth = params.redLayerWidth;
  const brickWidth = BRICK_WIDTH;
  const wallWidth = WALL_WIDTH;

  // Масштабируем изменяемые слои
  insulation.scale.x = insulationWidth;
  redLayer.scale.x = redLayerWidth / RED_LAYER_MIN_WIDTH;

  // Общая ширина и левый край для центрирования компоновки вокруг X=0
  const totalWidth = wallWidth + insulationWidth + redLayerWidth + brickWidth;
  const leftEdge = -totalWidth / 2;

  // Центры элементов (слева направо: блок → insulation → redLayer → кирпич)
  const innerWallCenterX = leftEdge + wallWidth / 2;
  const insulationCenterX = leftEdge + wallWidth + insulationWidth / 2;
  const redLayerCenterX =
    leftEdge + wallWidth + insulationWidth + redLayerWidth / 2;
  const outerWallCenterX =
    leftEdge + wallWidth + insulationWidth + redLayerWidth + brickWidth / 2;

  // Применяем позиции
  innerWallGroup.position.x = innerWallCenterX;
  insulation.position.x = insulationCenterX;
  redLayer.position.x = redLayerCenterX;
  outerWallGroup.position.x = outerWallCenterX;

  // Фундамент под redLayer и insulation
  foundation.geometry.dispose();
  foundation.geometry = new THREE.BoxGeometry(
    insulationWidth + redLayerWidth,
    FOUNDATION_HEIGHT,
    WALL_LENGTH
  );
  foundation.position.x = 0;
}

// GUI
const gui = new GUI();
gui
  .add(
    params,
    "insulationWidth",
    INSULATION_MIN_WIDTH,
    INSULATION_MIN_WIDTH * 2
  )
  .name("Insulation width")
  .onChange(updateWallLayout);

gui
  .add(params, "redLayerWidth", RED_LAYER_MIN_WIDTH, RED_LAYER_MIN_WIDTH * 2)
  .name("Red layer width")
  .onChange(updateWallLayout);

// Первый вызов для установки начальных позиций
updateWallLayout();


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Адаптация под размер окна
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
