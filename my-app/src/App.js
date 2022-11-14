import { BrowserRouter, Routes, Route, Redirect } from "react-router-dom";
import Home from './Home'
import Editor from './Editor'
import Register from './Register'
import Login from './Login'

const App = () => {

    return (
        <BrowserRouter>
            <Routes>
            <Route path="/" element={<Login/>}/>
                <Route path="/home" element={<Home/>} />
                <Route path="/edit/:id" element={<Editor/>} />
                <Route path="/registerUser" element={<Register/>} />
                <Route path="/loginUser" element={<Login/>}/>
            </Routes>


        </BrowserRouter>
    );
}

export default App;