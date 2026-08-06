// Core Application for HFOV/VFOV 3D Visual Calculator

// --- Constants & Config ---
const REFERENCE_FF_DIAG = Math.sqrt(36 * 36 + 24 * 24); // ~43.2666 mm

const SENSOR_PRESETS = {
    "35mm": { width: 36.0, height: 24.0, name: "35mm Full-Frame" },
    "apsc-canon": { width: 22.3, height: 14.9, name: "APS-C Canon" },
    "apsc-sony": { width: 23.5, height: 15.6, name: "APS-C Sony/Nikon/Fuji" },
    "m43": { width: 17.3, height: 13.0, name: "Micro Four Thirds" },
    "super35": { width: 24.89, height: 18.66, name: "Super 35" },
    "imax": { width: 70.41, height: 52.63, name: "IMAX Film Frame" },
    "one-fourth": { width: 3.6, height: 2.7, name: "1/4\" Sensor" },
    "one-third-six": { width: 4.0, height: 3.0, name: "1/3.6\" Nokia" },
    "one-third-two": { width: 4.54, height: 3.42, name: "1/3.2\" iPhone 5" },
    "large-8x10": { width: 254.0, height: 203.0, name: "Large-format 8x10" }
};

// --- DOM Elements ---
const elSensorPreset = document.getElementById('sensor-preset');
const elCustomSensorDims = document.getElementById('custom-sensor-dims');
const elSensorWidth = document.getElementById('sensor-width');
const elSensorHeight = document.getElementById('sensor-height');
const elDiagVal = document.getElementById('diag-val');
const elAspectVal = document.getElementById('aspect-val');

const elFocalLength = document.getElementById('focal-length');
const elFocalLengthSlider = document.getElementById('focal-length-slider');
const elFocalReal = document.getElementById('focal-real');
const elFocalEquiv = document.getElementById('focal-equiv');
const elCropDiagVal = document.getElementById('crop-diag-val');
const elCropHorizVal = document.getElementById('crop-horiz-val');

const elCamX = document.getElementById('cam-x');
const elCamY = document.getElementById('cam-y');
const elCamZ = document.getElementById('cam-z');
const elCamYaw = document.getElementById('cam-yaw');
const elCamYawSlider = document.getElementById('cam-yaw-slider');
const elCamPitch = document.getElementById('cam-pitch');
const elCamPitchSlider = document.getElementById('cam-pitch-slider');
const elCamRoll = document.getElementById('cam-roll');
const elCamRollSlider = document.getElementById('cam-roll-slider');

const elRoomWidth = document.getElementById('room-width');
const elRoomLength = document.getElementById('room-length');
const elRoomHeight = document.getElementById('room-height');

const elTargetDist = document.getElementById('target-dist');
const elTargetDistSlider = document.getElementById('target-dist-slider');

const elHfovVal = document.getElementById('hfov-val');
const elVfovVal = document.getElementById('vfov-val');
const elHfwVal = document.getElementById('hfw-val');
const elVfwVal = document.getElementById('vfw-val');
const elTargetDLbls = document.querySelectorAll('.target-d-lbl');

const elBtnResetView = document.getElementById('btn-reset-view');
const elBtnToggleGrid = document.getElementById('btn-toggle-grid');

// --- 3D Scene Variables ---
let scene, camera, renderer, controls;
let roomMesh, roomWireframe, gridHelper;
let cameraGroup, cameraMesh, frustumMesh, frustumEdges, targetPlaneMesh, dimensionLines, intersectionLines;
let isGridVisible = true;

