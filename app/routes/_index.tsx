import { json, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fs from 'fs';
import path from 'path';

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type WasmModuleCache = {
  [path: string]: WebAssembly.Module;
};

require('../wasm/wasm_exec.js');
const go = new Go();
const wasmModuleCache: WasmModuleCache = {};

export const loader = async () => {
  const wasmPath = path.resolve(__dirname, '../app/wasm/ogper-goroutine.wasm');
  const wasmModule = wasmModuleCache[wasmPath] ? wasmModuleCache[wasmPath] : await WebAssembly.compile(fs.readFileSync(wasmPath));
  const wasmInstance = await WebAssembly.instantiate(wasmModule, go.importObject);

  if (!wasmModuleCache[wasmPath]) {
    wasmModuleCache[wasmPath] = wasmModule;
    go.run(wasmInstance);
  }

  const og = await ogper.getOGP('https://github.com/ihch');

  return json({ og: JSON.parse(og) });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  console.log(data);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <p>{data.og.title}</p>
      <img src={data.og.image} alt={data.og.title} />
    </div>
  );
}
