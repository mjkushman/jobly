"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for Applications. */


// Allows browsing of applications created by users

class Application {
    static async findAll(){
        const result = await db.query(`SELECT username, job_id FROM applications`);
        return result.rows
    }
}

module.exports = Application;