// --- i18n Translation Dictionary ---
const TRANSLATIONS = {
    pt: {
        app_title: "HFOV & VFOV 3D Visual Calculator",
        subtitle: "Calculadora e Visualizador de Campo de Visão",
        credits: "By Sandro Benigno (EvilPlaymobil)",
        tutorial: "tutorial",
        tutorial_pre: "Entenda o conceito no ",
        tutorial_post: "!",
        
        sensor_title: "Sensor da Câmera",
        sensor_preset: "Preset do Sensor",
        sensor_width: "Larg. (mm)",
        sensor_height: "Alt. (mm)",
        sensor_custom: "Customizado...",
        sensor_diag: "Diagonal: ",
        sensor_aspect: "Aspecto: ",
        
        lens_title: "Parâmetros da Lente",
        lens_focal: "Distância Focal (mm)",
        lens_type: "Tipo de Distância Focal",
        lens_real: "Física Real",
        lens_equiv: "Equiv. 35mm",
        crop_diag: "Fator de Corte Diagonal: ",
        crop_horiz: "Fator de Corte Horizontal: ",
        
        cam_title: "Posicionamento da Câmera (m)",
        cam_x: "X (Lat.)",
        cam_y: "Y (Comp.)",
        cam_z: "Z (Alt.)",
        cam_orientation: "Orientação (Graus)",
        cam_yaw: "Pan / Yaw (Giro)",
        cam_pitch: "Tilt / Pitch (Inclinação)",
        cam_roll: "Roll (Rotação)",
        
        space_title: "Dimensões do Espaço (m)",
        space_w: "Larg. (X)",
        space_l: "Comp. (Y)",
        space_h: "Alt. (Z)",
        
        target_title: "Foco & Distância do Alvo",
        target_dist: "Distância do Alvo (D) em metros",
        
        footer_text: "Criado com ",
        footer_post: " para Cineastas e Engenheiros",
        
        btn_reset: " Resetar Vista",
        btn_grid: " Grid",
        
        card_hfov_desc: "Abertura Horizontal",
        card_vfov_desc: "Abertura Vertical",
        card_hfw_title: "HFW <span class=\"card-sub-title\">(Largura da Cena)</span>",
        card_vfw_title: "VFW <span class=\"card-sub-title\">(Altura da Cena)</span>",
        card_framing_at: "Enquadramento a ",
        card_m: "m",
        
        preset_35mm: "35mm Film Full-Frame (36.0 x 24.0 mm, 3:2)",
        preset_apsc_canon: "APS-C Canon (22.3 x 14.9 mm, 3:2)",
        preset_apsc_sony: "APS-C Sony/Nikon/Fuji (23.5 x 15.6 mm, 3:2)",
        preset_m43: "Micro Four Thirds (17.3 x 13.0 mm, 4:3)",
        preset_super35: "Super 35 (24.89 x 18.66 mm, 4:3)",
        preset_imax: "IMAX Film Frame (70.41 x 52.63 mm, 4:3)",
        preset_one_fourth: "1/4\" Sensor (3.6 x 2.7 mm, 4:3)",
        preset_one_third_six: "1/3.6\" Nokia Lumia 720 (4.0 x 3.0 mm, 4:3)",
        preset_one_third_two: "1/3.2\" iPhone 5 (4.54 x 3.42 mm, 4:3)",
        preset_large_8x10: "Large-format 8x10 inch (254.0 x 203.0 mm, 5:4)"
    },
    en: {
        app_title: "HFOV & VFOV 3D Visual Calculator",
        subtitle: "Field of View Calculator & Visualizer",
        credits: "By Sandro Benigno (EvilPlaymobil)",
        tutorial: "tutorial",
        tutorial_pre: "Understand the concept in the ",
        tutorial_post: "!",
        
        sensor_title: "Camera Sensor",
        sensor_preset: "Sensor Preset",
        sensor_width: "Width (mm)",
        sensor_height: "Height (mm)",
        sensor_custom: "Custom...",
        sensor_diag: "Diagonal: ",
        sensor_aspect: "Aspect: ",
        
        lens_title: "Lens Parameters",
        lens_focal: "Focal Length (mm)",
        lens_type: "Focal Length Type",
        lens_real: "Real Physical",
        lens_equiv: "35mm Equiv.",
        crop_diag: "Diagonal Crop Factor: ",
        crop_horiz: "Horizontal Crop Factor: ",
        
        cam_title: "Camera Position (m)",
        cam_x: "X (Lat.)",
        cam_y: "Y (Len.)",
        cam_z: "Z (Height)",
        cam_orientation: "Orientation (Degrees)",
        cam_yaw: "Pan / Yaw (Pan)",
        cam_pitch: "Tilt / Pitch (Tilt)",
        cam_roll: "Roll (Roll)",
        
        space_title: "Space Dimensions (m)",
        space_w: "Width (X)",
        space_l: "Length (Y)",
        space_h: "Height (Z)",
        
        target_title: "Focus & Target Distance",
        target_dist: "Target Distance (D) in meters",
        
        footer_text: "Created with ",
        footer_post: " for Filmmakers and Engineers",
        
        btn_reset: " Reset View",
        btn_grid: " Grid",
        
        card_hfov_desc: "Horizontal Field of View",
        card_vfov_desc: "Vertical Field of View",
        card_hfw_title: "HFW <span class=\"card-sub-title\">(Field Width)</span>",
        card_vfw_title: "VFW <span class=\"card-sub-title\">(Field Height)</span>",
        card_framing_at: "Framing at ",
        card_m: "m",
        
        preset_35mm: "35mm Film Full-Frame (36.0 x 24.0 mm, 3:2)",
        preset_apsc_canon: "APS-C Canon (22.3 x 14.9 mm, 3:2)",
        preset_apsc_sony: "APS-C Sony/Nikon/Fuji (23.5 x 15.6 mm, 3:2)",
        preset_m43: "Micro Four Thirds (17.3 x 13.0 mm, 4:3)",
        preset_super35: "Super 35 (24.89 x 18.66 mm, 4:3)",
        preset_imax: "IMAX Film Frame (70.41 x 52.63 mm, 4:3)",
        preset_one_fourth: "1/4\" Sensor (3.6 x 2.7 mm, 4:3)",
        preset_one_third_six: "1/3.6\" Nokia Lumia 720 (4.0 x 3.0 mm, 4:3)",
        preset_one_third_two: "1/3.2\" iPhone 5 (4.54 x 3.42 mm, 4:3)",
        preset_large_8x10: "Large-format 8x10 inch (254.0 x 203.0 mm, 5:4)"
    }
};

