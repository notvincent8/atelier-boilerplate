import FollowCursor from "@/components/common/FollowCursor.tsx"
import { Scene } from "./components/common/Scene.tsx"

const App = () => {
  return (
    <Scene className="relative ">
      <FollowCursor />
      <h1 className="text-4xl font-bold">Atelier</h1>
    </Scene>
  )
}

export default App
