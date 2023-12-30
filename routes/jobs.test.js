"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// === POST jobs  ========================

describe("POST /jobs", () => {

    test("Unauth if not admin", async () => {
        const resp = await request(app)
        .post("/jobs")
        .send({
            title: "j1 Test Chief Meme Officer",
            salary: 999999,
            equity: 0.25,
            companyHandle: "c1"
        })
        .set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(401);
    })
    
    test("can create a job", async () => {
        const resp = await request(app)
        .post("/jobs")
        .send({
            title: "j2 Test Chief Meme Officer",
            salary: 999999,
            equity: 0.25,
            companyHandle: "c1"
        })
        .set("authorization", `Bearer ${u2Token}`);
        
        expect(resp.statusCode).toEqual(201);
    })

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                salary: 999999,
                equity: 0.25
            })
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(400);
      });

      test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: 12345,
                salary: "this is not an integer",
                equity: 0.1,
                companyHandle: "c3"
            })
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(400);
      });
})

/************************************** GET /jobs */

describe("GET /jobs", () => {
    test("Any user can get all jobs from /", async () => {
        const resp = await request(app).get('/jobs')
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            jobs:[
            {
                id:expect.any(Number),
                title: 'job1',
                salary:100000,
                equity:"0.01",
                company_handle:'c1'
            },
            {
                id:expect.any(Number),
                title: 'job2',
                salary:1000000,
                equity:"0.25",
                company_handle:'c2'
            },
            {
                id:expect.any(Number),
                title:"specific job title",
                salary:1000000,
                equity:"0",
                company_handle:"c3"
            }]
        })
    })

    test("Filter to jobs with equity /", async () => {
        const resp = await request(app)
        .get('/jobs?hasEquity=true')
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            jobs:[
            {
                id:expect.any(Number),
                title: 'job1',
                salary:100000,
                equity:"0.01",
                company_handle:'c1'
            },
            {
                id:expect.any(Number),
                title: 'job2',
                salary:1000000,
                equity:"0.25",
                company_handle:'c2'
            }]
        })
    })

    test("Filter to jobs with min salary > 500000 /", async () => {
        const resp = await request(app)
        .get('/jobs?minSalary=500000')
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            jobs:[
            {
                id:expect.any(Number),
                title: 'job2',
                salary:1000000,
                equity:"0.25",
                company_handle:'c2'
            },
            {
                id:expect.any(Number),
                title: 'specific job title',
                salary:1000000,
                equity:"0",
                company_handle:'c3'
            }
        ]
        })
    })

    test("Filter to jobs with title including 'specific'", async () => {
        const resp = await request(app)
        .get('/jobs?title=specific')
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            jobs:[
            {
                id:expect.any(Number),
                title: 'specific job title',
                salary:1000000,
                equity:"0",
                company_handle:'c3'
            }
        ]
        })
    })

})