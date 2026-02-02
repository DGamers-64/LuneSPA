export default class Componentes {
    static basePath = "./componentes"

    static setBasePath(path) {
        Componentes.basePath = path
    }

    static async cargarComponente(container) {
        if (container.shadowRoot) return

        const nombre = container.dataset.component
        if (!nombre) return

        const shadow = container.attachShadow({ mode: "open" })

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
                    "shadow",
                    "props",
                    oldScript.textContent
                )
                fn(container, shadow, container.dataset)
            }
        })
    }

    static async cargarComponentes(root = document) {
        const componentes = root.querySelectorAll("[data-component]")
        for (const el of componentes) {
            await Componentes.cargarComponente(el)
        }
    }

    static setProp(target, key, value, root = document) {
        let el

        if (typeof target === "string") {
            el = root.querySelector(`[data-component='${target}']`)
            if (!el) return
        } else if (target instanceof HTMLElement) {
            el = target
        } else {
            return
        }

        el.dataset[key] = value

        return el
    }
}
