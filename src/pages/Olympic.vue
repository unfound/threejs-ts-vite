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
    AmbientLight
} from 'three'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import GLTFLoader from 'three/examples/jsm/loaders/GLTFLoader'
import skyTexture from '../images/sky.jpg'

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
        camera.position.set(0, 30, 100)
        camera.lookAt(0, 0, 0)
        // 设置场景
        const scene = new Scene()
        scene.background = new TextureLoader().load(skyTexture)
        scene.fog = new Fog(0xffffff, 10, 100) // 雾气
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

        // 添加地面

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