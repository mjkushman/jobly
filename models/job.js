// COPIED FROM COMPNAY

"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { id, title, salary, equity, company_handle (references companies table) }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  // Create a new job for a company. ID is created automatically

  static async create({title, salary, equity, companyHandle }) {
    console.log('received POST to create a job:', title, salary, equity, companyHandle)
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
        [
          title,
          salary,
          equity,
          companyHandle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(searchFilters = {}) {


    console.log('FILTERS')
    let query = 
    `SELECT id,
    title,
    salary,
    equity,
    company_handle
    FROM jobs`
    let queryTail = ` ORDER BY title`;
    
    // destructure filters from the req.params
    let {title, minSalary, hasEquity} = searchFilters
    console.log('Job model, hasEquity:', hasEquity)
    
    // Start with an empty array. Will be used to build WHERE statement
    let whereFilterClauses = []
    
    // queryValues will be used at the end for sanitization
    let queryValues = []

    if(title){
      // Makes length ofqueryValeslength = 1
      queryValues.push(`%${title}%`)
      whereFilterClauses.push(`title ILIKE $${queryValues.length}`) // eval to ${1}
    }
    if(minSalary){
      // Makes length ofqueryValeslength = 2
      queryValues.push(minSalary)
      whereFilterClauses.push(`salary >= $${queryValues.length}`) // eval to ${2}
    }

    if(hasEquity == 'true' || hasEquity == 'True'){
      console.log('hasEquity eval true')
      queryValues.push(0)
      whereFilterClauses.push(`equity > $${queryValues.length}`) // eval to ${3}
    }

    if(whereFilterClauses.length >0 ){
      query += " WHERE " + whereFilterClauses.join(" AND ")
    }

    let constructedQuery = query+queryTail

    console.log(constructedQuery, queryValues)
    const jobsRes = await db.query(constructedQuery,queryValues);
    return jobsRes.rows;
  }



  /** Given a job id, return information about job.
   *
   * Returns { id, title, salary, equity, company }
   *   where company is [{ handle, name, num_employees, description, logo_url }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);
        
    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`Job with id ${id} does not exist.`);
    
    // Get the company info, attach to job result
    const companyRes = await db.query(
      `SELECT handle,
              name,
              num_employees,
              description,
              logo_url
        FROM companies
        WHERE handle = $1`,
    [job.company_handle]);    

    const company = companyRes.rows[0]
    
    job.company = company // attach company object to job response

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided fields.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    // send the data and column mapping to helper function. Helper returns columns to set and values to set with
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`Could not find job id: ${id}`);
  }
}


module.exports = Job;
