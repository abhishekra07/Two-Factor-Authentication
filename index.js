const express = require('express')
const uuid = require('uuid')
const speakeasy = require('speakeasy')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const PORT = process.env.PORT || 4200
const app = express()

//gettig json db instance
const db = new JsonDB(new Config('JsonDB', true, false, '/'));

//adding middleware
app.use(express.json())

app.get('/register', (req, res) => {
  try {
    const { username,password } = req.body
    const id = uuid.v4()
    const temp_secret = speakeasy.generateSecret()
    db.push(`/users/${id}`, { id, username, password, temp_secret, is_verified: false }, true)
    res.status(200).json({ message: 'User registered successfully!', id })
  } catch (e) {
    res.status(500).json({ message: 'Error Occured while registering!' })
  }
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))
