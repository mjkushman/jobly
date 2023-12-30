"use strict";

/** Routes for applications. */

const jsonschema = require("jsonschema");
const express = require("express");


const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Application = require("../models/application.js");

// const companyNewSchema = require("../schemas/companyNew.json");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

router.get("/", async (req ,res, next) => {
    try {
        const applications = await Application.findAll()
        // console.log(applications)
        return res.json(applications)        
    } catch (err) {
        return next(err)
    }
})

module.exports = router;