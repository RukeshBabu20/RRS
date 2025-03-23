// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import "react-toastify/dist/ReactToastify.css";
// import Main from "./components/main";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import { AuthProtect } from "./AuthProtect";
// import Admin from "./components/Admin";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* auth routes */}
//         <Route path="/login" element={<AuthProtect element={<Login />} />} />
//         <Route path="/signup" element={<AuthProtect element={<Signup />} />} />

//         {/* Regular Routes */}
//         <Route path="/" element={<Main />} />
//         <Route path="/admin" element={<Admin />} />

//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Main from "./components/main";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProtect } from "./AuthProtect";
import Admin from "./components/Admin";
import Unauthorized from "./components/Unauthorized";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const userRole = localStorage.getItem("role");

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Unauthorized />;
  }

  return element;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthProtect element={<Login />} />} />
        <Route path="/signup" element={<AuthProtect element={<Signup />} />} />

        {/* Role-based routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute element={<Main />} allowedRoles={["user"]} />
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute element={<Admin />} allowedRoles={["admin"]} />
          }
        />

        {/* Unauthorized route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
