<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    TextureLoader,
    Fog,
    DirectionalLight,
    Object3D,
    AmbientLight,
    LoadingManager,
    MeshStandardMaterial,
    PointsMaterial,
    AdditiveBlending,
    Points,
    BufferGeometry,
    BufferAttribute,
    Color,
    AnimationMixer,
    Clock,
    MeshPhysicalMaterial,
    MeshDepthMaterial,
    DoubleSide,
    RGBADepthPacking
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import skyTexture from '../images/sky.jpg'
import snowTexture from '../images/snow.png'
import landModel from '../models/land.glb'
import icePandaModel from '../models/bingdwendwen.glb'
import flagModel from '../models/flag.glb'
import flagTexture from '../images/flag.png'
import treeModel from '../models/tree.gltf'
import treeTexture from '../images/tree.png'
import { isMesh } from '../utils/type-utils'

const wrapper = ref<HTMLDivElement | null>(null)

onMounted(() => {
    if (wrapper.value) {
        if (!WebGL.isWebGLAvailable()) {
            const warningDiv = WebGL.getWebGLErrorMessage()
            wrapper.value.append(warningDiv)
            return
        }
        // 性能测试器
        const stats = Stats()
        document.body.appendChild(stats.dom)
        // 初始化时钟
        const clock = new Clock();
        // 初始化渲染器，开启抗锯齿
        const renderer = new WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.shadowMap.enabled = true
        wrapper.value.append(renderer.domElement)
        // 设置摄像机
        const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 20, 100)
        camera.position.set(2, 10, 30)
        camera.lookAt(0, 0, 0)
        // 设置场景
        const scene = new Scene()
        scene.background = new TextureLoader().load(skyTexture)
        scene.fog = new Fog(0xffffff, 20, 100) // 雾气
        // 设置阳光
        const target = new Object3D()
        target.position.set(0, 0, 0)
        target.visible = false
        const light = new DirectionalLight(0xffffff, 1)
        light.position.set(16, 16, 8)
        light.castShadow = true // 开启阴影
        light.target = target
        light.shadow.mapSize.width = 512 * 12
        light.shadow.mapSize.height = 512 * 12
        light.shadow.camera.top = 40
        light.shadow.camera.bottom = -40
        light.shadow.camera.left = -40
        light.shadow.camera.right = 40
        scene.add(light)
        // 环境光
        scene.add(new AmbientLight(0xcfffff))
        // 载入管理器
        const manager = new LoadingManager()
        manager.onStart = (url, loaded, total) => {};
        manager.onLoad = () => { console.log('Loading complete!') };
        manager.onProgress = (url, loaded, total) => {}
        // 添加地面
        const loader = new GLTFLoader(manager)
        const meshes = []
        let land
        loader.load(landModel, function (mesh) {
            mesh.scene.traverse(function (child) {
                if (isMesh(child)) {
                    meshes.push(child)
                    const material = (child.material as MeshStandardMaterial)
                    material.metalness = .1
                    material.roughness = .8
                    // 地面
                    if (child.name === 'Mesh_2') {
                        material.metalness = .5;
                        child.receiveShadow = true;
                    }
                    // 雪人下半身
                    if (child.name === 'Mesh_3') {
                        child.castShadow = true
                    }
                    // 雪人帽子
                    if (child.name === 'Mesh_4') {
                        child.castShadow = true
                    }
                    // 雪人头
                    if (child.name === 'Mesh_5') {
                        child.castShadow = true
                    }
                    // 围巾
                    if (child.name === 'Mesh_17') {
                        material.metalness = .2;
                        material.roughness = .8;
                    }
                }
            })
            mesh.scene.rotation.y = Math.PI / 4
            mesh.scene.position.set(15, -20, 0)
            mesh.scene.scale.set(.9, .9, .9)
            land = mesh.scene
            scene.add(land)
        }, undefined, (err) => {
            console.error(err)
        })
        // 冰墩墩
        loader.load(icePandaModel, function (mesh) {
            mesh.scene.traverse(function (child) {
            if (isMesh(child)) {
                meshes.push(child)
                const material = (child.material as MeshStandardMaterial)
                if (child.name === '皮肤') {
                    material.metalness = .3;
                    material.roughness = .8;
                }

                if (child.name === '外壳') {
                    material.transparent = true;
                    material.opacity = .4;
                    material.metalness = .4;
                    material.roughness = 0;
                    material.refractionRatio = 1.6;
                    child.castShadow = true;
                    // material.envMap = new TextureLoader().load(skyTexture);
                    // material.envMapIntensity = 1;
                }

                if (child.name === '围脖') {
                    material.transparent = true;
                    material.opacity = .6;
                    material.metalness = .4;
                    material.roughness = .6;
                }
            }
            });

            mesh.scene.rotation.y = Math.PI / 24;
            mesh.scene.position.set(-5, -11.5, 0);
            mesh.scene.scale.set(24, 24, 24);

            scene.add(mesh.scene);
        }, undefined, (err) => {
            console.error(err)
        })
        // 旗帜
        let mixer: AnimationMixer
        loader.load(flagModel, mesh => {
            mesh.scene.traverse(child => {
                if (isMesh(child)) {
                    meshes.push(child)
                    child.castShadow = true
                    const material = (child.material as MeshStandardMaterial)
                    if (child.name === 'mesh_0001') {
                        material.metalness = .1
                        material.roughness = .1
                        material.map = new TextureLoader().load(flagTexture)
                    }

                    if (child.name === '柱体') {
                        material.metalness = .6
                        material.roughness = 0
                        material.refractionRatio = 1
                        material.color = new Color(0xeeeeee)
                    }
                }
            })
            mesh.scene.rotation.y = Math.PI / 24
            mesh.scene.position.set(2, -7, -1)
            mesh.scene.scale.set(4, 4, 4)

            const meshAnimation = mesh.animations[0]
            mixer = new AnimationMixer(mesh.scene)
            mixer.clipAction(meshAnimation).play()
            scene.add(mesh.scene)

        })
        // 添加树
        const treeMaterial = new MeshPhysicalMaterial({
            map: new TextureLoader().load(treeTexture),
            transparent: true,
            side: DoubleSide,
            metalness: .2,
            roughness: .8,
            depthTest: true,
            depthWrite: false,
            fog: false,
            reflectivity: .1,
            refractionRatio: 0
        })
        const treeCustomDepthMaterial = new MeshDepthMaterial({
            depthPacking: RGBADepthPacking,
            map: new TextureLoader().load(treeTexture),
            alphaTest: .5
        })
        loader.load(treeModel, function (mesh) {
            mesh.scene.traverse(function (child) {
                if (isMesh(child)) {
                    meshes.push(child)
                    child.material = treeMaterial
                    child.customDepthMaterial = treeCustomDepthMaterial
                    if (child.name === '平面') {
                        child.castShadow = true
                    }
                }
            })

            mesh.scene.position.set(4, -10, -20)
            mesh.scene.scale.set(20, 20, 20)
            mesh.scene.rotateY(-20 * (Math.PI / 180))
            scene.add(mesh.scene)

            const tree2 = mesh.scene.clone()
            tree2.position.set(-20, -12, -30)
            tree2.scale.set(18, 18, 18)
            scene.add(tree2)

            const tree3 = mesh.scene.clone()
            tree3.position.set(-30, -12, -10)
            tree3.scale.set(18, 18, 18)
            scene.add(tree3)
        })

        // 创建雪花
        const snowTT = new TextureLoader().load(snowTexture)
        const snowGeometry = new BufferGeometry()
        const pointsMaterial = new PointsMaterial({
            size: 1,
            transparent: true,
            opacity: 0.8,
            map: snowTT,
            blending: AdditiveBlending,
            sizeAttenuation: true,
            depthTest: false
        });

        let range = 60;
        const vertices: number[] = [];
        const speads: Array<{
            velocityX: number,
            velocityY: number
        }> = []
        for (let i = 0; i < 1200; i++) {
            vertices.push(Math.random() * range - range / 2)  // x
            vertices.push(Math.random() * range * 0.8)  // y
            vertices.push(Math.random() * range - range / 2) // z
            speads.push({
                velocityX: (Math.random() - 0.9) / 2,
                velocityY: 0.1 + Math.random() / 3
            })
        }
        snowGeometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
        snowGeometry.center();
        const points = new Points(snowGeometry, pointsMaterial);
        points.position.y = -30;    
        scene.add(points);

        // 摄像头轨道控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = true;

        // 垂直旋转角度限制
        controls.minPolarAngle = 1;
        controls.maxPolarAngle = 1.8;

        // 水平旋转角度限制
        controls.minAzimuthAngle = -.8;
        controls.maxAzimuthAngle = .8;
        function animate () {
            requestAnimationFrame(animate)
            stats && stats.update()
            controls && controls.update()
            renderer && renderer.render(scene, camera)
            for (let i = 0; i < vertices.length; i += 3) {
                const speedIndex = i / 3
                vertices[i] = vertices[i] - speads[speedIndex].velocityX // 更新x
                vertices[i + 1] = vertices[i + 1] - speads[speedIndex].velocityY // 更新y
                if (vertices[i] < -60) {
                    vertices[i] = 60
                }
                if (vertices[i] >= 60) {
                    vertices[i] = -60
                }
                if (vertices[i + 1] <= 0) {
                    vertices[i + 1] = 60
                }
            }
            snowGeometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
            mixer && mixer.update(clock.getDelta())
        }
        function onWindowResize () {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onWindowResize, false)
        animate()
    }
})

</script>

<template>
    <div ref="wrapper"></div>
</template>