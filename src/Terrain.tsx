import { RigidBody, useRapier } from "@react-three/rapier"
import { useEffect, useState } from "react"
import { createNoise2D } from "simplex-noise"
import { PlaneGeometry } from "three"

const TERRAIN_SIZE = 512
const TERRAIN_ARRAY_MAX = TERRAIN_SIZE - 1
const TERRAIN_VERTEX_COUNT = TERRAIN_SIZE * TERRAIN_SIZE
const NOISE_SCALE_1 = 0.0005
const NOISE_SCALE_2 = 0.01
const NOISE_SCALE_3 = 0.002
const HEIGHT_MULTIPLIER = 10
const WIDTH_MULTIPLIER = 10

const Terrain = () => {
    const { rapier, world } = useRapier()
    const [geometry, setGeometry] = useState<PlaneGeometry | undefined>(
        undefined
    )
    useEffect(() => {
        const noise2D = createNoise2D()
        const noise2D2 = createNoise2D()
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

            const noise3 = noise2D(x * NOISE_SCALE_3, z * NOISE_SCALE_3)
            const noise1 = noise2D2(x * NOISE_SCALE_1, z * NOISE_SCALE_1)
            const noiseSwitch = Math.max(noise1 + noise3 - 0.1, 0)
            const noise2 =
                noise2D(x * NOISE_SCALE_2, z * NOISE_SCALE_2) * noiseSwitch

            const height =
                (noise2 * 2 + noise3 * 16 + noise1 * 20) * HEIGHT_MULTIPLIER
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
                <meshStandardMaterial color={"teal"} />
            </mesh>
        </RigidBody>
    )
}

export default Terrain
