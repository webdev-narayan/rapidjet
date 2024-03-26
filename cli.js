#!/usr/bin/env node
import { program } from "commander";
import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";
import readline from "readline";
import * as rimraf from "rimraf"; // Import the 'rimraf' package
import contentfile from './content.js'


program.command("init").description("Initialize the CLI configuration file").action(() => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const filePath = "rapidjet.config.json";
    fs.writeFileSync(filePath, `${JSON.stringify(contentfile.config)}`);
    rl.close();
    console.log(`CLI has been initialized , A rapidjet.config.json file has been created`);
});

let content

program.command("generate").description("Generate model-related folders and files").action(async () => {
    try {

        const configpath = path.join(process.cwd(), "rapidjet.config.json")
        // const config = await import(`file://${configpath}.json`)
        const jsonData = await readFile(`${configpath}`)
        const config = JSON.parse(jsonData)
        content = contentfile[config.orm];
        let length, sep, location;
        let extenstion = config.typescript ? ".ts" : ".js"
        if (!config.apiPath || config.apiPath.trim() === "") {
            console.log("apiPath not found in rapidjet.config.json")
            return { error: "apiPath not found in rapidjet.config.json", message: "kindly initiaize the cli using init command" }
        }
        if (config.apiPath.trim() === "") {
            length = 2
            sep = "../";
            location = sep.repeat(length) + config.databasePath
        } else {
            length = 2 + config.apiPath.split("/").filter(item => item.trim() !== "").length
            sep = "../"
            location = sep.repeat(length) + config.databasePath
        }

        const { modelName, fields } = await promptForModelInfo();
        generateModelFiles({ modelName, fields, config, location, extenstion });
        generateControllerFile({ modelName, fields, config, extenstion });
        generateMiddlewareFile({ modelName, fields, config, extenstion });
        generateRouteFile({ modelName, fields, config, extenstion });
    } catch (error) {
        if (error.code === "ENOENT") {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            rl.question("CLI configuration not found. Initialize now? (y/n)", async (anwer) => {
                rl.close();
                if (anwer.toLocaleLowerCase() === "y") {
                    const filePath = "rapidjet.config.json";
                    fs.writeFileSync(filePath, `${JSON.stringify(contentfile.config)}\n`);
                    console.log(`CLI configuration initialized.\n A new file ${path.join(process.cwd(), filePath)} \n Please setup the config file and run 'generate' again.`);

                }
            })
        } else {
            console.log(error)
        }
        // console.log( ? "Please initialize the cli using cmd - 'node cli init' before running 'generate'" : error)
        // throw error("Please initialize the cli using cmd - 'node cli init' before running 'generate' ")
    }
});
// to remove api
program.command("remove <modelName>").description("Remove model-related folders and files")
    .action((modelName) => {
        removeModelFiles(modelName);
    });

program.parse(process.argv);

async function promptForModelInfo() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const modelName = await new Promise((resolve) => {
        rl.question("Enter the model name: ", (answer) => {
            resolve(answer);
        });
    });

    const fields = await new Promise((resolve) => {
        rl.question("Enter model fields (key:value format, e.g., name:string): ", (answer) => {
            const fieldArray = answer.split(",").map((field) => {
                const [key, value] = field.trim().split(":");
                return { key, value };
            });
            resolve(fieldArray);
        });
    });

    rl.close();

    return { modelName, fields };
}


function generateModelFiles({ modelName, fields, config, location, extenstion }) {
    // const apiPath = path.join(process.cwd(), "src", "api", modelName);
    const apiDirectory = path.join(process.cwd(), config.apiPath, modelName);
    const modelsDirectory = path.join(apiDirectory, "models");
    fs.mkdirSync(modelsDirectory, { recursive: true });

    // Create model file
    const modelFileContent = content.model({ modelName, fields, config, location });
    // const modelFileContent = generateModelFileContent(modelName, fields);
    const modelFilePath = path.join(modelsDirectory, `${modelName}${extenstion}`);
    fs.writeFileSync(modelFilePath, modelFileContent);
}
function generateControllerFile({ modelName, fields, config, extenstion }) {
    // const apiDirectory = path.join(process.cwd(), "src", "api", modelName);
    const apiDirectory = path.join(process.cwd(), config.apiPath, modelName);

    const controllersDirectory = path.join(apiDirectory, "controllers");
    fs.mkdirSync(controllersDirectory, { recursive: true });

    // Create controller file
    const controllerFileContent = content.controller({ modelName });
    // const controllerFileContent = generateControllerFileContent(modelName);
    const controllerFilePath = path.join(controllersDirectory, `${modelName}${extenstion}`);
    fs.writeFileSync(controllerFilePath, controllerFileContent);
}

function generateMiddlewareFile({ modelName, fields, config, extenstion }) {
    const apiDirectory = path.join(process.cwd(), config.apiPath, modelName);
    const middlewaresDirectory = path.join(apiDirectory, "middlewares");
    fs.mkdirSync(middlewaresDirectory, { recursive: true });

    // Create middleware file
    const middlewareFileContent = content.middleware({ fields });
    // const middlewareFileContent = generateMiddlewareFileContent(modelName, fields);
    const middlewareFilePath = path.join(middlewaresDirectory, `${modelName}${extenstion}`);
    fs.writeFileSync(middlewareFilePath, middlewareFileContent);
}

function generateRouteFile({ modelName, fields, config, extenstion }) {
    const apiDirectory = path.join(process.cwd(), config.apiPath, modelName);
    const routesDirectory = path.join(apiDirectory, "routes");
    fs.mkdirSync(routesDirectory, { recursive: true });

    // Create route file
    const routeFileContent = content.routes({ modelName });
    // const routeFileContent = generateRouteFileContent(modelName);
    const routeFilePath = path.join(routesDirectory, `${modelName}${extenstion}`);
    fs.writeFileSync(routeFilePath, routeFileContent);
}

// remove files functinality
async function removeModelFiles(modelName) {
    const configpath = path.join(process.cwd(), "rapidjet.config.json")
    // const config = await import(`file://${configpath}`)
    const jsonData = await readFile(`${configpath}`)
    const config = JSON.parse(jsonData)
    const apiDirectory = path.join(process.cwd(), config.apiPath, modelName);

    // Check if the API directory exists
    if (fs.existsSync(apiDirectory)) {
        // Use the 'rimraf' package to remove the entire directory and its contents
        rimraf.sync(apiDirectory);
        console.log(`Model "${modelName}" and its associated files have been removed.`);
    } else {
        console.log(`Model "${modelName}" does not exist.`);
    }
}
