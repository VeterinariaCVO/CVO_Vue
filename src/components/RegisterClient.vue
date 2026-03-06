<template>
<div class="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">

<h2 class="text-2xl font-bold mb-4">Registrar Cliente</h2>

<form @submit.prevent="registerUser">

<input v-model="user.name" type="text" placeholder="Nombre"
class="w-full border p-2 mb-3 rounded"/>

<input v-model="user.email" type="email" placeholder="Email"
class="w-full border p-2 mb-3 rounded"/>

<input v-model="user.phone" type="text" placeholder="Teléfono"
class="w-full border p-2 mb-3 rounded"/>

<input v-model="user.address" type="text" placeholder="Domicilio"
class="w-full border p-2 mb-3 rounded"/>

<input v-model="user.password" type="password" placeholder="Password"
class="w-full border p-2 mb-3 rounded"/>

<button
class="bg-blue-500 text-white px-4 py-2 rounded w-full">
Registrar
</button>