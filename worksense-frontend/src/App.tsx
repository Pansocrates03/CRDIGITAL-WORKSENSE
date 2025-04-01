import { Routes, Route } from "react-router-dom";
import CreateProject from "./pages/CreateProject/CreateProject";

function App() {
  return (
    <Routes>
      <Route path="/create" element={<CreateProject />} />
    </Routes>
  );
}

export default App;
