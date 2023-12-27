"use strict"

const {sqlForPartialUpdate} = require('./sql')
const { BadRequestError } = require('../expressError');
const request = require("supertest")

const { 
commonBeforeAll,
commonBeforeEach,
commonAfterEach,
commonAfterAll } = require('../models/_testCommon')

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);



let jsToSql
let dataToUpdate
// sqlForPartialUpdate accepts (dataToUpdate) and (jsToSql)
// returns setCols (string) and values (array) 

describe("SQL for partial update, sqlForPartialUpdate", () => {
    jsToSql = {
        firstName: "first_name",
        lastName: "last_name"
    }
    
    test("works: update firstname only", ()=> {
        dataToUpdate = {
            firstName: "Mike"
        }

        const {setCols, values} = sqlForPartialUpdate(dataToUpdate,jsToSql)
        expect(setCols).toEqual(
            `"first_name"=$1`
        )
        expect(values).toEqual(
            ["Mike"]
        )
    })
    test("works: update last name and email", ()=> {
        dataToUpdate={
            lastName:"Kushman",
            email:"mike@email.com"
        }
        const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql)
        expect(setCols).toEqual(
            `"last_name"=$1, "email"=$2`
        )
        expect(values).toEqual(["Kushman","mike@email.com"])
    })
    test("BadRequestError if no data provided", () => {
        dataToUpdate = {}
    try{
        sqlForPartialUpdate(dataToUpdate)
    } catch(err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
    })
})