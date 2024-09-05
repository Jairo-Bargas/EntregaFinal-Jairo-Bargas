
/* FUNCION PARA OBTENER DATOS DE BASE DE DATOS */
const urlUsuarios = "/baseDatosUsuarios.json"
const urlProductos = "/baseDatosProductos.json"
const urlServicios = "/baseDatosServicios.json"

async function conseguirDatos(url){
    try {
        const datosJSON = await fetch(url)
        const datosJS = await datosJSON.json()
        return datosJS
    } catch (error) {
        console.error("error", error)
    }
}

let carrito = JSON.parse(localStorage.getItem("carrito")) || []
const seriesOfrecidas = JSON.parse(localStorage.getItem("seriesOfrecidas")) || []


/* FUNCIÓN PARA CREAR PRODUCTOS */ 
function renderizarProductos() {
    const productosDiv = document.getElementById('productos');
    productosDiv.innerHTML = ''; 
    const usuario = JSON.parse(localStorage.getItem(`usuario`));
    if (!usuario) return;
    conseguirDatos(urlProductos).then(datos => {
        const productos1 = datos;
        const maquina = productos1.find(maq => maq.nombreProducto === usuario.duenioDe)
    conseguirDatos(urlServicios).then(datos=>{
        const servicios = datos;
        servicios.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.innerHTML = `
                <span>${producto.servicio} - $${producto.price * maquina.unidadesCotizables}</span>
                <button onclick="agregarAlCarrito(${producto.id})">Añadir al Carrito</button>
            `;
            productosDiv.appendChild(productoDiv);
        });
    })
    
})
}

/* FUNCIÓN PARA AGREGAR AL CARRITO LOS SERVICIOS */
async function obtenerServicios (){
    try {
        await conseguirDatos(urlServicios).then(datos=>{
            const arrayDeServicios = datos;
            localStorage.setItem(`arrayDeServicios`, JSON.stringify(arrayDeServicios))
        })
    } catch (error) {
        console.error("error", error)
        
    }
}
obtenerServicios()


function agregarAlCarrito(id){
    const serviciosOfrecidos = JSON.parse(localStorage.getItem(`arrayDeServicios`))
    const encontrarProducto = serviciosOfrecidos.find(p => p.id === id)
    if(encontrarProducto){
        const servicioEnCarrito = carrito.find(p=>p.id === id);
        if(servicioEnCarrito){
            alert("Este servicio ya está en el carrito")
        } else {
            carrito.push({...encontrarProducto, quantity: 1});
        }
        localStorage.setItem(`carrito`, JSON.stringify(carrito));
        renderizarCarrito()
    }
}

/* FUNCIÓN PARA CALCULAR EL TOTAL DEL CARRITO */
async function calcularTotalCarrito() {
    const usuario = JSON.parse(localStorage.getItem(`usuario`));
    const datos = await conseguirDatos(urlProductos);
    const productos2 = datos;
    const maquina2 = productos2.find(maq => maq.nombreProducto === usuario.duenioDe)

    const sumaTotal = carrito.reduce((total, item)=>{
        return total + ((item.price * maquina2.unidadesCotizables)*item.quantity);
    }, 0)

    localStorage.setItem(`sumaTotal`, JSON.stringify(sumaTotal))
        return sumaTotal;
}
    

/* FUNCIÓN PARA RENDERIZAR EL CARRITO */

const renderizarCarrito = async()=> {
    const itemscarrito = document.getElementById('itemscarrito');
    itemscarrito.innerHTML = '';

    carrito.forEach(({servicio, id}) => {
        let itemUl = document.createElement('li');
        itemUl.innerHTML = `Servicio: ${servicio} \n <button onclick="eliminarCarrito(${id})">Borrar elección</button>`;
        itemscarrito.appendChild(itemUl);
    })          
    const total = await calcularTotalCarrito();
    const totalDiv = document.getElementById('totalCarrito');
    totalDiv.innerHTML = `Total: $${total}`;
} 

function eliminarCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
}

/* FUNCIÓN DE FINALIZAR LA COMPRA */
function finalizarCompra(){
    if(carrito.length === 0){
        alert("Carrito vacío")
        return;
    }
    calcularTotalCarrito().then(total => {
        const datosUsuarioFinal = JSON.parse(localStorage.getItem(`usuario`))
        alert(`Compra finalizada.\nLos datos de su compra son:\nNombre: ${datosUsuarioFinal.nombre.toUpperCase()} ${datosUsuarioFinal.apellido.toUpperCase()}\nPrecio: ${total}`)
        carrito = []
        localStorage.setItem(`carrito`, JSON.stringify(carrito))
        renderizarCarrito()
    }).catch(error =>{
        alert("Error al finalizar compra", error)
    })
}

document.addEventListener(`DOMContentLoaded`, function() {
    const botonFinalizar = document.getElementById("finalizarCompra");
    if (botonFinalizar){
        botonFinalizar.addEventListener(`click`, finalizarCompra)
    }
})
    



/* FUNCIÓN DE INGRESO */

async function login(){
    const datosUsuario = await conseguirDatos(urlUsuarios);
    const datosUsuarioTraidos = datosUsuario;
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (event) => {
       
        event.preventDefault();
    
     
        const userIDIngresando = document.getElementById('username').value;
        const passwordIngresando = document.getElementById('password').value;
        
   
        const usuarioEncontrado = datosUsuario.find(usuario => 
            usuario.id === userIDIngresando && usuario.contrasenia === passwordIngresando
        );
      
        if (usuarioEncontrado) {
            localStorage.setItem(`usuario`, JSON.stringify(usuarioEncontrado))
            window.location.href = `pages/servicios.html`;
            
        } else {
            formulario = document.getElementById("loginForm")
            let notificacion = document.createElement(`p`)
            notificacion.textContent = `Los datos ingresados son incorrectos`
            formulario.appendChild(notificacion)
        }
    });

}

/* Se crea la función que determina que usuario ingresó */
function bienvenidaUsuario(){
    window.addEventListener(`DOMContentLoaded`, ()=>{
        const usuario = JSON.parse(localStorage.getItem(`usuario`));
        if(usuario){
            const bienvenida = document.getElementById("bienvenida")

            bienvenida.textContent = `Bienvenido ${(usuario.nombre).toUpperCase()} ${(usuario.apellido).toUpperCase()}` 
        }
    })
}

const run=()=>{
    login()
    bienvenidaUsuario()
    renderizarCarrito()
    renderizarProductos()
}


run()


