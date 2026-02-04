import Componentes from "https://cdn.jsdelivr.net/gh/DGamers-64/LuneSPA@main/Componentes.js";

export default function createApp({
    rootId = "app",
    indexView = "index",
    viewsPath = "./views",
    componentesPath = "./componentes",
    globalCSSPath = "./global.css"
} = {}) {

    Componentes.setBasePath(componentesPath)

    const root = document.getElementById(rootId)
    if (!root) throw new Error(`No existe #${rootId}`)

    const shadow = root.attachShadow({ mode: "open" })

    if (globalCSSPath) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = globalCSSPath
        link.dataset.persistent = "true"
        shadow.appendChild(link)
    }

    const inyectados = {
        scripts: [],
        styles: [],
        links: []
    }

    async function start() {
        await loadView(location.hash.substring(1))
        window.addEventListener("hashchange", () => {
            loadView(location.hash.substring(1))
        })
    }

    async function loadView(route) {
        limpiar()

        if (!route || route === "#") route = indexView

        const [path, query] = route.split("?")
        window.params = Object.fromEntries(new URLSearchParams(query))

        const res = await fetch(`${viewsPath}/${path}.html`)
        const html = await res.text()

        const tmp = document.createElement("div")
        tmp.innerHTML = html

        const viewRoot = tmp.querySelector("div")
        shadow.appendChild(viewRoot)

        tmp.querySelectorAll("style").forEach(s => {
            const clone = document.createElement("style")
            clone.textContent = s.textContent
            shadow.appendChild(clone)
            inyectados.styles.push(clone)
        })

        tmp.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
            const clone = document.createElement("link")
            clone.rel = "stylesheet"
            clone.href = l.href
            shadow.appendChild(clone)
            inyectados.links.push(clone)
        })

        tmp.querySelectorAll("script").forEach(oldScript => {
            if (oldScript.src) {
                const s = document.createElement("script")
                s.src = oldScript.src
                shadow.appendChild(s)
                inyectados.scripts.push(s)
            } else {
                const fn = new Function("shadow", "params", "Componentes", oldScript.textContent)
                fn(shadow, window.params, Componentes)
            }
        })
    }

    function limpiar() {
        Array.from(shadow.children).forEach(node => {
            if (!node.dataset?.persistent) {
                node.remove()
            }
        })

        Object.values(inyectados).flat().forEach(n => n.remove())
        Object.values(inyectados).forEach(arr => arr.length = 0)
    }

    return { start }
}
