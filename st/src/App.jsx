import { BrowserRouter, Routes, Route } from "react-router-dom";
import "src/App.css";
import { MainPage } from "./components/MainPage";
import { LoginForm } from "./components/LoginForm";
import { UserPage } from "./components/UserPage";
import ProtectedRoute from "src/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />

        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
