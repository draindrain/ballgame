import { RigidBody, useRapier } from "@react-three/rapier"
import { useMemo } from "react"
import { createNoise2D } from "simplex-noise"
import { PlaneGeometry } from "three"

const TERRAIN_SIZE = 100
const TERRAIN_ARRAY_SIZE = TERRAIN_SIZE - 1
const TERRAIN_VERTEX_COUNT = TERRAIN_SIZE * TERRAIN_SIZE
const NOISE_SCALE = 0.003
const SECONDARY_NOISE_SCALE = 0.001
const HEIGHT_MULTIPLIER = 100
const WIDTH_MULTIPLIER = 10

const Terrain = () => {
    const { rapier, world } = useRapier()
    const geometry = useMemo(() => {
        const noise2D = createNoise2D()
        const heightMap = new Float32Array(TERRAIN_VERTEX_COUNT)
        const geometry = new PlaneGeometry(
            (TERRAIN_SIZE - 1) * WIDTH_MULTIPLIER,
            (TERRAIN_SIZE - 1) * WIDTH_MULTIPLIER,
            TERRAIN_SIZE - 1,
            TERRAIN_SIZE - 1
        )
        const planePosition = geometry.attributes.position
        for (var i = 0; i < TERRAIN_VERTEX_COUNT; i++) {
            const x = planePosition.getX(i)
            const z = planePosition.getY(i)
            const hz =
                -(i % TERRAIN_SIZE) * WIDTH_MULTIPLIER +
                (TERRAIN_SIZE * WIDTH_MULTIPLIER) / 2
            const hx =
                Math.trunc(i / TERRAIN_SIZE) * WIDTH_MULTIPLIER -
                (TERRAIN_SIZE * WIDTH_MULTIPLIER) / 2
            const height =
                (noise2D(x * NOISE_SCALE, z * NOISE_SCALE) +
                    noise2D(
                        x * SECONDARY_NOISE_SCALE,
                        z * SECONDARY_NOISE_SCALE
                    ) *
                        2) *
                HEIGHT_MULTIPLIER
            const height2 =
                (noise2D(hx * NOISE_SCALE, hz * NOISE_SCALE) +
                    noise2D(
                        hx * SECONDARY_NOISE_SCALE,
                        hz * SECONDARY_NOISE_SCALE
                    ) *
                        2) *
                HEIGHT_MULTIPLIER
            //console.log("H", hx, hz, height2)
            console.log("P", x, z, height)

            heightMap[i] = height2
            planePosition.setZ(i, height)
        }
        console.log(planePosition)
        geometry.computeVertexNormals()

        let rigidBody = world.createRigidBody(rapier.RigidBodyDesc.fixed())
        let colliderDesc = rapier.ColliderDesc.heightfield(
            TERRAIN_SIZE - 1,
            TERRAIN_SIZE - 1,
            heightMap,
            {
                x: TERRAIN_SIZE * WIDTH_MULTIPLIER,
                y: 1.0,
                z: TERRAIN_SIZE * WIDTH_MULTIPLIER,
            }
        )
        world.createCollider(colliderDesc, rigidBody)

        return geometry
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
