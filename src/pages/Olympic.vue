<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    TextureLoader,
    Fog,
    DirectionalLight,
    BoxGeometry,
    MeshLambertMaterial,
    Mesh,
    Object3D,
    AmbientLight,
    LoadingManager,
    MeshStandardMaterial,
    PointsMaterial,
    Vector3,
    AdditiveBlending,
    Points,
    BufferGeometry
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Geometry } from 'three/examples/jsm/deprecated/Geometry'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import skyTexture from '../images/sky.jpg'
import snowTexture from '../images/snow.png'
import landModel from '../models/land.glb'
import icePandaModel from '../models/bingdwendwen.glb'
import { isMesh, isMeshStandardMaterial } from '../utils/type-utils'

const wrapper = ref<HTMLDivElement | null>(null)

onMounted(() => {
    if (wrapper.value) {
        if (!WebGL.isWebGLAvailable()) {
            const warningDiv = WebGL.getWebGLErrorMessage()
            wrapper.value.append(warningDiv)
            return
        }
        // 初始化渲染器，开启抗锯齿
        const renderer = new WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.shadowMap.enabled = true
        wrapper.value.append(renderer.domElement)
        // 设置摄像机
        const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500)
        camera.position.set(0, 10, 30)
        camera.lookAt(0, 0, 0)
        // 设置场景
        const scene = new Scene()
        scene.background = new TextureLoader().load(skyTexture)
        scene.fog = new Fog(0xffffff, 20, 1000) // 雾气
        // 设置阳光
        // const cubeGeometry = new BoxGeometry(0.001, 0.001, 0.001)
        // const cubeMaterial = new MeshLambertMaterial({ color: 0xdc161a})
        // const cube = new Mesh(cubeGeometry, cubeMaterial)
        // cube.position.set(0, 0, 0)
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
                    // 围巾
                    if (child.name === 'Mesh_17') {
                        material.metalness = .2;
                        material.roughness = .8;
                    }
                    // 帽子
                    if (child.name === 'Mesh_17') { }
                }
            })
            // mesh.scene.castShadow = true
            // mesh.scene.receiveShadow = true
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
                console.log(child)
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
        // 创建雪花
        const snowTT = new TextureLoader().load(snowTexture)
        const snowGeometry = new Geometry()
        const pointsMaterial = new PointsMaterial({
            size: 1,
            transparent: true,
            opacity: 0.8,
            map: snowTT,
            blending: AdditiveBlending,
            sizeAttenuation: true,
            depthTest: false
        });

        let range = 100;
        let vertices = []
        for (let i = 0; i < 1500; i++) {
            let vertice = new Vector3(Math.random() * range - range / 2, Math.random() * range * 1.5, Math.random() * range - range / 2);
            // 纵向移动速度
            vertice.velocityY = 0.1 + Math.random() / 3;
            // 横向移动速度
            vertice.velocityX = (Math.random() - 0.5) / 3;
            // 将顶点加入几何
            snowGeometry.vertices.push(vertice);
        }

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
            controls && controls.update()
            renderer && renderer.render(scene, camera)
        }
        animate()
    }
})

</script>

<template>
    <div ref="wrapper"></div>
</template>