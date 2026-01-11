
import { loadPluginConfig } from "./src/plugin-config";
import { join } from "path";

const cwd = process.cwd();
console.log(`Current directory: ${cwd}`);

const mockCtx = {
  client: {},
  directory: cwd
};

try {
  console.log("Attempting to load config...");
  const config = loadPluginConfig(cwd, mockCtx);
  console.log("Config loaded successfully.");
  
  if (config.supermemory_api_key) {
    console.log("SUCCESS: supermemory_api_key found!");
    console.log(`Key length: ${config.supermemory_api_key.length}`);
    console.log(`Key starts with: ${config.supermemory_api_key.substring(0, 4)}`);
  } else {
    console.log("FAILURE: supermemory_api_key is undefined or empty.");
    console.log("Full config keys:", Object.keys(config));
  }
} catch (error) {
  console.error("Error loading config:", error);
}
