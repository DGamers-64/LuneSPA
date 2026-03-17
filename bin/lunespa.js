#!/usr/bin/env node

import { createServer } from "http";
import { readFile, cp, mkdir, writeFile } from "fs/promises";
import { dirname, join, extname } from "path";
import { watch } from "chokidar";
import { fileURLToPath } from "url";

const command = process.argv[2];
const CWD = process.cwd();
const PUBLIC = join(CWD, "public");
const DIST = join(CWD, "dist");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRAMEWORK_DIR = join(__dirname, "..");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

if (command === "dev") {
  const PORT = 3000;

  const server = createServer(async (req, res) => {
    let urlPath = req.url.split("?")[0];

    let filePath;
    if (urlPath.startsWith("/lunespa/")) {
      filePath = join(FRAMEWORK_DIR, urlPath.replace("/lunespa/", ""));
    } else {
      filePath = join(PUBLIC, urlPath === "/" ? "index.html" : urlPath);
    }

    try {
      const data = await readFile(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
      res.end(data);
    } catch {
      try {
        const html = await readFile(join(PUBLIC, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`🌙 LuneSPA dev server → http://localhost:${PORT}`);
  });

  watch(PUBLIC).on("change", (path) => {
    console.log(`♻️  Cambio detectado: ${path}`);
  });
}

else if (command === "build") {
  console.log("🔨 Building...");

  await mkdir(DIST, { recursive: true });

  await cp(PUBLIC, DIST, { recursive: true });

  const frameworkDest = join(DIST, "lunespa");
  await mkdir(frameworkDest, { recursive: true });
  await cp(join(FRAMEWORK_DIR, "index.js"), join(frameworkDest, "index.js"));
  await cp(join(FRAMEWORK_DIR, "Components.js"), join(frameworkDest, "Components.js"));

  const htmlPath = join(DIST, "index.html");
  let html = await readFile(htmlPath, "utf8");
  html = html.replaceAll(
    /from\s+["'].*?lunespa.*?["']/g,
    `from "/lunespa/index.js"`
  );
  await writeFile(htmlPath, html);

  console.log("✅ Build listo en /dist");
}

else if (command === "init") {
  const dirs = ["public/views", "public/components"];
  for (const d of dirs) await mkdir(join(CWD, d), { recursive: true });

  await writeFile(join(CWD, "public/index.html"), `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>LuneSPA App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import createApp from "/lunespa/index.js";
    createApp().start();
  </script>
</body>
</html>`);

  await writeFile(join(CWD, "public/global.css"), `* { box-sizing: border-box; margin: 0; padding: 0; }`);

  await writeFile(join(CWD, "public/views/index.html"), `<div>
  <h1>¡Hola desde LuneSPA!</h1>
</div>`);

  console.log("🌙 Proyecto inicializado. Ejecuta: npx lunespa dev");
}

else {
  console.log(`
🌙 LuneSPA CLI

  lunespa init    → crea la estructura de carpetas en public/
  lunespa dev     → servidor de desarrollo en localhost:3000
  lunespa build   → genera la carpeta dist/ lista para desplegar
  `);
}