let currentLang = localStorage.getItem('hfov_calc_lang') || 'pt';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('hfov_calc_lang', lang);
    
    // Translate standard data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang][key]) {
            if (el.tagName === 'TITLE') {
                document.title = TRANSLATIONS[lang][key];
            } else {
                const icon = el.querySelector('i[data-lucide], svg');
                if (icon) {
                    Array.from(el.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            node.remove();
                        }
                    });
                    el.appendChild(document.createTextNode(TRANSLATIONS[lang][key]));
                } else {
                    el.innerHTML = TRANSLATIONS[lang][key];
                }
            }
        }
    });

    // Update active class in language selector buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Trigger recalculation so any dynamic labels update
    updateCalculations();
}

// Initialize App
function init() {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Set up 3D Scene
    init3D();

    // Event Listeners
    setupEventListeners();

    // Initial language setup (this calls updateCalculations() internally)
    setLanguage(currentLang);

    // Start render loop
    animate();
}

// Set up Three.js Scene
function init3D() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);
    scene.fog = new THREE.FogExp2(0x05070c, 0.015);

    // Camera for viewing the 3D scene
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // Don't go below floor
    controls.minDistance = 2;
    controls.maxDistance = 50;

    reset3DCamera();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 0.5, 30);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Create Camera Group (this matches the position and rotation of the camera in space)
    cameraGroup = new THREE.Group();
    scene.add(cameraGroup);

    // Add camera visual body (shifted back so the projection vertex is at the lens center)
    const camGeo = new THREE.BoxGeometry(0.2, 0.15, 0.3);
    const camMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.2, metalness: 0.1 });
    cameraMesh = new THREE.Mesh(camGeo, camMat);
    cameraMesh.position.set(0, 0, 0.2);
    cameraGroup.add(cameraMesh);

    // Camera Lens (positioned at origin so projection starts from its center)
    const lensGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, 0, 0); // centered at (0, 0, 0)
    cameraGroup.add(lensMesh);

    // Setup Room & Vision Cone placeholder
    updateRoom3D();
    updateCone3D(40, 30, 4); // Dummy initialization

    // Resize Handler
    window.addEventListener('resize', onWindowResize);
}

