import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupsPage from './pages/GroupsPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetails from './pages/GroupDetails';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <>

    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

      // groups routes
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />

        <Route path="/groups/:id" element={<GroupDetails />} />
        

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
