import { Html, Sphere } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { RapierRigidBody, RigidBody } from "@react-three/rapier"
import { useEffect, useRef, useState } from "react"
import { Vector3 } from "three"

const SPAWN_POSITION: [number, number, number] = [0, 200, 0]
const FORCE = 80
const CAMERA_OFFSET = new Vector3(0, 8, 16)
const GOAL_POSITION = new Vector3(300, 2, 300)
const GOAL_RADIUS = 15

const Ball = () => {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const keys = useRef<Set<string>>(new Set())
    const { camera } = useThree()
    const [goalReached, setGoalReached] = useState(false)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code)
        const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code)
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    }, [])

    useFrame(() => {
        if (!rigidBodyRef.current) return
        const pos = rigidBodyRef.current.translation()

        // Reset on R key or if fallen off the world
        if (keys.current.has("KeyR") || pos.y < -200) {
            rigidBodyRef.current.setTranslation(
                { x: SPAWN_POSITION[0], y: SPAWN_POSITION[1], z: SPAWN_POSITION[2] },
                true
            )
            rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
            rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
            setGoalReached(false)
            return
        }

        // Apply directional impulses from held keys
        const force = { x: 0, y: 0, z: 0 }
        if (keys.current.has("KeyW") || keys.current.has("ArrowUp")) force.z -= FORCE
        if (keys.current.has("KeyS") || keys.current.has("ArrowDown")) force.z += FORCE
        if (keys.current.has("KeyA") || keys.current.has("ArrowLeft")) force.x -= FORCE
        if (keys.current.has("KeyD") || keys.current.has("ArrowRight")) force.x += FORCE
        if (force.x !== 0 || force.z !== 0) {
            rigidBodyRef.current.applyImpulse(force, true)
        }

        // Follow camera — smoothly lerp toward ball + offset
        const ballVec = new Vector3(pos.x, pos.y, pos.z)
        camera.position.lerp(ballVec.clone().add(CAMERA_OFFSET), 0.1)
        camera.lookAt(pos.x, pos.y, pos.z)

        // Goal detection
        if (!goalReached && ballVec.distanceTo(GOAL_POSITION) < GOAL_RADIUS) {
            setGoalReached(true)
        }
    })

    return (
        <>
            <RigidBody
                ref={rigidBodyRef}
                colliders='ball'
                position={SPAWN_POSITION}
                restitution={0.3}
                friction={1.5}
                linearDamping={0.5}
            >
                <Sphere args={[0.5, 32, 32]}>
                    <meshStandardMaterial color={goalReached ? "gold" : "blue"} />
                </Sphere>
            </RigidBody>

            {/* Goal zone */}
            <mesh position={[300, 2, 300]} rotation-x={-Math.PI / 2}>
                <torusGeometry args={[12, 1, 8, 32]} />
                <meshStandardMaterial
                    color='gold'
                    emissive='gold'
                    emissiveIntensity={goalReached ? 2 : 0.5}
                />
            </mesh>

            {goalReached && (
                <Html center position={[300, 30, 300]}>
                    <div
                        style={{
                            color: "gold",
                            fontSize: 32,
                            fontWeight: "bold",
                            textShadow: "0 0 10px gold",
                            whiteSpace: "nowrap",
                        }}
                    >
                        You Win!
                    </div>
                </Html>
            )}
        </>
    )
}

export default Ball
