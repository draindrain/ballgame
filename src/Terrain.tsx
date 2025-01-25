import { RigidBody, useRapier } from "@react-three/rapier"
import { useEffect, useState } from "react"
import { createNoise2D } from "simplex-noise"
import { PlaneGeometry } from "three"

const TERRAIN_SIZE = 1024
const TERRAIN_ARRAY_MAX = TERRAIN_SIZE - 1
const TERRAIN_VERTEX_COUNT = TERRAIN_SIZE * TERRAIN_SIZE
const NOISE_SCALE = 0.003
const SECONDARY_NOISE_SCALE = 0.001
const HEIGHT_MULTIPLIER = 100
const WIDTH_MULTIPLIER = 10

const Terrain = () => {
    const { rapier, world } = useRapier()
    const [geometry, setGeometry] = useState<PlaneGeometry | undefined>(
        undefined
    )
    useEffect(() => {
        const noise2D = createNoise2D()
        const heightMap = new Float32Array(TERRAIN_VERTEX_COUNT)
        const geometry = new PlaneGeometry(
            TERRAIN_ARRAY_MAX * WIDTH_MULTIPLIER,
            TERRAIN_ARRAY_MAX * WIDTH_MULTIPLIER,
            TERRAIN_ARRAY_MAX,
            TERRAIN_ARRAY_MAX
        )
        const planePosition = geometry.attributes.position
        for (var i = 0; i < TERRAIN_VERTEX_COUNT; i++) {
            const x = planePosition.getX(i)
            const z = planePosition.getY(i)
            const height =
                (noise2D(x * NOISE_SCALE, z * NOISE_SCALE) +
                    noise2D(
                        x * SECONDARY_NOISE_SCALE,
                        z * SECONDARY_NOISE_SCALE
                    ) *
                        2) *
                HEIGHT_MULTIPLIER
            planePosition.setZ(i, height)
        }

        for (var i = 0; i < TERRAIN_VERTEX_COUNT; i++) {
            const x =
                (planePosition.getX(i) + WIDTH_MULTIPLIER / 2) /
                    WIDTH_MULTIPLIER +
                TERRAIN_SIZE / 2 -
                1
            const z =
                TERRAIN_SIZE -
                1 -
                ((planePosition.getY(i) + WIDTH_MULTIPLIER / 2) /
                    WIDTH_MULTIPLIER +
                    TERRAIN_SIZE / 2 -
                    1)
            heightMap[x * TERRAIN_SIZE + z] = planePosition.getZ(i)
        }
        geometry.computeVertexNormals()

        let rigidBody = world.createRigidBody(rapier.RigidBodyDesc.fixed())
        let colliderDesc = rapier.ColliderDesc.heightfield(
            TERRAIN_ARRAY_MAX,
            TERRAIN_ARRAY_MAX,
            heightMap,
            {
                x: TERRAIN_ARRAY_MAX * WIDTH_MULTIPLIER,
                y: 1.0,
                z: TERRAIN_ARRAY_MAX * WIDTH_MULTIPLIER,
            }
        )
        const collider = world.createCollider(colliderDesc, rigidBody)

        setGeometry(geometry)

        return () => {
            world.removeCollider(collider, false)
        }
    }, [])
    if (!geometry) return null
    return (
        <RigidBody colliders={false} type='fixed'>
            <mesh geometry={geometry} rotation-x={-Math.PI / 2}>
                <meshStandardMaterial wireframe color={"teal"} />
            </mesh>
        </RigidBody>
    )
}

export default Terrain
