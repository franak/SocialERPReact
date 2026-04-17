// https://comunidad.socialerp.net/commons/httpBasic.js
var DAT = {}
const cargando = $('.loader')
cargando.show()
const inputCodigo = $('#personalid')
let token
token = 'C61027CD86CC460DA6BB5DA248FFEA94'

const datosConexion = async () => {
    // '<!--#4DSCRIPT/MethodName/MyParam-->'

    const url = `/apirest/admrest/?proceso=WEB_DatosConexion`
    //const url = '/apirest/admrest/?proceso=WEB_DatosConexion'
    // const resultado = await postData(url)
    var resultado = await getSIT(url, 'GET')
    debugger
    if (resultado.status == "KO") {
        $('#logoEmp').hide()
        cargando.hide()
        $('#personalid').attr('disabled', 'disabled')
        $('#personalid').attr('placeholder', resultado.message)
        alert(resultado.message)
        return false
    }
    cargando.hide()

    $('#nombreEmpresa').text(resultado.result.nombreEmpresa)
    DAT = resultado.result;

    $('#logoEmp').attr('src', '/apirest/crmsit/?proceso=getfoto&mss=' + DAT.UUIDEmpresa)
    $('#logoEmp').fadeIn()
    getLocation().then(async result => {
        if (!result) {
            DAT.coords = 'n/d';
        } else {
            DAT.coords = result
        }
    }).catch(error => { console.log(error) });
    $('#personalid').focus()
}
// No me complico la vida de momento sin implementar el control de sesiones
// inputCodigo.on('keyup', async (event) => {
//     console.log(event)
//     if (event.target.value.length == 4) {
//         const url = `/apirest/crmsit/?proceso=getDataClass&$dct=Cuentas&$filter=${event.target.value}&$buscar=Perceptor`
//   
//         var resultado = await getSIT(url, 'GET')
//         console.log(resultado)
//     }
// })


const getSIT = async (url, tipo, data = {}) => {

    var myHeaders = new Headers();

    var getOptions = {
        method: tipo,
        headers: myHeaders,
        redirect: 'follow'
    };
    var postOptions = {
        method: tipo,
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify(data)
    };

    requestOptions = getOptions

    if (tipo == 'POST') {
        requestOptions = postOptions
    }

    const response = await fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => result)
        .catch(error => console.log('error', error));
    return JSON.parse(response)
}

datosConexion()
$('#personalid').change(function () {
    $('.btn').removeAttr('disabled')
})
var $scope = {}
var enctrl = {}
enctrl = this;
$scope.project = {};
$scope.project.tos = false;
$scope.project.isAuth = true;
$scope.project.isGeo = true;
$scope.project.errorInfo = '';
$scope.homePage = '/Reloj'
enctrl.clienteHost = 'https://127.0.0.1:8050';
enctrl.CPR_Url = '/apirest/controlpresencia'

const enviarDatos = async evento => {
    $(evento).attr("disabled", "disabled")
    cargando.show()
    if (!$('#personalid').val()) {
        alert("Debe introducir su código de empleado");
        $scope.cargando = false;
        $('#personalid').focus()
        cargando.hide()
        $(evento).removeAttr("disabled")
        return;
    }

    let jsonMovimiento = {};
    jsonMovimiento.Funcion = 'CrearParte';
    jsonMovimiento.Tipo = evento.id;
    jsonMovimiento.UUIDCentral = DAT.UUIDEmpresa;
    jsonMovimiento.IP = '';
    jsonMovimiento.ClaveEmpleado = $('#personalid').val();
    jsonMovimiento.userAgent = navigator.userAgent;
    jsonMovimiento.Hora = new Date().toISOString();
    jsonMovimiento.GPS = DAT.coords || 'n/d';
    resultado = await getSIT(enctrl.CPR_Url, "POST", jsonMovimiento)

    if (resultado && resultado.status == 'ok') {
        // alert('Parte creado')
        alert(resultado.message)
    } else {
        alert(resultado.message)
    }
    $(evento).removeAttr("disabled")
    $('#personalid').focus()
    $('#personalid').val('')
    cargando.hide()

}
// {"Funcion":"CompobarReloj","UUIDCentral":"3-DFECFF7FCE50474EB27D0A2003AD58A9","IP":"","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36","Fecha":"2022-11-15T18:11:22.431Z","HoraISO":"2022-11-15T18:11:22.431Z","GPS":"n/d"}: 

