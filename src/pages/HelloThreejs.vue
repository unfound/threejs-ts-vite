<script setup lang="ts">
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { ref, onMounted } from 'vue'

const wrapper = ref<HTMLDivElement | null>(null)

onMounted(() => {
    if (wrapper.value) {
        if (!WebGL.isWebGLAvailable()) {
            const warningDiv = WebGL.getWebGLErrorMessage()
            wrapper.value.append(warningDiv)
            return
        }
        const scene = new Scene()
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        const renderer = new WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        wrapper.value.append(renderer.domElement)
        const geometry = new BoxGeometry(2, 2, 2)
        const material = new MeshBasicMaterial({ color: 0x00ff00 })
        const cube = new Mesh(geometry, material)
        scene.add(cube)
        camera.position.z = 5

        function animate () {
            requestAnimationFrame(animate)
            cube.rotation.x += 0.01
            cube.rotation.y += 0.01
            renderer.render(scene, camera)
        }
        animate()
    }
})

</script>

<template>
    <div ref="wrapper"></div>
</template>