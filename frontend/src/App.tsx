
import { Routes, Route } from 'react-router-dom';


import VerifyDocument from './VerifyDoc';
import Home from './Home';

const App = () => {
  return (
    <Routes>
  
      <Route path="/verify/:publicId" element={<VerifyDocument />} /> 
      <Route path="/" element={<Home/>}/>
    </Routes>
  );
}

export default App;
