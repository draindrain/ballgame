import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Game from "./Game.tsx"
import { Canvas } from "@react-three/fiber"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Canvas
            camera={{
                position: [0, 5, 10], // Camera starting position
                near: 0.1, // Adjust near clipping plane (default is 0.1)
                far: 10000, // Increase far clipping plane to extend draw distance
            }}
        >
            <Game />
        </Canvas>
    </StrictMode>
)
