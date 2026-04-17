function ahahGet(url) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();

        req.open('GET', url);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            }
            else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }

        };

        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));

        };

        // Make the request
        req.send();
    });
}

function getWebInfo() {

    url = "/apirest/admrest/serverinfo";
    var settings = {
        "url": url,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "X-API-KEY": "aaabbbccc"
        },
    };

    $.ajax(settings).done(function (data) {
        iniDate = new Date(Date.now() - (1000 * data.uptime));
        // $("#http-ini-date").html(iniDate.toString().substr(0, 31));
        $("#http-ini-date").html(iniDate.toLocaleDateString() + " " + iniDate.toLocaleTimeString());
        $("#http-status").html(data.started ? "Iniciado" : "Detenido");
        $("#http-uptime").html(Math.round(data.uptime / 3600));
        $("#http-rqt").html(data.httpRequestCount);
        $("#otroshttp").html(`<p>IP: ${data.options.webIPAddressToListen[0]}</p>`);
        $("#otroshttp").append(`<p>Puerto https: ${data.options.webHTTPSPortID}</p>`);
        $("#otroshttp").append(`<p>Puerto http: ${data.options.webPortID}</p>`);

        // $("#soap-on").html(data.SOAPServerStarted ? "Accepted" : "Rejected");
        // $("#auto-launch").html(data.startMode);
        // $("#ip-info").html(data.options.webIPAddressToListen.join());
        // $("#http-port").html(data.options.webPortID);
        // $("#tls-on").html(data.security.HTTPSEnabled ? "yes" : "no");
        // $("#https-port").html(data.options.webHTTPSPortID);
        // tiempoFuncionamiento(data.uptime)
        $('.panel').css('display', 'block')
        const timetotime = setInterval(() => {
            tiempoFuncionamiento(data.uptime + 1000)
            tick()
        }, 1000)
    });

    // $.getJSON(url, function (data) {
    //     console.log(data)
    //     iniDate = new Date(Date.now() - (1000 * data.uptime));
    //     // $("#http-ini-date").html(iniDate.toString().substr(0, 31));
    //     $("#http-ini-date").html(iniDate.toLocaleDateString() + " " + iniDate.toLocaleTimeString());
    //     $("#http-status").html(data.started ? "Iniciado" : "Detenido");
    //     $("#http-uptime").html(Math.round(data.uptime / 3600));
    //     $("#http-rqt").html(data.httpRequestCount);
    //     $("#otroshttp").html(`<p>IP: ${data.options.webIPAddressToListen[0]}</p>`);
    //     $("#otroshttp").append(`<p>Puerto https: ${data.options.webHTTPSPortID}</p>`);
    //     $("#otroshttp").append(`<p>Puerto http: ${data.options.webPortID}</p>`);

    //     // $("#soap-on").html(data.SOAPServerStarted ? "Accepted" : "Rejected");
    //     // $("#auto-launch").html(data.startMode);
    //     // $("#ip-info").html(data.options.webIPAddressToListen.join());
    //     // $("#http-port").html(data.options.webPortID);
    //     // $("#tls-on").html(data.security.HTTPSEnabled ? "yes" : "no");
    //     // $("#https-port").html(data.options.webHTTPSPortID);
    //     // tiempoFuncionamiento(data.uptime)
    //     $('.panel').css('display', 'block')
    //     const timetotime = setInterval(() => {
    //         tiempoFuncionamiento(data.uptime + 1000)
    //         tick()
    //     }, 1000)
    // });
}
var q = getUrlVars()['q'];
if (q) {
    ahahGet(`/apirest/?$proceso=getdataclass&$filter={q}`).then(result => {

        console.log("mm")
    })
}

const obtenerJson = (data) => {
    for (x in data) {

        x = data[x]
        console.log(x)
    }
}
function msToTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

const tiempoFuncionamiento = (initDate) => {

    d = Number(initDate);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : h + " h";
    var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : m + " m";
    var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : s + " s";


    // let func = new Date(1000 * initDate)
    // let elDate = func
    // var clockFormat = elDate.toLocaleTimeString();
    // var cdateFormat = elDate.toLocaleDateString();
    // let cMes = dateLocalizacion.monthNames[elDate.getMonth()]
    // let dSemana = dateLocalizacion.dayNames[elDate.getDay()]
    // let dMes = elDate.getDate();
    // let dYear = elDate.getFullYear();
    // var cDateCompleto = `${dSemana} ${dMes} de ${cMes} de ${dYear}`
    $('#horafun').text(hDisplay + mDisplay + sDisplay)
    // $('.diafun').text(cDateCompleto)
}