function reset3DCamera() {
    const roomW = parseFloat(elRoomWidth.value);
    const roomL = parseFloat(elRoomLength.value);
    const roomH = parseFloat(elRoomHeight.value);

    // Position viewing camera to look at the center of the room
    camera.position.set(roomW * 1.2, roomH * 1.5, roomL * 1.2);
    controls.target.set(0, roomH / 3, roomL / 2);
    controls.update();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Math and UI Sync Logic
function updateCalculations() {
    // 1. Get Sensor Specs
    let w = parseFloat(elSensorWidth.value);
    let h = parseFloat(elSensorHeight.value);
    const preset = elSensorPreset.value;

    if (preset !== 'custom') {
        w = SENSOR_PRESETS[preset].width;
        h = SENSOR_PRESETS[preset].height;
        // update inputs silently
        elSensorWidth.value = w.toFixed(2);
        elSensorHeight.value = h.toFixed(2);
    }

    // Compute Diagonal and Aspect Ratio
    const diag = Math.sqrt(w * w + h * h);
    elDiagVal.textContent = diag.toFixed(2) + " mm";
    
    // Find Aspect Ratio string representation
    const gcd = (a, b) => b < 0.01 ? a : gcd(b, a % b);
    const aspectDecimal = w / h;
    let aspectStr = aspectDecimal.toFixed(2);
    if (Math.abs(aspectDecimal - 1.7777) < 0.02) aspectStr = "16:9";
    else if (Math.abs(aspectDecimal - 1.3333) < 0.02) aspectStr = "4:3";
    else if (Math.abs(aspectDecimal - 1.5) < 0.02) aspectStr = "3:2";
    else if (Math.abs(aspectDecimal - 1.25) < 0.02) aspectStr = "5:4";
    elAspectVal.textContent = aspectStr;

    // Crop Factors
    const cropDiag = REFERENCE_FF_DIAG / diag;
    const cropHoriz = 36.0 / w;
    elCropDiagVal.textContent = cropDiag.toFixed(2) + "x";
    elCropHorizVal.textContent = cropHoriz.toFixed(2) + "x";

    // 2. Get Lens focal length
    const focalInput = parseFloat(elFocalLength.value);
    const isEquiv = elFocalEquiv.checked;

    let focalReal;
    if (isEquiv) {
        // Equiv is translated back to real for calculation using crop factor
        // The standard definition uses diagonal crop factor
        focalReal = focalInput / cropDiag;
    } else {
        focalReal = focalInput;
    }

    // 3. Calculate HFOV and VFOV in Radians, then degrees
    // HFOV = 2 * arctan(sensorWidth / (2 * focalReal))
    const hfovRad = 2 * Math.atan(w / (2 * focalReal));
    const vfovRad = 2 * Math.atan(h / (2 * focalReal));

    const hfovDeg = hfovRad * (180 / Math.PI);
    const vfovDeg = vfovRad * (180 / Math.PI);

    elHfovVal.textContent = hfovDeg.toFixed(1) + "°";
    elVfovVal.textContent = vfovDeg.toFixed(1) + "°";

    // 4. Calculate HFW and VFW at Distance D
    const d = parseFloat(elTargetDist.value);
    elTargetDLbls.forEach(lbl => lbl.textContent = d.toFixed(1));

    // HFW = 2 * D * tan(HFOV / 2)
    const hfw = 2 * d * Math.tan(hfovRad / 2);
    const vfw = 2 * d * Math.tan(vfovRad / 2);

    elHfwVal.textContent = hfw.toFixed(2) + " m";
    elVfwVal.textContent = vfw.toFixed(2) + " m";

    // 5. Update 3D elements
    updateCameraGroup();
    updateCone3D(hfovRad, vfovRad, d);
}

// Update Room representation in 3D
function updateRoom3D() {
    if (roomMesh) scene.remove(roomMesh);
    if (roomWireframe) scene.remove(roomWireframe);
    if (gridHelper) scene.remove(gridHelper);

    const w = parseFloat(elRoomWidth.value);
    const l = parseFloat(elRoomLength.value);
    const h = parseFloat(elRoomHeight.value);

    // The room geometry. Center is at (0, h/2, l/2)
    const roomGeo = new THREE.BoxGeometry(w, h, l);
    
    // Wireframe container
    const edges = new THREE.EdgesGeometry(roomGeo);
    roomWireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 3 }));
    roomWireframe.position.set(0, h / 2, l / 2);
    scene.add(roomWireframe);

    // Room volume mesh removed for pure outline visual as requested

    // Floor Grid Helper
    if (isGridVisible) {
        gridHelper = new THREE.GridHelper(Math.max(w, l) * 2, Math.max(w, l) * 2, 0x334155, 0x1e293b);
        gridHelper.position.set(0, -0.005, l / 2);
        scene.add(gridHelper);
    }
}

// Update Camera Position and Orientation in 3D
function updateCameraGroup() {
    // Coordinates mapping:
    // UI X -> Three.js X
    // UI Y -> Three.js Z
    // UI Z -> Three.js Y
    const x = parseFloat(elCamX.value);
    const y = parseFloat(elCamY.value);
    const z = parseFloat(elCamZ.value);

    cameraGroup.position.set(x, z, y);

    // Rotations:
    // Yaw (Pan): Rotation around world Y axis (upwards). Convert to radians.
    // Adicionamos +180 graus para que Yaw = 0 aponte para dentro da sala (+Z).
    // Pitch (Tilt): Rotation around camera local X axis.
    // Roll: Rotation around camera local Z axis.
    const yaw = (parseFloat(elCamYaw.value) + 180) * (Math.PI / 180);
    const pitch = parseFloat(elCamPitch.value) * (Math.PI / 180);
    const roll = parseFloat(elCamRoll.value) * (Math.PI / 180);

    // Reset rotation and apply in Y -> X -> Z order (Yaw -> Pitch -> Roll)
    cameraGroup.rotation.set(0, 0, 0);
    cameraGroup.rotation.order = 'YXZ';
    cameraGroup.rotation.y = yaw;
    cameraGroup.rotation.x = pitch;
    cameraGroup.rotation.z = roll;
    
    // Forçar atualização da matriz mundial para que transformações locais/mundiais funcionem imediatamente
    cameraGroup.updateMatrixWorld(true);
}

