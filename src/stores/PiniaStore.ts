import {defineStore} from 'pinia'
import { ref } from 'vue'

export const usePiniaStore = defineStore('pinia',()=>{
 //aqui van las varables de estado globales
  const nombre=ref<string>("pedro")
 //aqui van las funciones que modifican el estado global
  function setNombre(nuevoNombre:string){
    nombre.value=nuevoNombre
  }
  function getNombre(){
    return nombre.value
  }

  return {setNombre, getNombre}
})


