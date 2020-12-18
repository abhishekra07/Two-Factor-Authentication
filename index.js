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

app.post('/register', (req, res) => {
  try {
    const { username,password } = req.body
    const id = uuid.v4()
    const temp_secret = speakeasy.generateSecret()
    db.push(`/users/${id}`, { id, username, password, temp_secret: temp_secret.base32, is_verified: false }, true)
    res.status(200).json({ message: 'User registered successfully!', id, secret: temp_secret.base32 })
  } catch (e) {
    res.status(500).json({ message: 'Error Occured while registering!' })
  }
})


app.post('/verify', (req, res) => {
  try {
    const { id,token } = req.body
    const user = db.getData(`/users/${id}`)
    const verified = speakeasy.totp.verify({ secret: user.temp_secret ,
                                         encoding: 'base32',
                                         token });
    if(verified) {
      db.push(`/users/${id}`, { id, username: user.username, password:user.password, secret: user.temp_secret, is_verified: true }, true)
      res.status(200).json( { message: 'verified successfully!' } )
    } else{
      res.status(400).json( { message: 'Invalid token passed' } )
    }
  } catch (e) {
    console.log('error ',e);
    res.status(400).json( { message: 'user not found' } )
  }
})

app.post('/validate', (req, res) => {
  try {
    const { id,username,password,token } = req.body
    try {
      const user = db.getData(`/users/${id}`)
      if(user.username === username && user.password === password){
        if(user.is_verified){
          const verified = speakeasy.totp.verify({ secret: user.secret ,
                                               encoding: 'base32',
                                               token });
          if(verified){
            res.status(200).json( { message: 'validate details' } )
          } else{
            res.status(400).json({ message: 'invalid token passed' })
          }
        }else{
          res.status(400).json({ message: 'account is not verified' })
        }
      } else{
        res.status(400).json({ message: 'invalid usernme/password' })
      }
    } catch (e) {
      res.status(404).json({ message: 'user not found' })
    }
  } catch (e) {
      res.status(500).json( { message: 'Server Error!' } )
  }
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))