// Update the vision cone (Frustum) based on current FOV & target distance
function updateCone3D(hfovRad, vfovRad, distance) {
    if (frustumMesh) cameraGroup.remove(frustumMesh);
    if (frustumEdges) cameraGroup.remove(frustumEdges);
    if (targetPlaneMesh) cameraGroup.remove(targetPlaneMesh);
    if (dimensionLines) cameraGroup.remove(dimensionLines);
    if (intersectionLines) scene.remove(intersectionLines);

    // Corners of the vision cone frustum at target distance
    const hw = distance * Math.tan(hfovRad / 2);
    const hh = distance * Math.tan(vfovRad / 2);

    // Points in camera local space (camera points down -Z)
    const p0 = new THREE.Vector3(0, 0, 0); // Origin (camera focal point)
    const pTL = new THREE.Vector3(-hw, hh, -distance); // Top Left
    const pTR = new THREE.Vector3(hw, hh, -distance);  // Top Right
    const pBR = new THREE.Vector3(hw, -hh, -distance); // Bottom Right
    const pBL = new THREE.Vector3(-hw, -hh, -distance); // Bottom Left

    // Construct Frustum Geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        // Face Top: 0 -> TL -> TR
        p0.x, p0.y, p0.z, pTL.x, pTL.y, pTL.z, pTR.x, pTR.y, pTR.z,
        // Face Right: 0 -> TR -> BR
        p0.x, p0.y, p0.z, pTR.x, pTR.y, pTR.z, pBR.x, pBR.y, pBR.z,
        // Face Bottom: 0 -> BR -> BL
        p0.x, p0.y, p0.z, pBR.x, pBR.y, pBR.z, pBL.x, pBL.y, pBL.z,
        // Face Left: 0 -> BL -> TL
        p0.x, p0.y, p0.z, pBL.x, pBL.y, pBL.z, pTL.x, pTL.y, pTL.z
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const frustumMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });

    frustumMesh = new THREE.Mesh(geometry, frustumMat);
    cameraGroup.add(frustumMesh);

    // Frustum Wireframe Edges (so they stand out beautifully)
    const lineVertices = new Float32Array([
        p0.x, p0.y, p0.z, pTL.x, pTL.y, pTL.z,
        p0.x, p0.y, p0.z, pTR.x, pTR.y, pTR.z,
        p0.x, p0.y, p0.z, pBR.x, pBR.y, pBR.z,
        p0.x, p0.y, p0.z, pBL.x, pBL.y, pBL.z,
        
        pTL.x, pTL.y, pTL.z, pTR.x, pTR.y, pTR.z,
        pTR.x, pTR.y, pTR.z, pBR.x, pBR.y, pBR.z,
        pBR.x, pBR.y, pBR.z, pBL.x, pBL.y, pBL.z,
        pBL.x, pBL.y, pBL.z, pTL.x, pTL.y, pTL.z
    ]);

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
    
    frustumEdges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
        color: 0x00f2fe,
        linewidth: 1.5,
        transparent: true,
        opacity: 0.7
    }));
    cameraGroup.add(frustumEdges);

    // Target Plane at Distance D (solid translucent light blue plane)
    const targetPlaneGeo = new THREE.PlaneGeometry(hw * 2, hh * 2);
    targetPlaneGeo.translate(0, 0, -distance);
    
    targetPlaneMesh = new THREE.Mesh(
        targetPlaneGeo,
        new THREE.MeshBasicMaterial({
            color: 0x00f2fe, // Azul claro / ciano
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        })
    );
    cameraGroup.add(targetPlaneMesh);

    // Create container group for dimension lines
    dimensionLines = new THREE.Group();
    cameraGroup.add(dimensionLines);

    const arrowSize = 0.15; // size of arrow ticks
    const offset = 0.25; // distance offset from target frame

    // 1. Horizontal dimension (Width) - Emerald color
    const hY = hh + offset;
    const hPoints = [
        // Main line
        new THREE.Vector3(-hw, hY, -distance),
        new THREE.Vector3(hw, hY, -distance),
        
        // Left tick/arrow
        new THREE.Vector3(-hw, hY - 0.1, -distance),
        new THREE.Vector3(-hw, hY + 0.1, -distance),
        new THREE.Vector3(-hw, hY, -distance),
        new THREE.Vector3(-hw + arrowSize, hY + arrowSize/2, -distance),
        new THREE.Vector3(-hw, hY, -distance),
        new THREE.Vector3(-hw + arrowSize, hY - arrowSize/2, -distance),

        // Right tick/arrow
        new THREE.Vector3(hw, hY - 0.1, -distance),
        new THREE.Vector3(hw, hY + 0.1, -distance),
        new THREE.Vector3(hw, hY, -distance),
        new THREE.Vector3(hw - arrowSize, hY + arrowSize/2, -distance),
        new THREE.Vector3(hw, hY, -distance),
        new THREE.Vector3(hw - arrowSize, hY - arrowSize/2, -distance),
    ];
    const hDimGeo = new THREE.BufferGeometry().setFromPoints(hPoints);
    const hDimMat = new THREE.LineBasicMaterial({
        color: 0x00f5a0,
        transparent: true,
        opacity: 0.8
    });
    const hDimLineMesh = new THREE.LineSegments(hDimGeo, hDimMat);
    dimensionLines.add(hDimLineMesh);

    // 2. Vertical dimension (Height) - Amber color
    const vX = hw + offset;
    const vPoints = [
        // Main line
        new THREE.Vector3(vX, -hh, -distance),
        new THREE.Vector3(vX, hh, -distance),

        // Bottom tick/arrow
        new THREE.Vector3(vX - 0.1, -hh, -distance),
        new THREE.Vector3(vX + 0.1, -hh, -distance),
        new THREE.Vector3(vX, -hh, -distance),
        new THREE.Vector3(vX - arrowSize/2, -hh + arrowSize, -distance),
        new THREE.Vector3(vX, -hh, -distance),
        new THREE.Vector3(vX + arrowSize/2, -hh + arrowSize, -distance),

        // Top tick/arrow
        new THREE.Vector3(vX - 0.1, hh, -distance),
        new THREE.Vector3(vX + 0.1, hh, -distance),
        new THREE.Vector3(vX, hh, -distance),
        new THREE.Vector3(vX - arrowSize/2, hh - arrowSize, -distance),
        new THREE.Vector3(vX, hh, -distance),
        new THREE.Vector3(vX + arrowSize/2, hh - arrowSize, -distance),
    ];
    const vDimGeo = new THREE.BufferGeometry().setFromPoints(vPoints);
    const vDimMat = new THREE.LineBasicMaterial({
        color: 0xffaf40,
        transparent: true,
        opacity: 0.8
    });
    const vDimLineMesh = new THREE.LineSegments(vDimGeo, vDimMat);
    dimensionLines.add(vDimLineMesh);

    // 3. Text labels using canvas textures
    const widthText = `${(hw * 2).toFixed(2)}m`;
    const heightText = `${(hh * 2).toFixed(2)}m`;

    const widthSprite = createTextSprite(widthText, '#00f5a0');
    widthSprite.position.set(0, hY + 0.25, -distance);
    dimensionLines.add(widthSprite);

    const heightSprite = createTextSprite(heightText, '#ffaf40');
    heightSprite.position.set(vX + 0.45, 0, -distance);
    dimensionLines.add(heightSprite);

    // --- Calcule e desenhe as linhas de interseção com as paredes/piso/teto (Abraçando os cantos) ---
    const roomW = parseFloat(elRoomWidth.value);
    const roomL = parseFloat(elRoomLength.value);
    const roomH = parseFloat(elRoomHeight.value);



    // Check if camera is inside or outside
    const minX = -roomW / 2, maxX = roomW / 2;
    const minY = 0, maxY = roomH;
    const minZ = 0, maxZ = roomL;
    const isInside = (cameraGroup.position.x >= minX && cameraGroup.position.x <= maxX &&
                      cameraGroup.position.y >= minY && cameraGroup.position.y <= maxY &&
                      cameraGroup.position.z >= minZ && cameraGroup.position.z <= maxZ);

    // Função para converter caminhos de pontos em pares de segmentos de reta
    const getPathSegments = (path) => {
        const segs = [];
        for (let i = 0; i < path.length - 1; i++) {
            segs.push(path[i], path[i + 1]);
        }
        return segs;
    };

    // 1. Calcular caminhos de saída/colisão final (Amarelo)
    const pathTL_TR_exit = getFaceIntersectionPath(cameraGroup.position, pTL, pTR, roomW, roomH, roomL, true);
    const pathTR_BR_exit = getFaceIntersectionPath(cameraGroup.position, pTR, pBR, roomW, roomH, roomL, true);
    const pathBR_BL_exit = getFaceIntersectionPath(cameraGroup.position, pBR, pBL, roomW, roomH, roomL, true);
    const pathBL_TL_exit = getFaceIntersectionPath(cameraGroup.position, pBL, pTL, roomW, roomH, roomL, true);

    const exitPoints = [
        ...getPathSegments(pathTL_TR_exit),
        ...getPathSegments(pathTR_BR_exit),
        ...getPathSegments(pathBR_BL_exit),
        ...getPathSegments(pathBL_TL_exit)
    ];

    if (exitPoints.length > 0) {
        intersectionLines = new THREE.Group();
        scene.add(intersectionLines);

        const exitGeo = new THREE.BufferGeometry().setFromPoints(exitPoints);
        const exitMat = new THREE.LineBasicMaterial({
            color: 0xffd700, // Amarelo Ouro (Colisão Total / Saída)
            linewidth: 3
        });
        const exitLineMesh = new THREE.LineSegments(exitGeo, exitMat);
        intersectionLines.add(exitLineMesh);

        // 2. Se a câmera estiver fora, desenhar caminhos de entrada/colisão inicial (Vermelho)
        if (!isInside) {
            const pathTL_TR_entry = getFaceIntersectionPath(cameraGroup.position, pTL, pTR, roomW, roomH, roomL, false);
            const pathTR_BR_entry = getFaceIntersectionPath(cameraGroup.position, pTR, pBR, roomW, roomH, roomL, false);
            const pathBR_BL_entry = getFaceIntersectionPath(cameraGroup.position, pBR, pBL, roomW, roomH, roomL, false);
            const pathBL_TL_entry = getFaceIntersectionPath(cameraGroup.position, pBL, pTL, roomW, roomH, roomL, false);

            const entryPoints = [
                ...getPathSegments(pathTL_TR_entry),
                ...getPathSegments(pathTR_BR_entry),
                ...getPathSegments(pathBR_BL_entry),
                ...getPathSegments(pathBL_TL_entry)
            ];

            if (entryPoints.length > 0) {
                const entryGeo = new THREE.BufferGeometry().setFromPoints(entryPoints);
                const entryMat = new THREE.LineBasicMaterial({
                    color: 0xff3333, // Vermelho Vivo (Colisão Inicial / Entrada)
                    linewidth: 3
                });
                const entryLineMesh = new THREE.LineSegments(entryGeo, entryMat);
                intersectionLines.add(entryLineMesh);
            }
        }
    }
}

