export default class Componentes {
    static basePath = "./componentes"

    static setBasePath(path) {
        Componentes.basePath = path
    }

    static async cargarComponente(target) {
        let el

        if (typeof target === "string") {
            el = document.querySelector(`[data-component='${target}']`)
            if (!el) return
        } else if (target instanceof HTMLElement) {
            el = target
        } else {
            return
        }

        if (el.shadowRoot) return

        const shadow = el.attachShadow({ mode: "open" })
        const nombre = el.dataset.component
        if (!nombre) return

        const res = await fetch(`${this.basePath}/${nombre}.html`)
        const htmlText = await res.text()

        const tmp = document.createElement("div")
        tmp.innerHTML = htmlText

        const rootDiv = tmp.querySelector("div")
        if (rootDiv) shadow.appendChild(rootDiv)

        tmp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const clone = document.createElement("link")
            clone.rel = "stylesheet"
            clone.href = new URL(link.getAttribute("href"), location.href).href
            shadow.appendChild(clone)
        })

        tmp.querySelectorAll("style").forEach(style => {
            const clone = document.createElement("style")
            clone.textContent = style.textContent
            shadow.appendChild(clone)
        })

        tmp.querySelectorAll("script").forEach(oldScript => {
            if (oldScript.src) {
                const s = document.createElement("script")
                s.src = oldScript.src
                shadow.appendChild(s)
            } else {
                const fn = new Function(
                    "container",
                    "props",
                    "Componentes",
                    oldScript.textContent
                )
                fn(el, el.dataset, Componentes)
            }
        })
    }

    static async cargarComponentes(root = document) {
        const componentes = root.querySelectorAll("[data-component]")
        for (const el of componentes) {
            await Componentes.cargarComponente(el)
        }
    }

    static setProp(target, key, value) {
        let el
        if (typeof target === "string") {
            el = document.querySelector(`[data-component='${target}']`)
        } else if (target instanceof HTMLElement) {
            el = target
        }
        if (!el) return
        el.dataset[key] = value
        return el
    }

    static descargar(target) {
        let el
        if (typeof target === "string") {
            el = document.querySelector(`[data-component='${target}']`)
        } else if (target instanceof HTMLElement) {
            el = target
        }
        if (!el) return
        if (el.shadowRoot) el.shadowRoot.innerHTML = ""
        el.remove()
    }

    static crearComponente(nombre, props = {}) {
        const el = document.createElement("div")
        el.dataset.component = nombre
        Object.entries(props).forEach(([k, v]) => (el.dataset[k] = v))
        return el
    }
}
