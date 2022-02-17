<script setup lang="ts">
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    LineBasicMaterial,
    BufferGeometry,
    Line,
    Vector3
} from 'three'
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
        const renderer = new WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        wrapper.value.append(renderer.domElement)

        const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500)
        camera.position.set(0, 0, 100)
        camera.lookAt(0, 0, 0)

        const lineMaterial = new LineBasicMaterial({ color: 0x0000ff })
        const points = []
        points.push(new Vector3(-10, 0, 0))
        points.push(new Vector3(0, 10, 0))
        points.push(new Vector3(10, 0, 0))
        const geometry = new BufferGeometry().setFromPoints(points)
        const line = new Line(geometry, lineMaterial)

        const scene = new Scene()
        scene.add(line)
        renderer.render(scene, camera)
    }
})

</script>

<template>
    <div ref="wrapper"></div>
</template>