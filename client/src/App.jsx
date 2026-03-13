import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Protected — must be logged in */}
        <Route
          path="/create"
          element={
            <AuthGuard actionLabel="create a room">
              <CreateRoom />
            </AuthGuard>
          }
        />
        <Route
          path="/join"
          element={
            <AuthGuard actionLabel="join a room">
              <JoinRoom />
            </AuthGuard>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <AuthGuard actionLabel="enter the room">
              <Room />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;