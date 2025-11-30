package com.sqrc.module.backendsqrc.plantillaRespuesta.model;

public class PlantillaDefault {

    // Este es tu diseño "Hoja Bond Formal" que definimos antes
    public static final String HTML_FORMAL = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f0f0f0;
                    margin: 0;
                    padding: 40px 0;
                }
                .hoja-carta {
                    background-color: #ffffff;
                    width: 100%;
                    max-width: 650px;
                    margin: 0 auto;
                    padding: 50px 60px;
                    border: 1px solid #ccc;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }
                .header-expediente {
                    text-align: right;
                    font-weight: bold;
                    font-size: 10pt;
                    margin-bottom: 40px;
                }
                .fecha { margin-bottom: 30px; font-size: 11pt; }
                .cliente-info { margin-bottom: 20px; line-height: 1.5; font-size: 11pt; }
                .referencia-tabla { width: 100%; margin-bottom: 30px; font-size: 11pt; }
                .referencia-tabla td { padding-bottom: 5px; vertical-align: top; }
                .saludo { margin-bottom: 20px; font-size: 11pt; }
                .contenido {
                    text-align: justify;
                    line-height: 1.5;
                    font-size: 11pt;
                    min-height: 150px;
                    margin-bottom: 50px;
                }
                .contenido p { margin-bottom: 15px; }
                .despedida { margin-top: 40px; font-size: 11pt; }
            </style>
        </head>
        <body>
            <div class="hoja-carta">
                <div class="header-expediente">EXPEDIENTE: ${numero_ticket}</div>
                <div class="fecha">${fecha_actual}</div>
                
                <div class="cliente-info">
                    Señor(a):<br>
                    <strong>${nombre_cliente}</strong>
                </div>

                <table class="referencia-tabla" border="0" cellspacing="0">
                    <tr>
                        <td width="120">Servicio/Línea</td>
                        <td width="15">:</td>
                        <td>${identificador_servicio}</td> 
                    </tr>
                    <tr>
                        <td>Reclamo N°</td>
                        <td>:</td>
                        <td>${numero_ticket}</td>
                    </tr>
                </table>

                <div class="saludo">De nuestra mayor consideración:</div>

                <div class="contenido">
                    <div style="text-align: center; margin-bottom: 25px; font-weight: bold; text-decoration: underline;">
                        ${titulo}
                    </div>
                    
                    ${cuerpo}
                </div>

                <div class="despedida">${despedida}</div>
            </div>
        </body>
        </html>
        """;
}
