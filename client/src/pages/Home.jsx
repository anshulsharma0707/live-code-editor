import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";

const Home = () => {

const navigate = useNavigate()

const [showAuth, setShowAuth] = useState(false)
const [user, setUser] = useState(null)

useEffect(()=>{

const stored = localStorage.getItem("user")

if(stored){
setUser(JSON.parse(stored))
}

},[])

const getInitials = (name) => {

return name
.split(" ")
.map(n => n[0])
.join("")
.toUpperCase()

}

return (

<div className="bg-[#0d1117] text-white min-h-screen">

{/* NAVBAR */}

<nav className="flex justify-between items-center px-10 py-5 border-b border-[#30363d]">

<h1 className="text-xl font-bold text-green-400">
LiveCode
</h1>

<div className="hidden md:flex gap-8 text-gray-300">

<a href="#features">Features</a>
<a href="#how">How It Works</a>
<a href="#about">About</a>

</div>

<div className="flex gap-3">

{user ? (

<div
className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center cursor-pointer text-black font-bold"
onClick={()=>{
localStorage.removeItem("user")
setUser(null)
}}
>

{getInitials(user.name)}

</div>

) : (

<button
onClick={()=>setShowAuth(true)}
className="px-4 py-1 bg-green-500 rounded text-black"
>

Login / Register

</button>

)}

</div>

</nav>


{/* HERO SECTION */}

<section className="text-center py-28 px-6">

<h1 className="text-5xl font-bold mb-6">
Code Together. <span className="text-green-400">Build Faster.</span>
</h1>

<p className="text-gray-400 max-w-2xl mx-auto mb-10">
Collaborate with developers in real time. Write, edit, and run code together in a shared environment.
</p>

<div className="flex justify-center gap-6">

<button
onClick={()=>navigate("/create")}
className="bg-green-600 px-6 py-3 rounded font-semibold"
>
Create Room
</button>

<button
onClick={()=>navigate("/join")}
className="bg-[#21262d] px-6 py-3 rounded"
>
Join Room
</button>

</div>

<p className="text-gray-500 text-sm mt-6">
No installation required • Works directly in your browser
</p>

</section>


{/* FEATURES */}

<section id="features" className="py-20 px-10">

<h2 className="text-3xl font-bold text-center mb-16">
Powerful Features for Collaborative Coding
</h2>

<div className="grid md:grid-cols-3 gap-10">

<div className="bg-[#161b22] p-6 rounded">
<h3 className="text-lg font-semibold mb-3">Real-Time Code Collaboration</h3>
<p className="text-gray-400">
Write code together with multiple developers simultaneously.
</p>
</div>

<div className="bg-[#161b22] p-6 rounded">
<h3 className="text-lg font-semibold mb-3">Live Cursor Tracking</h3>
<p className="text-gray-400">
See where your teammates are typing in real time.
</p>
</div>

<div className="bg-[#161b22] p-6 rounded">
<h3 className="text-lg font-semibold mb-3">Multi-Language Support</h3>
<p className="text-gray-400">
Run and write code in multiple languages.
</p>
</div>

</div>

</section>


{/* FOOTER */}

<footer id="about" className="bg-[#161b22] py-10 px-10">

<div className="grid md:grid-cols-2 gap-10">

<div>

<h3 className="text-lg font-semibold mb-3">
About
</h3>

<p className="text-gray-400">
LiveCode is a real-time collaborative coding platform for developers.
</p>

</div>

</div>

</footer>


{/* AUTH MODAL */}

{showAuth && (

<AuthModal
closeModal={()=>setShowAuth(false)}
setUser={setUser}
/>

)}

</div>

)

}

export default Home