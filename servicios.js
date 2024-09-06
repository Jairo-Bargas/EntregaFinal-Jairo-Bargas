
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
        Swal.fire({
            icon: "error",
            title: "NO SE PUDO OBTENER LOS DATOS",
            text: "Disculpe las molestias ocasionadas, pronto se resolverá el problema",
          });
    }
}

let carrito = JSON.parse(localStorage.getItem("carrito")) || []
const seriesOfrecidas = JSON.parse(localStorage.getItem("seriesOfrecidas")) || []


/* FUNCIÓN PARA CREAR PRODUCTOS */ 
function renderizarProductos() {
    const productosDiv = document.getElementById('productos');
    productosDiv.style.display = 'flex';
    productosDiv.style.justifyContent = 'space-between'; 
    productosDiv.style.flexWrap = 'wrap';
    productosDiv.style.gap = '10px';
    productosDiv.style.height = '60vh';
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
            productoDiv.style.backgroundColor = 'lightblue';
            productoDiv.style.alignItems = 'end'; 
            productoDiv.style.justifyContent = 'center';
            productoDiv.style.width = '49%';
            productoDiv.style.height = 'auto';
            productoDiv.style.display = 'flex';


            productoDiv.innerHTML = `
                 <div style="display: flex; flex-direction: column; height: 100%; width: 100%; border: 1px solid black; position: relative;">
        <div style="margin-top: auto; display: flex; justify-content: flex-start; align-items: flex-end;">
            <span>${producto.servicio}: $${producto.price * maquina.unidadesCotizables}</span>
        </div>
        <div style="position: absolute; bottom: 0; right: 0;">
            <button onclick="agregarAlCarrito(${producto.id})">Añadir al Carrito</button>
        </div>
    </div>
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
        Swal.fire({
            icon: "error",
            title: "NO SE PUDO OBTENER LOS DATOS",
            text: "Disculpe las molestias ocasionadas, pronto se resolverá el problema",
          });
        
    }
}
obtenerServicios()


function agregarAlCarrito(id){
    const serviciosOfrecidos = JSON.parse(localStorage.getItem(`arrayDeServicios`))
    const encontrarProducto = serviciosOfrecidos.find(p => p.id === id)
    if(encontrarProducto){
        const servicioEnCarrito = carrito.find(p=>p.id === id);
        if(servicioEnCarrito){
            Swal.fire({
                icon: "error",
                title: "Acción inválida",
                text: "El producto seleccionado ya se encuentra en el carrito",
              });
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
        document.getElementById("finalizarCompra").addEventListener("click", ()=>{
            Swal.fire("Carrito vacío");
        })
       
        return;
    } 
    calcularTotalCarrito().then(total => {
        const datosUsuarioFinal = JSON.parse(localStorage.getItem(`usuario`))
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
          });
          swalWithBootstrapButtons.fire({
            title: "DESEA FINALIZAR LA COMPRA?",
            text: "Por favor controle correctamente su pedido",

            showCancelButton: true,
            confirmButtonText: "Si, finalizar",
            cancelButtonText: "No, cancelar",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              swalWithBootstrapButtons.fire({
                title: `COMPRA FINALIZADA`,
                text: `Nombre y Apellido: ${datosUsuarioFinal.nombre.toUpperCase()} ${datosUsuarioFinal.apellido.toUpperCase()} 
                
                
                Precio: $${total}\nMuchas gracias por su compra.`,
                icon: "success"
              });
            } else if (
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire({
                title: "CANCELADO",
              });
            }
          });
        carrito = []
        localStorage.setItem(`carrito`, JSON.stringify(carrito))
        renderizarCarrito()
    }).catch(error =>{
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Algo salió mal, vuelva a intentarlo",
          });
    })
}


document.addEventListener(`DOMContentLoaded`, function() {
    const botonFinalizar = document.getElementById("finalizarCompra");
    if (botonFinalizar){
        botonFinalizar.addEventListener(`click`, finalizarCompra)
    }
})
    

/* Se crea la función que determina que usuario ingresó */
function bienvenidaUsuario(){
    window.addEventListener(`DOMContentLoaded`, ()=>{
        const usuario = JSON.parse(localStorage.getItem(`usuario`));
        if(usuario){
            const bienvenida = document.getElementById("bienvenida")
            const tituloServicios = document.getElementById("tituloServicios")
            tituloServicios.style.cssText = "text-align: center;";
           

            bienvenida.textContent = `Bienvenido ${(usuario.nombre).toUpperCase()} ${(usuario.apellido).toUpperCase()}`
            bienvenida.style = "width: 100%, height: 20vh; text-align: center;"
            const parrafoEleccion = document.createElement("p")
            parrafoEleccion.innerHTML = "¿Qué servicio te gustaría elegir?"
            bienvenida.appendChild(parrafoEleccion)
            
        }
    })
}

const run=()=>{
    bienvenidaUsuario()
    renderizarCarrito()
    renderizarProductos()
}


run()
