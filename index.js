import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import express from 'express'

const app = express()
const port = process.env.PORT || 3500

dotenv.config()

const secretKey = process.env.ACCESS_TOKEN_SECRET

const uri = process.env.MONGO_URI

const client = new MongoClient(uri)

app.get('/signin', async(req,res) => 
{
    const { email } = req.query

    await client.connect()

    const database = client.db('prisma')

    const collection = database.collection('Email')

    const users = await collection.find({ email }).toArray()

    if(users.length > 0) {
        const token = jwt.sign({ email: users[0].email }, secretKey)
        res.status(200).json({ token })
    } else {
        res.status(401).json({ message: 'User Not found!' })
    }

    await client.close()
})

app.get('/email', async (req,res) =>
{
    await client.connect()

    const database = client.db('prisma')
    const collection = database.collection('Email')

    const emails = await collection.find({  }).toArray()

    res.status(200).json(emails)

    await client.close()

})

app.get('/tokens', async (req,res) => 
{
    await client.connect()

    const database = client.db('prisma')
    const collection = database.collection('Email')

    const users = await collection.find({}).toArray()

    const tokens = users.map(user => ({

        email: user.email,
        token: jwt.sign({ email: user.email },secretKey)

    }))

    res.status(200).json(tokens)

    await client.close()
})

app.listen(port, () => 
{
    console.log(`Server Running on http://localhost:${port}`)
})