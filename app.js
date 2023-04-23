window.onload=inicio;
function inicio(){

    var vistaMapa=new ol.View({
        center:[-74.62984745791252,-9.07616144906471],// longitud, latitud
        zoom:5,
        projection:'EPSG:4326'//Datum: WGS84 Geográficas:4326
    });

    const map = new ol.Map({
        view: vistaMapa,
        //layers:[basemapOSM,wmsLayer,restLayer],
        target:"mapa",
        controls:[]
      })
      
    var basemapBlanco = new ol.layer.Tile({
		title: 'Blanco',
		type: 'base',
		visible: false
	});      
    
	var basemapOSM = new ol.layer.Tile({
		title: 'Open Street Map',
		visible: true,
		type: 'base',
		source: new ol.source.OSM()
	});

    var basemapGoogleSatelite = new ol.layer.Tile({
		title:'Google Satellite',
		type:'base',
		visible:false,
		source: new ol.source.XYZ({
			url: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
			})
	});

	var basemapGoogle = new ol.layer.Tile({
		title:'Google Callejero',
		type:'base',
		visible:false,
		source: new ol.source.XYZ({
			url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
			})
	});

	var basemapBing = new ol.layer.Tile({
		title:'Bing Map',
		type:'base',
		visible:false,
		source: new ol.source.BingMaps({
			key:'Anzbo5_U1A0SuxVZpc8rqUBSRLsHmJ1ZgCGzhYnxXKpkpm9k3SuyK7OgitBhBPUs',
			imagerySet:'Aerial'
			})
	});	
	
	var baseGroup = new ol.layer.Group({
		title: 'Base maps',
		fold: true,
		layers: [basemapBing,basemapGoogle, basemapGoogleSatelite, basemapOSM, basemapBlanco]
	});

	map.addLayer(baseGroup);

    var wmsdepartamentos=new ol.layer.Tile({
        title:'Departamentos de Perú',
        source: new ol.source.TileWMS({
            projection:'EPSG:4326',
            attributions:'INEI CENSO 2017',
            url:'http://192.168.1.48:8080/geoserver/clase03/wms',
            params:{
                'LAYERS':'clase03:Departamentos',
                'TILED': true,
				'FORMAT':'image/png',
				'TRANSPARENT':true
            },
            serverType:'geoserver',
			visible:true
        })
    });
	
	var overlayGroup = new ol.layer.Group({
		title: 'Capas Operacionales',
		fold: true,
		layers: [wmsdepartamentos]
	});
	
	map.addLayer(overlayGroup);

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
        activationMode: 'click',
		startActive: false,
		groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
    });
    map.addControl(controlCapas);

	var container = document.getElementById('popup');
	var contenido = document.getElementById('popup-content');
	var cerrar = document.getElementById('popup-closer');
	
	var popup = new ol.Overlay({
		element: container,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		},
	});

	map.addOverlay(popup);

	cerrar.onclick = function () {
		popup.setPosition(undefined);
		cerrar.blur();
		return false;
	};

	map.on('singleclick', function (evt) {
		contenido.innerHTML = '';
		var resolution = vistaMapa.getResolution();

		var url = wmsdepartamentos.getSource().getFeatureInfoUrl(evt.coordinate, resolution, 'EPSG:4326', {
				'INFO_FORMAT': 'text/html'
			});

			if (url) {
				popup.setPosition(evt.coordinate);
				contenido.innerHTML='<iframe src="'+url+'"></iframe>';
			} else {
				popup.setPosition(undefined);
			}
	});
	
	function leyendawms(){
		var sincapas=overlayGroup.getLayers().get('length');
		var titulo=document.createElement("h4");
		var texto=document.createTextNode("Leyenda WMS");
		titulo.appendChild(texto);
		var elemento=document.getElementById('leyenda');
		elemento.appendChild(titulo);
		var registros=[];
		var i;
		for(i=0;i<sincapas;i++){
			registros.push("http://192.168.1.48:8080/geoserver/clase03/wms?request=GetLegendGraphic&version=1.0.0&format=image/png&width=20&height=20&layer=clase03:Departamentos");
		}
		for(i=0;i<sincapas;i++){
			var titulo2=document.createElement("p");
			var texto2=document.createTextNode(overlayGroup.getLayers().item(i).get('title'));
			titulo2.appendChild(texto2);
			var elemento2=document.getElementById('leyenda');
			elemento2.appendChild(titulo2);
			var imagen=new Image();
			imagen.src=registros[i];
			var fuente=document.getElementById('leyenda');
			fuente.appendChild(imagen);
		}
	}

	leyendawms();

}
