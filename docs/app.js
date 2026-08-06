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
const elCamPitch = document.getElementById('cam-pitch');
const elCamRoll = document.getElementById('cam-roll');

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
let cameraGroup, cameraMesh, frustumMesh, frustumEdges, targetPlaneMesh;
let isGridVisible = true;

// Initialize App
function init() {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Set up 3D Scene
    init3D();

    // Event Listeners
    setupEventListeners();

    // Initial calculation & render update
    updateCalculations();

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

    // Add camera visual body
    const camGeo = new THREE.BoxGeometry(0.2, 0.15, 0.3);
    const camMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.2, metalness: 0.1 });
    cameraMesh = new THREE.Mesh(camGeo, camMat);
    cameraMesh.position.set(0, 0, 0);
    cameraGroup.add(cameraMesh);

    // Camera Lens
    const lensGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, 0, -0.2); // pointing along negative Z
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
    roomWireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 2 }));
    roomWireframe.position.set(0, h / 2, l / 2);
    scene.add(roomWireframe);

    // Translucent room volume
    const roomMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    roomMesh = new THREE.Mesh(roomGeo, roomMat);
    roomMesh.position.set(0, h / 2, l / 2);
    roomMesh.receiveShadow = true;
    scene.add(roomMesh);

    // Floor Grid Helper
    if (isGridVisible) {
        gridHelper = new THREE.GridHelper(Math.max(w, l) * 2, Math.max(w, l) * 2, 0x64748b, 0x334155);
        gridHelper.position.set(0, 0, l / 2);
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
}

// Update the vision cone (Frustum) based on current FOV & target distance
function updateCone3D(hfovRad, vfovRad, distance) {
    if (frustumMesh) cameraGroup.remove(frustumMesh);
    if (frustumEdges) cameraGroup.remove(frustumEdges);
    if (targetPlaneMesh) cameraGroup.remove(targetPlaneMesh);

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

    // Target Plane at Distance D (with a subtle custom wire grid)
    const targetPlaneGeo = new THREE.PlaneGeometry(hw * 2, hh * 2, 4, 4);
    targetPlaneGeo.translate(0, 0, -distance);
    
    targetPlaneMesh = new THREE.LineSegments(
        new THREE.WireframeGeometry(targetPlaneGeo),
        new THREE.LineBasicMaterial({
            color: 0xf355da,
            transparent: true,
            opacity: 0.5
        })
    );
    cameraGroup.add(targetPlaneMesh);
}

// Event Listeners setup
function setupEventListeners() {
    // Preset dropdown changed
    elSensorPreset.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            elCustomSensorDims.style.display = 'grid';
        } else {
            elCustomSensorDims.style.display = 'none';
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

    // Focal length type radio buttons
    elFocalReal.addEventListener('change', updateCalculations);
    elFocalEquiv.addEventListener('change', updateCalculations);

    // Camera coordinates and orientation
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
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// Run the initialization
window.onload = init;
