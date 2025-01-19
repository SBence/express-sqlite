import * as esbuild from "esbuild";
import { join } from "path";

const sourceFolder = join("lib", "src");
const entryPoints = [join(sourceFolder, "index.ts")];
const buildFolder = "./dist";
const sharedBuildConfig = {
  entryPoints,
  bundle: true,
  platform: "node",
  packages: "external",
};
const buildConfigs = [
  { outfile: join(buildFolder, "index.mjs"), format: "esm" },
  { outfile: join(buildFolder, "index.cjs"), format: "cjs" },
];

for (const buildConfig of buildConfigs)
  esbuild.build({ ...sharedBuildConfig, ...buildConfig });
