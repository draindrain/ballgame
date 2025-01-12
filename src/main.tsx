import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Game from "./Game.tsx"
import { Canvas } from "@react-three/fiber"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Canvas>
            <Game />
        </Canvas>
    </StrictMode>
)
