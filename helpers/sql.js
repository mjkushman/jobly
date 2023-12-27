const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/* Accepts a data object and a JS to SQL mapping object which maps JS variable names to corresponding database column names.
* dataToUpdate will be key:value object passed from the reqest body. It may inclde keys { firstName, lastName, password, email, isAdmin }
* jsToSql translates JS variable names to table column headers, eg firstName => first_name.
* 
* Returns a string of SQL as setCols in format ` "column_name"=$val1, column_name=$val2..." `
* Along with an array of corresponding values.
* The SQL string should be used in a query as SET (string), the values array should be used as values to be set with.
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // Update function must have something to update
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
