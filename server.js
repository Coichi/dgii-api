const express = require("express");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const Nightmare = require("nightmare");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

const nightmare = Nightmare({ show: false });
const port = process.env.PORT || 3000;
const rncUrl = "https://dgii.gov.do/app/WebApps/ConsultasWeb2/ConsultasWeb/consultas/rnc.aspx";
const ncfUrl = "https://dgii.gov.do/app/WebApps/ConsultasWeb2/ConsultasWeb/consultas/ncf.aspx";

function fetchRNC(rnc) {
    const result = 
        nightmare
            .goto(rncUrl)
            .wait("body")
            .type("#cphMain_txtRNCCedula", rnc)
            .click("#cphMain_btnBuscarPorRNC")
            .wait("tbody")
            .evaluate(() => document.querySelector("body").innerHTML)
            .end()
            .then(response => {
                return cheerio.load(response);
            }).catch(err => {
                console.log(err);
                return undefined;
            });

    return result;
}

function fetchNCF(rnc, ncf) {
    const result = 
        nightmare
            .goto(ncfUrl)
            .wait("body")
            .type("#cphMain_txtRNC", rnc)
            .type("#cphMain_txtNCF", ncf)
            .click("#cphMain_btnConsultar")
            .wait("tbody")
            .evaluate(() => document.querySelector("body").innerHTML)
            .end()
            .then(response => {
                return cheerio.load(response);
            }).catch(err => {
                console.log(err);
                return undefined;
            });

    return result;
}

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/rnc", async function(req, res) {
    const $ = await fetchRNC(req.query.rnc);
    const value = {
        encontrado: false,
        cedulaRnc: "",
        razonSocial: "",
        nombreComercial: "",
        categoria: "",
        regimenPagos: "",
        estado: "",
        actividadEconomica: "",
        administracionLocal: ""
    }

    if ($) {
        value.encontrado = true;
        $("td", "tbody").each((i, elem) => {
            switch(i) {
                case 1: value.cedulaRnc = $(elem).text();  break;
                case 3: value.razonSocial = $(elem).text(); break;
                case 5: value.nombreComercial = $(elem).text(); break;
                case 7: value.categoria = $(elem).text(); break;
                case 9: value.regimenPagos = $(elem).text(); break;
                case 11: value.estado = $(elem).text(); break;
                case 13: value.actividadEconomica = $(elem).text(); break;
                case 15: value.administracionLocal = $(elem).text(); break;            
            }
        });
    } 

    res.send(value);
});

app.get("/ncf", async function(req, res) {
    const $ = await fetchNCF(req.query.rnc, req.query.ncf);
    const value = {
        encontrado: false,
        cedulaRnc: "",
        razonSocial: "",
        tipoComprobante: "",
        ncf: "",
        estado: "",
        validoHasta: ""
    }

    if ($) {
        value.encontrado = true;
        /*$("td", "tbody").each((i, elem) => {
            console.log($(elem).text());
            switch(i) {
                case 0: value.cedulaRnc = $(elem).text();  break;
                case 1: value.razonSocial = $(elem).text(); break;
                case 2: value.tipoComprobante = $(elem).text(); break;
                case 3: value.ncf = $(elem).text(); break;
                case 4: value.estado = $(elem).text(); break;
                case 5: value.validoHasta = $(elem).text(); break;
            }
        });*/

        value.cedulaRnc = $("#cphMain_lblRncCedula", "tbody").text();
        value.razonSocial = $("#cphMain_lblRazonSocial", "tbody").text();
        value.tipoComprobante = $("#cphMain_lblTipoComprobante", "tbody").text();
        value.ncf = $("#cphMain_lblNCF", "tbody").text();
        value.estado = $("#cphMain_lblEstado", "tbody").text();
        value.validoHasta = $("#cphMain_lblVigencia", "tbody").text();
    } 

    res.send(value);
});

app.listen(port, function() {
    console.log("app running successfully on port " + port);
});