// Auxiliares seguros de conversão de coordenadas para evitar incompatibilidades de matrixWorldInverse no Three.js
const tempMatrix = new THREE.Matrix4();
function safeLocalToWorld(vector, object) {
    return vector.clone().applyMatrix4(object.matrixWorld);
}
function safeWorldToLocal(vector, object) {
    tempMatrix.copy(object.matrixWorld).invert();
    return vector.clone().applyMatrix4(tempMatrix);
}

// Calcula o caminho de interseção de uma face do frustum fazendo amostragem sequencial por Ray Casting (Ray Marching)
function getFaceIntersectionPath(origin, vA, vB, w, h, l, isExit) {
    const points = [];
    const steps = 48; // Número de amostras para suavidade do contorno
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Interpola o vetor no espaço local da câmera
        const vLocal = vA.clone().lerp(vB, t);
        
        // Converte o ponto local para uma direção no mundo
        const worldPt = safeLocalToWorld(vLocal, cameraGroup);
        const dir = worldPt.clone().sub(origin).normalize();
        
        const hit = getBoxIntersections(origin, dir, w, h, l);
        if (hit) {
            const pt = isExit ? hit.exit : hit.entry;
            if (pt) {
                points.push(pt);
            }
        }
    }
    return points;
}

// Auxiliar para calcular todas as interseções (entrada/mínima e saída/máxima) de um raio com a sala (AABB)
function getBoxIntersections(origin, dir, w, h, l) {
    const minX = -w / 2, maxX = w / 2;
    const minY = 0, maxY = h;
    const minZ = 0, maxZ = l;
    
    let tVals = [];
    
    const checkPlane = (t, pt) => {
        if (t > 0.001) {
            if (pt.x >= minX - 0.001 && pt.x <= maxX + 0.001 &&
                pt.y >= minY - 0.001 && pt.y <= maxY + 0.001 &&
                pt.z >= minZ - 0.001 && pt.z <= maxZ + 0.001) {
                tVals.push({ t, pt });
            }
        }
    };
    
    // Planos X (Paredes Laterais)
    if (Math.abs(dir.x) > 0.0001) {
        let t = (minX - origin.x) / dir.x;
        checkPlane(t, new THREE.Vector3().copy(origin).addScaledVector(dir, t));
        
        t = (maxX - origin.x) / dir.x;
        checkPlane(t, new THREE.Vector3().copy(origin).addScaledVector(dir, t));
    }
    // Planos Y (Piso e Teto)
    if (Math.abs(dir.y) > 0.0001) {
        let t = (minY - origin.y) / dir.y;
        checkPlane(t, new THREE.Vector3().copy(origin).addScaledVector(dir, t));
        
        t = (maxY - origin.y) / dir.y;
        checkPlane(t, new THREE.Vector3().copy(origin).addScaledVector(dir, t));
    }
    // Planos Z (Parede Traseira e Frontal)
    if (Math.abs(dir.z) > 0.0001) {
        let t = (minZ - origin.z) / dir.z;
        checkPlane(t, new THREE.Vector3().copy(origin).addScaledVector(dir, t));
        
        t = (maxZ - origin.z) / dir.z;
        checkPlane(t, new THREE.Vector3().copy(origin).addScaledVector(dir, t));
    }
    
    // Ordena as interseções pelo parâmetro t (distância)
    tVals.sort((a, b) => a.t - b.t);
    
    if (tVals.length === 0) return null;
    
    const isInside = (origin.x >= minX && origin.x <= maxX &&
                      origin.y >= minY && origin.y <= maxY &&
                      origin.z >= minZ && origin.z <= maxZ);
                      
    if (isInside) {
        // Se a câmera está dentro, a "entrada" é a própria câmera e a "saída" é a parede
        return {
            entry: origin.clone(),
            exit: tVals[0].pt
        };
    } else {
        // Câmera fora do espaço: precisa de pelo menos 2 pontos (onde entra e onde sai do volume)
        if (tVals.length >= 2) {
            return {
                entry: tVals[0].pt,
                exit: tVals[tVals.length - 1].pt
            };
        } else if (tVals.length === 1) {
            return {
                entry: tVals[0].pt,
                exit: tVals[0].pt
            };
        }
    }
    return null;
}

