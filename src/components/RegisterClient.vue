<template>
<div class="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">

<h2 class="text-xl font-bold mb-4">Registrar Cliente</h2>

<form @submit.prevent="registerUser">

<input v-model="user.name" placeholder="Nombre"
class="border p-2 w-full mb-3"/>

<input v-model="user.email" placeholder="Email"
class="border p-2 w-full mb-3"/>

<input v-model="user.phone" placeholder="Teléfono"
class="border p-2 w-full mb-3"/>

<input v-model="user.address" placeholder="Domicilio"
class="border p-2 w-full mb-3"/>

<input v-model="user.password" type="password" placeholder="Password"
class="border p-2 w-full mb-3"/>

<button class="bg-blue-500 text-white p-2 w-full">
Registrar
</button>

</form>

</div>
</template>

<script>
   export default {

    data(){
    return{
        user:{
        name:"",
        email:"",
        phone:"",
        address:"",
        password:"",
        role_id:1,
        active:true
        }
    }
},

methods:{

async registerUser(){

try{

const response = await fetch("http://127.0.0.1:8000/api/users",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify(this.user)

})

const data = await response.json()

alert("Cliente registrado correctamente")

console.log(data)

}catch(error){

console.error(error)

alert("Error al registrar")

}

}

}

}
</script>