import { Environment } from "@react-three/drei"
import "./Game.css"
import Terrain from "./Terrain"
import Ball from "./Ball"
import { Physics } from "@react-three/rapier"

function Game() {
    return (
        <>
            <Environment
                environmentIntensity={1.0}
                background
                files='/kloofendal_48d_partly_cloudy_puresky_1k.hdr'
            />

            <Physics>
                <Terrain />
                <Ball />
            </Physics>
        </>
    )
}

export default Game
