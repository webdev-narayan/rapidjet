import { readFile } from "fs/promises"
let extenstion = await getExtension("rapidjet.config.json")

export default {
    sequelize: {
        model({ fields, modelName, config, location }) {
            const modelDefinition = fields
                .map((field) => `
    ${field.key}: {
        type: DataTypes.${field.value.toUpperCase()},
    }`)

            return `
import { DataTypes } from 'sequelize';
import sequelize from '${location}';

const ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)} = sequelize.define("${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}",{
        ${modelDefinition}
});

${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.sync();

export default ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)};
          `;
        },
        controller({ modelName }) {

            return `
                  import { getPagination, getMeta ,errorResponse } from "rapidjet"
                  import ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)} from "../models/${modelName}${extenstion}";
                  import { request, response } from "express";
              
                  export const create = async (req,res) => {
                      try {
                          const ${modelName} = await ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.create(req.body);
                          return res.status(200).send(${modelName});
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const find = async (req,res) => {
                      try {
                          const query = req.query;
                          const pagination = await getPagination(query.pagination);
                          const ${modelName}s = await ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.findAndCountAll({
                              offset: pagination.offset,
                              limit: pagination.limit
                          });
                          const meta = await getMeta(pagination, ${modelName}s.count);
                          return res.status(200).send({ data: ${modelName}s.rows, meta });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const findOne = async (req,res) => {
                      try {
                          const { id } = req.params;
                          const ${modelName} = await ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.findByPk(id);
                          if (!${modelName}) {
                              return res.status(404).send(errorResponse({ status: 404, message: "${modelName} not found!" }));
                          }
                          return res.status(200).send({ data: ${modelName} });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const update = async (req,res) => {
                      try {
                          const { id } = req.params;
                          const get${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)} = await ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.findByPk(id);
              
                          if (!get${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}) {
                              return res.status(400).send(errorResponse({ message: "Invalid ID" }));
                          }
              
                          const [rowCount, [${modelName}]] = await ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.update(req.body, { where: { id }, returning: true });
                          return res.status(200).send({ message: "${modelName} updated!", data: ${modelName} });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const destroy = async (req,res) => {
                      try {
                          const { id } = req.params;
                          const get${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)} = await ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.findByPk(id);
              
                          if (get${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}) {
                              return res.status(400).send(errorResponse({ message: "Invalid ID" }));
                          }
              
                          const ${modelName} = ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}.destroy({ where: { id } });
                          return res.status(200).send({ message: "${modelName} deleted!" });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
                `;
        },
        routes({ modelName }) {
            return `
            import { Router } from 'express';
            import { create, find, update, destroy, findOne } from '../controllers/${modelName}${extenstion}';
            const router = Router();
        
            // Create ${modelName}
            router.post("/api/${modelName}s", [], create);
        
            // List ${modelName}s
            router.get("/api/${modelName}s", [], find);
        
            // List Single ${modelName}
            router.get("/api/${modelName}s/:id", [], findOne);
        
            // Update ${modelName}s
            router.put("/api/${modelName}s/:id", [], update);
        
            // Delete ${modelName}
            router.delete("/api/${modelName}s/:id", [], destroy);
        
            export default router;
          `;
        },
        middleware({ fields }) {
            const JoiSchemaContent = fields
                .map(
                    (field) => `"${field.key}": Joi.${field.value}(),`
                )
                .join("\n");

            return `
        import Joi from "joi";
        import {errorResponse} from "rapidjet"            

        export const createRequest = async (req,res, next) => {
          const JoiSchema = Joi.object({
            ${JoiSchemaContent}
          });
        
          const result = JoiSchema.validate(req.body);
        
          if (result.error) {
            return res.status(400).send(errorResponse({
              message: result.error.message,
              details: result.error.details
            }));
          }
        
          await next();
        }
          `;
        },
    },
    mongoose: {
        model({ fields, modelName }) {
            const schemaDefinition = fields
                .map((field) => `'${field.key}': {
                    type: ${field.value.toLowerCase().charAt(0).toUpperCase() + field.value.slice(1)},
                }`)
                .join(',\n');
            return `
            import mongoose from 'mongoose';
            const ${modelName}Schema = new mongoose.Schema({
                ${schemaDefinition}
            });
    
            const ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)} = mongoose.model('${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)}', ${modelName}Schema);
    
            export default ${modelName.slice(0, 1).toUpperCase() + modelName.slice(1)};
        `;
        },
        controller({ modelName }) {
            const capitalizeModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);

            return `
            import { getPagination, getMeta ,errorResponse } from "rapidjet"
            import ${capitalizeModelName} from "../models/${modelName}${extenstion}";
            
            export const create = async (req,res) => {
                        try {
                            const ${modelName} = new ${capitalizeModelName}(req.body);
                            await ${modelName}.save();
                            return res.status(200).send({data:${modelName}});
                        } catch (error) {
                            console.log(error);
                            return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                        }
                    };
            
                    export const find = async (req,res) => {
                        try {
                            const query = req.query;
                            const pagination = await getPagination(query.pagination);
                            const ${modelName}s = await ${capitalizeModelName}.find().skip(pagination.offset).limit(pagination.limit);
                            const counts = await ${capitalizeModelName}.countDocuments({});
                            const meta = await getMeta(pagination, counts);
                            return res.status(200).send({ data: ${modelName}s, meta });
                        } catch (error) {
                            console.log(error);
                            return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                        }
                    };
            
                    export const findOne = async (req,res) => {
                        try {
                            const { id } = req.params;
                            const ${modelName} = await ${capitalizeModelName}.findById(id);
                            if (!${modelName}) {
                                return res.status(404).send(errorResponse({ status: 404, message: "${capitalizeModelName} not found!" }));
                            }
                            return res.status(200).send({ data: ${modelName} });
                        } catch (error) {
                            console.log(error);
                            return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                        }
                    };
            
                    export const update = async (req,res) => {
                        try {
                            const { id } = req.params;
                            const ${modelName} = await ${capitalizeModelName}.findByIdAndUpdate(id, req.body, { new: true });
                            if (!${modelName}) {
                                return res.status(400).send(errorResponse({ message: "Invalid ID" }));
                            }
                            return res.status(200).send({ message: "${capitalizeModelName} updated!", data: ${modelName} });
                        } catch (error) {
                            console.log(error);
                            return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                        }
                    };
            
                    export const destroy = async (req,res) => {
                        try {
                            const { id } = req.params;
                            const ${modelName} = await ${capitalizeModelName}.findByIdAndDelete(id);
                            if (!${modelName}) {
                                return res.status(400).send(errorResponse({ message: "Invalid ID" }));
                            }
                            return res.status(200).send({ message: "${capitalizeModelName} deleted!" });
                        } catch (error) {
                            console.log(error);
                            return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                        }
                    };
                `;
        },
        routes({ modelName }) {
            return `
            import { Router } from 'express';
            import { create, find, update, destroy, findOne } from '../controllers/${modelName}${extenstion}';
            const router = Router();
            import {createRequest} from "../middlewares/${modelName}.js"
            // Create ${modelName}
            router.post("/api/${modelName}s", [createRequest], create);
        
            // List ${modelName}s
            router.get("/api/${modelName}s", [], find);
        
            // List Single ${modelName}
            router.get("/api/${modelName}s/:id", [], findOne);
        
            // Update ${modelName}s
            router.put("/api/${modelName}s/:id", [], update);
        
            // Delete ${modelName}
            router.delete("/api/${modelName}s/:id", [], destroy);
        
            export default router;
          `;
        },
        middleware({ fields }) {
            const JoiSchemaContent = fields
                .map(
                    (field) => `"${field.key}": Joi.${field.value}(),`
                )
                .join("\n");

            return `
        import Joi from "joi";
        import {errorResponse} from "rapidjet"            
        export const createRequest = async (req,res, next) => {
          const JoiSchema = Joi.object({
            ${JoiSchemaContent}
          });
        
          const result = JoiSchema.validate(req.body);
        
          if (result.error) {
            return res.status(400).send(errorResponse({
              message: result.error.message,
              details: result.error.details
            }));
          }
        
          await next();
        }
          `;
        },

    },

    config: {
        "apiPath": "src/api",
        "databasePath": "database/index.js",
        "orm": "sequelize",
        "typescript": false
    }
}

async function getExtension(filename) {
    try {
        const jsonData = await readFile(`${filename}`)
        const config = JSON.parse(jsonData)
        return config.typescript ? ".ts" : ".js"
    } catch (error) {
        return ".js"
    }

}