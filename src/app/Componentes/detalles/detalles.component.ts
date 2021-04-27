import { Component, OnInit } from '@angular/core';
import Ws from '@adonisjs/websocket-client'
import { AuthLoginService } from 'src/app/Servicios/AuthLogin/auth-login.service';
import { errorMessage, successDialog } from 'src/app/Functions/alerts';
import { NumberValueAccessor } from '@angular/forms';
import {NgModule} from '@angular/core'
import { environment } from 'src/environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';
import { PeticionService } from 'src/app/Servicios/Peticiones/peticion.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent implements OnInit {

  nivelSisterna = 55
  nivelPila = 10
  nivelHumedad = 5
  nivel = 0
  vr:number
  flagRegado = false
  flagLlenado = false

  //valorprueba:Number
  //valorprueba2: Number

  wantLogin:Boolean = true;
  isLlenando:Boolean = false;
  isRegando:Boolean = false;
  wantLlenar:Boolean = false;
  wantRegar:Boolean = false;

  ws:any
  valor:any
  valorS:any
  valorH:any
  NivelDeseado:Number = 0

  token:any = this.auth.getToken()

  //isOnline:Boolean = false

  user:any

  cadena:string
  
  constructor(private auth:AuthLoginService,private cookie:CookieService,
              private pet:PeticionService) { }
  
  ngOnInit(): void {

    this.checkRegado()
    this.checkLlenado()

    this.cadena = this.auth.getRoom(20)

    this.ws = Ws('ws://'+environment.apiWebSocket,{
      path:'adonis-ws'
    });

    this.ws.withJwtToken(this.token).connect()

    this.valor = this.ws.subscribe('NivelP')
    //--this.valorS = this.ws.subscribe('NivelS')
    //--this.valorH = this.ws.subscribe('Regado')

    // this.valor.on('open', () => {
    //   console.log('canal abierto')
    //   this.isOnline = true
    // })
    // this.valorS.on('open', () =>{
    //   console.log('canal 2 abierto')
    // })


    //--recepcion de los datos
    this.user = this.cookie.get('user')

    // this.valor.on('dato', (data:any) =>{
    //   this.nivelPila = data
    // })
    // this.valorS.on('dato', (data:any) =>{
    //   this.nivelSisterna = data
    // })
    // this.valorH.on('dato', (data:any) =>{
    //   this.nivelHumedad = data
    // })

    //prueba con un canal
    this.valor.on('dato', (data:any) =>{
      console.log(data)
      this.nivelPila = data.NivelP

      if(this.nivelPila >= this.NivelDeseado && this.wantLlenar == true){
        successDialog('La pila se a llenado')
        this.checkLlenado()
        this.wantLlenar = false
        this.cancelLlenadoP()
      }

      this.nivelSisterna = data.NivelS
      
      this.nivelHumedad = data.Humedad
      if(this.nivelHumedad > 60 && this.wantRegar == true){
        successDialog('las plantas se han regado')
        this.checkRegado()
        this.wantRegar = false
        this.cancelRegado()
      }
    })



  }

  /*enviardato(nivel){
    this.valor.emit('dato', nivel)
  }

  enviardato2(){
    this.valorS.emit('dato', this.valorprueba2)
  }*/

  //enviarPetHumedad(){
    //this.valor
  //}
  
  llenar(){
    try{
      const nivel = Number((<HTMLInputElement>document.getElementById('selectNivel')).value) - this.nivelPila;
      
      if(nivel < this.nivelSisterna){
        if(Number((<HTMLInputElement>document.getElementById('selectNivel')).value) > this.nivelPila){
          if(this.nivelPila <= 100){
            // this.nivelPila = Number(this.nivelPila) + nivel
            // this.nivelSisterna -= nivel
            this.NivelDeseado = Number((<HTMLInputElement>document.getElementById('selectNivel')).value)
            this.wantLlenar = true
            this.pet.sendPet(this.nivel).subscribe(data=>{
              successDialog('Llenando pila')
            })
          }else{
            errorMessage('La pila esta llena')
          }
        }else{
          errorMessage('No se puede seleccionar ese valor')
        }
    }else{
      errorMessage('No hay suficiente agua en la sisterna')
    }
    }catch(e){
      console.log(e)
    }
  }

  showQR(){
    this.wantLogin = true
  }

  hideQR(){
    this.wantLogin = false
  }

  regar(){
    try{
      if(this.nivelPila > 5 && this.nivelHumedad < 60){
        this.pet.sendFlag().subscribe(data => {
          this.checkRegado()
          this.wantRegar = true
        })
      }else{
        errorMessage('La pila esta vacia o el suelo esta muy humedo')
      }
    }catch(err){
      console.log(err)
    }
  }

  checkRegado(){
    this.pet.checkFlag().subscribe(data => {
      this.flagRegado = data.data})
  }

  cancelRegado(){
    this.pet.cancelFlag().subscribe(data => {
      this.checkRegado()
    })
  }

  cancelLlenadoP(){
    this.pet.cancelPet().subscribe(data=>{
      this.checkLlenado()
    })
  }

  checkLlenado(){
    this.pet.checkFlagLlenado().subscribe(data => {
      console.log(data.llenar)
      this.flagLlenado = data.llenar
    })
  }

}
