
        import Joi from "joi";
        
        export const createRequest = async (req = request, res = response, next) => {
          const JoiSchema = Joi.object({
            "name": Joi.string(),
"email": Joi.string(),
"password": Joi.string(),
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
          