const express = require('express')
const uuid = require('uuid')
const speakeasy = require('speakeasy')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const PORT = process.env.PORT || 4200
const app = express()

//gettig json db instance
const db = new JsonDB(new Config('JsonDB', true, false, '/'));

app.listen(PORT, () => console.log(`server running on port ${PORT}`))
