window.onload=inicio;
function inicio(){

	//Adicionar basemap Open Street Map
    var basemapOSM=new ol.layer.Tile({
        source: new ol.source.OSM()
    });

	//colores personalizados por el uso vivienda
    var usovivienda = new ol.style.Style({
        fill : new ol.style.Fill({
            color:[253,253,150,0.8]
        }),    
        stroke : new ol.style.Stroke({
            color:[0,0,0,1],
            width:2
        })
    })

	//colores personalizados por el uso recreacion
    var usorecreacion = new ol.style.Style({
        fill : new ol.style.Fill({
            color:[0,143,57,0.8]
        }),    
        stroke : new ol.style.Stroke({
            color:[0,0,0,1],
            width:2
        })
    })

	//colores personalizados por el uso comercio
    var usocomercio = new ol.style.Style({
        fill : new ol.style.Fill({
            color:[255,0,0,0.6]
        }),    
        stroke : new ol.style.Stroke({
            color:[0,0,0,1],
            width:2
        })
    })

	//funcion para etiquetas y colores personalizados
    var estilosmanzana=function(feature){
        var usomanzanageojson=feature.get('uso');

        var etiquetauso = new ol.style.Style({
            text: new ol.style.Text({
                font:'bold 10px arial',
                text:usomanzanageojson,
                scale:1.2,
                fill:new ol.style.Fill({
                    color:[0,0,0,1]
                })

            })
        })

        if (usomanzanageojson=='VIVIENDA'){
            feature.setStyle([usovivienda,etiquetauso])
        }
        if (usomanzanageojson=='RECREACION'){
            feature.setStyle([usorecreacion,etiquetauso])
        } 
        if (usomanzanageojson=='COMERCIO'){
            feature.setStyle([usocomercio,etiquetauso])
        }                
    }

	//Adicionar una capa vectorial desde un geojson
    var manzanageojson = new ol.layer.Vector({
        source: new ol.source.Vector({
            url:'data/manzana.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        title:'Usos',
        style: estilosmanzana
    })

	//icono para el parque
    var iconoparque=new ol.style.Icon({
        src:'data/icon/paving.png',
        scale:0.09
    })

	//icono para el aeropuerto
    var iconoaeropuerto=new ol.style.Icon({
        src:'data/icon/taman.png',
        scale:0.09
    })
	
	//icono para el colegio
    var iconocolegio=new ol.style.Icon({
        src:'data/icon/gedung.png',
        scale:0.09
    })

	//icono para la huaca
    var iconohuaca=new ol.style.Icon({
        src:'data/icon/gapura.png',
        scale:0.09
    })

	//funcion iconos de acuerdo a su descripcion
    var estilospuntos=function(feature){
        var descpuntogeojson=feature.get('descripcion');

        if (descpuntogeojson=='PARQUE'){
            feature.setStyle(new ol.style.Style({image:iconoparque}))
        }
        if (descpuntogeojson=='HUACA'){
            feature.setStyle(new ol.style.Style({image:iconohuaca}))
        } 
        if (descpuntogeojson=='COLEGIO'){
            feature.setStyle(new ol.style.Style({image:iconocolegio}))
        }
        if (descpuntogeojson=='AEROPUERTO'){
            feature.setStyle(new ol.style.Style({image:iconoparque}))
        }                         
    }

	//adicion de puntos desde un geojson
    var puntosgeojson = new ol.layer.Vector({
        source: new ol.source.Vector({
            url:'data/puntos.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        title:'Sitios de interés',
        style: estilospuntos
    })

	//color de la linea
    var estilovia=new ol.style.Stroke({
        color:[255,0,0,1],
        width:3
    }) 

	//Adicionar via desde un geojson
    var viassgeojson = new ol.layer.Vector({
        source: new ol.source.Vector({
            url:'data/vias.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        title:'Callejero',
        style: new ol.style.Style({
            stroke: estilovia
        })
    })    

	//mapa de calor
    var mapacaliente = new ol.layer.Heatmap({
        source: new ol.source.Vector({
            url:'data/heatmap.geojson',
            format: new ol.format.GeoJSON()
        }),
        gradient:['#00f','#0ff','#0f0','#f00','#000'],
        radius:20,
        blur:15,
        weight:'tasa',
        visible:true,
        title:'Mapa Caliente'
    }) 

    var vistaMapa=new ol.View({
        center:[-77.02382510973527,-12.079925732204165],// longitud, latitud
        zoom:18,
        projection:'EPSG:4326'//Datum: WGS84 Geográficas:4326
    });

    const map = new ol.Map({
        view: vistaMapa,
        layers:[basemapOSM,manzanageojson,puntosgeojson,viassgeojson,mapacaliente],
        target:"mapa"
    })

    var pantallaCompleta = new ol.control.FullScreen();
    map.addControl(pantallaCompleta);

    var barraEscala = new ol.control.ScaleLine({
        bar:true,
        text:true
    });
    map.addControl(barraEscala);

    var overviewMap = new ol.control.OverviewMap({
        layers:[
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        collapsed:true
    });
    map.addControl(overviewMap);

    var mostrarCoordenadas = new ol.control.MousePosition({
        projection:'EPSG:4326',
        coordinateFormat: function(coordenada){
            return ol.coordinate.format(coordenada, '{y}, {x}', 6)
        }
    });
    map.addControl(mostrarCoordenadas);

    var controlCapas=new ol.control.LayerSwitcher({
        tipLabel:"Leyenda"
    });
    map.addControl(controlCapas);

	//Adicion de popup (ventana emergente)
    var ventanaTitulo = document.getElementById('popup-title');
    var ventanaContenido = document.getElementById('popup-content');
    var ventanaContenedor = document.getElementById('popup-container');
    var overlay = new ol.Overlay({
        element:ventanaContenedor
    })

    map.on('click',function(e){
        overlay.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature,layer){
            var usomanzana = feature.get('uso');
            map.addOverlay(overlay);
            ventanaTitulo.innerHTML='Manzanas <br>';
            ventanaContenido.innerHTML = 'USO: ' + usomanzana + '<br>';
            overlay.setPosition(e.coordinate);
        })
    })



}
