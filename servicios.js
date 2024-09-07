
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
    productosDiv.style.height = '65vh';
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
            const imagenFondo = `../imagenes/imagen${producto.id}.jpg`

            productoDiv.style.backgroundColor = 'lightblue';
            productoDiv.style.width = '40vh'; 
            productoDiv.style.height = 'auto'; 
            productoDiv.style.backgroundPosition = 'center';
            productoDiv.style.backgroundSize = 'contain';
            productoDiv.style.backgroundRepeat = 'no-repeat';
            productoDiv.style.display = 'flex';
            productoDiv.style.alignItems = 'center'; 
            productoDiv.style.justifyContent = 'center';
            productoDiv.style.border = '1px solid #ccc';
            productoDiv.style.backgroundImage = `url("${imagenFondo}")`


            productoDiv.innerHTML = `
                 <div style="display: flex; flex-direction: column; height: 100%; width: 100%; border: 1px solid black; position: relative;">
        <div style="margin-top: auto; display: flex; justify-content: flex-start; align-items: flex-end;">
            <span>${producto.servicio}: $${producto.price * maquina.unidadesCotizables}</span>
        </div>
        <div style=" bottom: 0; right: 0;">
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
    const tituloCarrito = document.getElementById("tituloCarrito")
        tituloCarrito.style.cssText = "text-align: center; ";
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

    document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("finalizarCompra").addEventListener("click", finalizarCompra);
});

function finalizarCompra() {
    
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        Swal.fire("Carrito vacío");
        return;
    }

    // Verificar si hay fechas reservadas
    let occupiedDates = JSON.parse(localStorage.getItem('occupiedDates')) || [];
    if (occupiedDates.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "No hay fechas reservadas",
            text: "Por favor seleccione una fecha antes de finalizar la compra.",
        });
        return;
    }

    calcularTotalCarrito().then(total => {
        const datosUsuarioFinal = JSON.parse(localStorage.getItem('usuario'));
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
                    html: `Nombre y Apellido: ${datosUsuarioFinal.nombre.toUpperCase()} ${datosUsuarioFinal.apellido.toUpperCase()}<br> Precio: $${total}<br>Fecha: ${occupiedDates}<br>Muchas gracias por su compra.`,
                    icon: "success"
                });

                // Limpiar el carrito y actualizar el localStorage
                carrito = [];
                localStorage.setItem('carrito', JSON.stringify(carrito));
                occupiedDates = [];
                localStorage.setItem(`occupiedDates`, JSON.stringify(occupiedDates))
                renderizarCarrito();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                    title: "CANCELADO",
                });
            }
        });
    }).catch(error => {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Algo salió mal, vuelva a intentarlo",
        });
    });
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

/* Se agrega la función de un calendario mediante librerías */
// Inicializa flatpickr con la configuración deseada
const calendar = flatpickr("#calendar", {
    onChange: function(selectedDates, dateStr, instance) {
        handleDateSelection(dateStr);
    },
    disable: getOccupiedDates(),
    onReady: function(selectedDates, dateStr, instance) {
        applyStyles();
    }
});

// Función para aplicar estilos CSS directamente en JavaScript
function applyStyles() {
    const inputField = document.querySelector(".flatpickr-input");
    const calendarContainer = document.querySelector(".flatpickr-calendar");
    
    if (inputField) {
        inputField.style.padding = "5px 10px";
        inputField.style.margin = "20px 10px 10px 20px";
        inputField.style.fontSize = "15px"; 
        inputField.style.width = "15%"; 
        inputField.style.maxWidth = "400px"; 
    }

    if (calendarContainer) {
        calendarContainer.style.fontSize = "14px"; 
    }
}

// Llama a applyStyles después de que Flatpickr haya inicializado el campo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(applyStyles, 0);
});

function handleDateSelection(date) {
    let occupiedDates = JSON.parse(localStorage.getItem('occupiedDates')) || [];

    if (occupiedDates.includes(date)) {
        // Si la fecha ya está ocupada, eliminarla de la lista
        occupiedDates = occupiedDates.filter(d => d !== date);
        localStorage.setItem('occupiedDates', JSON.stringify(occupiedDates));
        Swal.fire({
            icon: "info",
            title: "Fecha desmarcada",
            text: `La fecha ${date} ha sido desmarcada.`,
        });
    } else {
        // Agregar la nueva fecha seleccionada
        if (occupiedDates.length >= 1) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Solo puede reservar una fecha.`,
            });
            return; // No agregar más fechas si ya hay una reservada
        }
        occupiedDates.push(date);
        localStorage.setItem('occupiedDates', JSON.stringify(occupiedDates));
        Swal.fire({
            icon: "success",
            title: "Fecha reservada",
            text: `La fecha seleccionada es ${date}`,
        });
    }

    // Actualiza la lista de fechas deshabilitadas en el calendario
    calendar.set("disable", getOccupiedDates());
}

function getOccupiedDates() {
    let occupiedDates = JSON.parse(localStorage.getItem('occupiedDates')) || [];
    return occupiedDates.map(date => new Date(date));
}

/* FUNCIONES QUE VERIFICAN SI OTRO USUARIO ESTÁ INGRESANDO PARA REINICIAR DATOS */


const run=()=>{
    bienvenidaUsuario()
    renderizarCarrito()
    renderizarProductos()
}


run()
