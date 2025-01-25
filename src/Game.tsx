import { Environment, OrbitControls } from "@react-three/drei"
import "./Game.css"
import Terrain from "./Terrain"
import { Physics } from "@react-three/rapier"

function Game() {
    return (
        <>
            <OrbitControls maxDistance={10000} />

            <Environment
                environmentIntensity={1.0}
                background
                files='./static/kloofendal_48d_partly_cloudy_puresky_1k.hdr'
            />
            <axesHelper args={[100]} />

            {/* Grid Helper */}
            <Physics>
                <Terrain />

                {/*<Sphere args={[0.5, 32, 32]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color='blue' />
                </Sphere>*/}
            </Physics>
        </>
    )
}

export default Game