// Helper to create text sprites for dimensions in 3D
function createTextSprite(text, colorStr = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = colorStr;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
}

// Event Listeners setup
function setupEventListeners() {
    // Preset dropdown changed
    elSensorPreset.addEventListener('change', (e) => {
        const preset = e.target.value;
        if (preset === 'custom') {
            elCustomSensorDims.style.display = 'grid';
        } else {
            elCustomSensorDims.style.display = 'none';
        }

        // Auto-select focal length type based on sensor selection
        if (preset !== 'custom') {
            if (preset === '35mm') {
                elFocalReal.checked = true;
            } else {
                elFocalEquiv.checked = true;
            }
        }
        
        updateCalculations();
    });

    // Custom sensor dimension changes
    elSensorWidth.addEventListener('input', updateCalculations);
    elSensorHeight.addEventListener('input', updateCalculations);

    // Link Slider & Number Input for Focal Length
    elFocalLengthSlider.addEventListener('input', (e) => {
        elFocalLength.value = e.target.value;
        updateCalculations();
    });
    elFocalLength.addEventListener('input', (e) => {
        elFocalLengthSlider.value = e.target.value;
        updateCalculations();
    });

    // Helper to calculate current diagonal crop factor for on-the-fly conversions
    const getCurrentCropDiag = () => {
        let w = parseFloat(elSensorWidth.value);
        let h = parseFloat(elSensorHeight.value);
        const preset = elSensorPreset.value;
        if (preset !== 'custom') {
            w = SENSOR_PRESETS[preset].width;
            h = SENSOR_PRESETS[preset].height;
        }
        const diag = Math.sqrt(w * w + h * h);
        return REFERENCE_FF_DIAG / diag;
    };

    // Focal length type radio buttons with smart swap calculation
    elFocalReal.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Equivalent to Real: Real = Equiv / Crop Factor
            const crop = getCurrentCropDiag();
            const currentVal = parseFloat(elFocalLength.value);
            const newVal = currentVal / crop;
            elFocalLength.value = newVal.toFixed(1);
            elFocalLengthSlider.value = Math.round(newVal);
            updateCalculations();
        }
    });
    elFocalEquiv.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Real to Equivalent: Equiv = Real * Crop Factor
            const crop = getCurrentCropDiag();
            const currentVal = parseFloat(elFocalLength.value);
            const newVal = currentVal * crop;
            elFocalLength.value = newVal.toFixed(1);
            elFocalLengthSlider.value = Math.round(newVal);
            updateCalculations();
        }
    });

    // Link Sliders & Number Inputs for orientation
    elCamYawSlider.addEventListener('input', (e) => {
        elCamYaw.value = e.target.value;
        updateCalculations();
    });
    elCamYaw.addEventListener('input', (e) => {
        elCamYawSlider.value = e.target.value;
        updateCalculations();
    });

    elCamPitchSlider.addEventListener('input', (e) => {
        elCamPitch.value = e.target.value;
        updateCalculations();
    });
    elCamPitch.addEventListener('input', (e) => {
        elCamPitchSlider.value = e.target.value;
        updateCalculations();
    });

    elCamRollSlider.addEventListener('input', (e) => {
        elCamRoll.value = e.target.value;
        updateCalculations();
    });
    elCamRoll.addEventListener('input', (e) => {
        elCamRollSlider.value = e.target.value;
        updateCalculations();
    });

    // Camera coordinates and orientation inputs
    const inputs3D = [elCamX, elCamY, elCamZ, elCamYaw, elCamPitch, elCamRoll];
    inputs3D.forEach(input => {
        input.addEventListener('input', updateCalculations);
    });

    // Room dimensions (updates room structure in 3D)
    const roomInputs = [elRoomWidth, elRoomLength, elRoomHeight];
    roomInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateRoom3D();
            updateCalculations();
        });
    });

    // Link Slider & Number Input for Target Distance D
    elTargetDistSlider.addEventListener('input', (e) => {
        elTargetDist.value = e.target.value;
        updateCalculations();
    });
    elTargetDist.addEventListener('input', (e) => {
        elTargetDistSlider.value = e.target.value;
        updateCalculations();
    });

    // HUD buttons
    elBtnResetView.addEventListener('click', reset3DCamera);
    
    elBtnToggleGrid.addEventListener('click', () => {
        isGridVisible = !isGridVisible;
        if (isGridVisible) {
            elBtnToggleGrid.classList.add('active');
        } else {
            elBtnToggleGrid.classList.remove('active');
        }
        updateRoom3D();
    });

    // Language Switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// Run the initialization
window.onload = init;
