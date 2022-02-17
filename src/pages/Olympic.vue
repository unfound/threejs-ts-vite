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
    LoadingManager
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import skyTexture from '../images/sky.jpg'
import landModel from '../models/land.glb'
import icePandaModel from '../models/bingdwendwen.glb'

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
        // renderer.shadowMap.enabled = true
        wrapper.value.append(renderer.domElement)
        // 设置摄像机
        const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(0, 5, 10)
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
                if (child.isMesh) {
                    meshes.push(child)
                    child.material.metalness = .1
                    child.material.roughness = .8
                    // 地面
                    if (child.name === 'Mesh_2') {
                        child.material.metalness = .5;
                        child.receiveShadow = true;
                    }
                    // 围巾
                    if (child.name === 'Mesh_17') {
                        child.material.metalness = .2;
                        child.material.roughness = .8;
                    }
                    // 帽子
                    if (child.name === 'Mesh_17') { }
                }
            })
            mesh.scene.receiveShadow = true
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
            console.log(child)
            if (child.isMesh) {
                meshes.push(child)

                if (child.name === '皮肤') {
                    child.material.metalness = .3;
                    child.material.roughness = .8;
                }

                if (child.name === '外壳') {
                    child.material.transparent = true;
                    child.material.opacity = .4;
                    child.material.metalness = .4;
                    child.material.roughness = 0;
                    child.material.refractionRatio = 1.6;
                    child.castShadow = true;
                    child.material.envMap = new TextureLoader().load(skyTexture);
                    child.material.envMapIntensity = 1;
                }

                if (child.name === '围脖') {
                    child.material.transparent = true;
                    child.material.opacity = .6;
                    child.material.metalness = .4;
                    child.material.roughness = .6;
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
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = true;

        // 垂直旋转角度限制
        controls.minPolarAngle = 1.4;
        controls.maxPolarAngle = 1.8;

        // 水平旋转角度限制
        controls.minAzimuthAngle = -.8;
        controls.maxAzimuthAngle = .8;
        function animate () {
            requestAnimationFrame(animate)
            renderer.render(scene, camera)
        }
        animate()
    }
})

</script>

<template>
    <div ref="wrapper"></div>
</template>