import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { extname, dirname } from "path";
import { createHash } from "crypto";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@swc/core";

const extensions = [".js", ".jsx", ".mjs", ".ts", ".tsx", ".cts", ".mts"];

/** @type import("rollup").InputPluginOption */
const plugins = [
    nodeResolve(),
    commonjs(),
    {
        name: "swc",
        async transform(code, id) {
            const ext = extname(id);
            if (!extensions.includes(ext)) return null;

            const ts = ext.includes("ts");
            const tsx = ts ? ext.endsWith("x") : undefined;
            const jsx = !ts ? ext.endsWith("x") : undefined;

            const result = await swc.transform(code, {
                filename: id,
                jsc: {
                    externalHelpers: true,
                    parser: {
                        syntax: ts ? "typescript" : "ecmascript",
                        tsx,
                        jsx,
                    },
                },
                env: {
                    targets: "defaults",
                    include: [
                        "transform-classes",
                        "transform-arrow-functions",
                    ],
                },
            });
            return result.code;
        },
    },
    esbuild({ minify: true }),
];

async function buildPlugin(pluginDir) {
    const manifestPath = `./plugins/${pluginDir}/manifest.json`;
    const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
    const outPath = `./dist/${pluginDir}/index.js`;

    try {
        await mkdir(dirname(outPath), { recursive: true });

        const bundle = await rollup({
            input: `./plugins/${pluginDir}/${manifest.main}`,
            onwarn: () => {},
            plugins,
        });

        await bundle.write({
            file: outPath,
            globals(id) {
                if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
                const map = {
                    react: "window.React",
                };

                return map[id] || null;
            },
            format: "iife",
            compact: true,
            exports: "named",
        });
        await bundle.close();

        const toHash = await readFile(outPath);
        manifest.hash = createHash("sha256").update(toHash).digest("hex");
        manifest.main = "index.js";
        await writeFile(`./dist/${pluginDir}/manifest.json`, JSON.stringify(manifest, null, 2));

        console.log(`Successfully built ${manifest.name}!`);
    } catch (e) {
        console.error(`Failed to build plugin ${pluginDir}...`, e);
        process.exit(1);
    }
}

async function main() {
    try {
        const pluginDirs = await readdir("./plugins");

        for (const pluginDir of pluginDirs) {
            await buildPlugin(pluginDir);
        }
    } catch (e) {
        console.error("Failed to read plugins directory or build plugins...", e);
        process.exit(1);
    }
}

main();
