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
            Swal.fire("Datos erróneos, intente nuevamente");
            formulario.appendChild(notificacion)
        }
    });

}

login()