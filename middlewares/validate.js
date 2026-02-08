const BadRequestError = require("../errors/BadRequestError");

function checkType(value, type) {
  if (type === "number") return value !== undefined && value !== null && !isNaN(Number(value));
  if (type === "string") return typeof value === "string" && value.trim() !== "";
  if (type === "boolean") return typeof value === "boolean";
  return true;
}

function validate(schema = {}) {
  return (req, res, next) => {
    try {
      const sources = { body: req.body || {}, params: req.params || {}, query: req.query || {} };

      for (const key of ["body", "params", "query"]) {
        if (!schema[key]) continue;
        const def = schema[key];

        // required fields
        if (Array.isArray(def.required)) {
          for (const field of def.required) {
            if (sources[key][field] === undefined || sources[key][field] === null || sources[key][field] === "") {
              return next(new BadRequestError(`Missing required field: ${field}`));
            }
          }
        }

        // properties checks
        if (def.properties) {
          for (const [field, desc] of Object.entries(def.properties)) {
            const val = sources[key][field];
            if (val === undefined || val === null) continue; // skip optional
            if (desc.type && !checkType(val, desc.type)) {
              return next(new BadRequestError(`Invalid type for field ${field}`));
            }
            if (desc.enum && Array.isArray(desc.enum) && !desc.enum.includes(val)) {
              return next(new BadRequestError(`Invalid value for field ${field}`));
            }
          }
        }
      }

      return next();
    } catch (err) {
      return next(new BadRequestError("Invalid payload"));
    }
  };
}

module.exports = validate;
