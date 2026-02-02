# LuneSPA
LuneSPA es un mini-framework enfocado a hacer páginas SPA de una forma sencilla y divertida.
## Uso
Para usar esta librería es tan sencillo como poner a tu `index.js` las siguientes líneas:
```js
import createApp from "./LuneSPA/index.js";

createApp().start()
```

También puedes usar un CDN como `jsdelivr.net` con la línea:
```
https://cdn.jsdelivr.net/gh/DGamers-64/LuneSPA@main/index.js
```

Además debes de tener en el `index.html` principal un contenedor con un id (por defecto `"app"`).

Existen algunas configuraciones que le puedes pasar a `createApp()` en forma de objeto, estos son sus valores por defecto:
```js
rootId = "app",
indexView = "index",
viewsPath = "./views",
componentesPath = "./componentes",
globalCSSPath = "./global.css"
```

`rootId`: Id del contenedor por defecto que contendrá las diferentes vistas en tu página.

`indexView`: Nombre de la vista por defecto.

`viewsPath`: Ruta del directorio donde tienes las vistas guardadas.

`compontentesPath`: Ruta del directorio donde tienes los componentes guardados.

`globalCSSPath`: Ruta del archivo global CSS.

## Árbol de directorios

Un ejemplo de árbol de directorios que podrías tener para un proyecto sería este:
```bash
.
├── componentes
│   ├── componenteBotonCompra.html
│   └── componenteListaProductos.html
├── global.css
├── index.html
├── index.js
├── LuneSPA
│   ├── Componentes.js
│   └── index.js
└── views
    ├── index.html
    ├── vistaCarro.html
    └── vistaProductos.html
```

Las rutas configuradas anteriormente son a partir del `index.js` principal del proyecto como se puede observar en este esquema.

## Vistas
**IMPORTANTE**: En las vistas **NO** existe el objeto `document`, en su lugar se usa el objeto `shadow`.

Para crear una vista se crea un archivo `.html` con la siguiente estructura:
```html
<div>
    <button>Hola mundo</button>
</div>

<script>
    shadow.querySelector("button").addEventListener("click", () => {
        console.log("Hola mundo")
    })
</script>

<style>
    button {
        color: yellow;
        background-color: blue;
    }
</style>
```

Este es un ejemplo de un botón que al clickar imprime `Hola mundo` en la consola.

Ninguna etiqueta es obligatoria como tal, además puedes insertar scripts y estilos externos desde otros archivos:

```html
<script src="utils.js"></script>
<link rel="stylesheet" href="estilosMovil">
```

## Accediendo a una vista
Para acceder a una vista se usa el hash de la url. Por ejemplo para acceder a `vista1` se debe de introducir en la url `https://ejemplo.com#vista1`.

La vista por defecto configurada anteriormente se cargará sin necesidad de un hash, por lo tanto si por ejemplo dejas la configuración por defecto, con `https://ejemplo.com` se cargará la vista `index`.

Para pasarle ciertos parámetros a una vista se puede hacer con una falsa query en la URL. Por ejemplo si en `vista1` quiero poder entrar con un id como si fuera un prop de un componente, debo de escribir `https://ejemplo.com#vista1?id=0`, y para acceder a ello en la vista debo de acceder al objeto `params`.

```js
const id = params.id
console.log(id) // 0
```

## Componentes
Los componentes se crean igual y tienen la misma estructura que las vistas. Para invocar un componente desde una vista se hace de la siguiente manera:
```html
<div data-component="productoLista" data-id="0"></div>
<div data-component="productoLista" data-id="1"></div>
<div data-component="productoLista" data-id="2"></div>
```
`data-component` es el nombre del componente que quieres invocar.

La clase `Componentes` que viene cargada por defecto te permite usar distintos métodos relacionados a los componentes.

Dentro del componente para obtener los atributos pasados en el dataset se debe de acceder al objeto `props`.

```js
const id = props.id
console.log(id) // 0 con el primer componente mostrado arriba
```

### Métodos

#### cargarComponente(target: String | HTMLElement, root: HTMLElement)
Carga el componente seleccionado, puedes pasar solamente el nombre del elemento o el elemento tal cual.

#### cargarComponentes(root: HTMLElement)
Carga todos los componentes ubicados en la página.

#### setProp(target: String | HTMLElement, key: String, value: any, root: HTMLElement)
Inserta props al componente seleccionado, ya sea pasando el elemento o el nombre del componente a secas. El segundo argumento es la clave del prop, el tercero el valor y el cuarto el elemento `shadow`.

```js
Componentes.setProp("boton", "id", 0, shadow)
Componentes.setProp(shadow.querySelector('[data-component="boton"]'), "id", 0, shadow)
```

#### descargar(target: String | HTMLElement, root: HTMLElement)
Destruye el componente seleccionado, esto se puede invocar desde el propio componente usando el elemento `container`.

#### crearComponente(target: String | HTMLElement, props: Object) -> HTMLElement
Crea un componente y lo devuelve, permitiendo pasar un objeto con los `props` a insertar en este. Recuerda anidarlo a tu shadow una vez creado.

## CSS Global
Para poder tener una coherencia visual y no tener que estar siempre importando los mismos archivos CSS con estilos globales, el propio mini-framework importa automáticamente unos estilos globales a todas las vistas y componentes para fácil uso.