const ComprobarRelog = evento => {
    let textoRespuesta = '';
    let cargando = true;
    cargando.show()
    let datos = {};
    datos.Funcion = 'CompobarReloj';
    // datos.UUIDCentral = enctrl.datosCliente.UUID;
    datos.IP = '';
    datos.userAgent = navigator.userAgent;
    datos.Fecha = new Date().toISOString();
    datos.HoraISO = new Date().toISOString();

    // $Funcion:=OB Get($ObjetoPeticion;"Funcion”)
    // Funcion=“CompobarReloj”

    // $IP:=OB Get($ObjetoPeticion;"IP")
    // $Empresa:=OB Get($ObjetoPeticion;"UUIDCentral")
    // $HoraISO:=OB Get($ObjetoPeticion;"Hora")
    // $Fecha:=Date($HoraISO)
    // $GPS:= OB Get($ObjetoPeticion; "GPS")

    getLocation().then(async result => {
        if (!result.coords) {
            datos.GPS = 'n/d';
        } else {
            datos.GPS = $scope.position;
        }
        resultado = await postData(enctrl.CPR_Url, datos)

        // https://fc.socialerp.net:8443/static/ControlPresencia/Procesos/EnviarParte/?e=3-1C147EFB6E2F4808A3D52DDE2340D89A
        // ahahPost(enctrl.CPR_Url, datos).then(resultado => {

        if (resultado.message == '' && evento) {
            $scope.textoRespuesta = 'Enlace correcto';
        } else if (resultado.message != '') {
            $scope.textoRespuesta = `${resultado.message} <hr> Hay un problema de conexión, por favor, recarga la página para continuar.`;
        }
        // enctrl.datosCuenta = xhr.data;
        // enctrl.datosCuenta.UUID = xhr.data.Empresa;
        if (!enctrl.datosCuenta) {
            enctrl.datosCuenta = {};
        }
        if (resultado.data.LogoEmpresa != '') {
            let logoEmpresa = { BASE64: resultado.data.LogoEmpresa };
            enctrl.datosCuenta.Logo = AUX.linkFoto(logoEmpresa);
        } else {
            enctrl.datosCuenta.Logo = false;
        }

        if (!enctrl.datosCuenta.Logo) {
            $scope.textoRespuesta = 'No hay logo';
            // enctrl.toastMen = 'No hay logo';
            // enctrl.showCustomToast();
            // enctrl.showActionToast(enctrl.toastMen);
        }
        if ($scope.textoRespuesta != '') {
            $scope.showAdvanced();
            setTimeout(() => {
                $scope.closeDialog();
            }, 4000)
        }



        cargando.hide()
    }).catch(err => {
        debugger;
    });
}

function showError(error) {
    return 'error'
}
const getLocation = () => {
    return new Promise((resolve, reject) => {
        if (!"geolocation" in navigator) {
            console.log("Datos de localización no disponibles");
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                var positionx = `${position.coords.latitude}, ${position.coords.longitude}`;
                var positionTimex = new Date(position.timestamp).toISOString();
                resolve(positionx);
            }, showError);
        } else {
            position = {};
            position.coords = {};
            position.coords.latitude = '40.41719593996903';
            position.coords.longitude = '-3.703579961088483';
            position.timestamp = new Date().toISOString();
            var positionx = `${position.coords.latitude}, ${position.coords.longitude}`;
            var positionTime = new Date(position.timestamp).toISOString();
            resolve(position);
            return position;

            // reject('Geolocation is not supported by this browser.');
            // resolve('Geolocation is not supported by this browser.');
        }
    })
}