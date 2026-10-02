const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const schemaPath = path.join(__dirname, '../schemas/property.schema.json');
const dataPath = path.join(__dirname, '../data/generated/synthetic_properties.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(schema);
const records = Array.isArray(data) ? data : [data];

console.log(`\n--- Running Ajv Validation on ${records.length} Record(s) ---`);

records.forEach((record, idx) => {
  const valid = validate(record);
  if (valid) {
    console.log(`Record #${idx + 1}: VALID`);
  } else {
    console.log(`Record #${idx + 1}: INVALID`);
    console.log(JSON.stringify(validate.errors, null, 2));
  }
});