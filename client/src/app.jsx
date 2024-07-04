import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Results from "./pages/Results";
import { BrowserRouter, Routes, Route } from "react-router-dom"
const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LandingPage />} />
                <Route path={"/music"} element={<Home />} />
                <Route path="/results" element={<Results />} />
            </Routes>
        </BrowserRouter>
    );

}

export default App