import { Environment, OrbitControls, Plane, Sphere } from "@react-three/drei"
import "./Game.css"
import EnvMap from "./EnvMap"

function Game() {
    return (
        <>
            <OrbitControls />

            {/* Lighting */}
            <Environment
                background
                files='./static/kloofendal_48d_partly_cloudy_puresky_1k.hdr'
            />

            {/* Plane */}
            <Plane
                args={[10, 10]} // Width and height of the plane
                rotation={[-Math.PI / 2, 0, 0]} // Rotate the plane to be horizontal
                position={[0, -0.5, 0]} // Position it slightly below the sphere
            >
                <meshStandardMaterial color='lightgrey' />
            </Plane>

            {/* Sphere (Ball) */}
            <Sphere args={[0.5, 32, 32]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color='blue' />
            </Sphere>
        </>
    )
}

export default Game
