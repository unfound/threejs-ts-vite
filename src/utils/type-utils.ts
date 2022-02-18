import type { Mesh, Object3D, MeshStandardMaterial, Material } from 'three'

export function isMesh (obj: Object3D | Mesh): obj is Mesh {
    return (<Mesh>obj).isMesh
}

export function isMeshStandardMaterial (material: Material | MeshStandardMaterial): material is MeshStandardMaterial {
    return (<MeshStandardMaterial>material).type === 'MeshStandardMaterial'
}
