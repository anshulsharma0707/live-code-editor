import { useState } from "react"

const AuthModal = ({ closeModal, setUser }) => {

const [name,setName] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [mode,setMode] = useState("login")

const submit = () => {

const userData = {name,email}

localStorage.setItem("user",JSON.stringify(userData))

setUser(userData)

closeModal()

}

return (

<div style={{
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.7)",
display:"flex",
justifyContent:"center",
alignItems:"center"
}}>

<div style={{
background:"#161b22",
padding:"30px",
width:"320px",
borderRadius:"8px"
}}>

<h2 style={{marginBottom:"20px"}}>

{mode === "login" ? "Login" : "Register"}

</h2>

{mode==="register" && (

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
style={{width:"100%",marginBottom:"10px"}}
/>

)}

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%",marginBottom:"10px"}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{width:"100%",marginBottom:"20px"}}
/>

<button
onClick={submit}
style={{
width:"100%",
background:"#22c55e",
padding:"8px",
borderRadius:"4px"
}}
>

{mode==="login" ? "Login" : "Register"}

</button>

<p style={{marginTop:"10px",cursor:"pointer"}}

onClick={()=>setMode(mode==="login"?"register":"login")}

>

{mode==="login" ? "Create account" : "Already have account"}

</p>

</div>

</div>

)

}

export default AuthModal