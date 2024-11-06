const express = require('express')
const app = express.Router()
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const secretKey = 'inven@173';
const backendPath = path.join(__dirname, '..'); // .. is used to go back to the parent folder 
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: process.env.DB_HOST,       // Aiven MySQL host
    user: process.env.DB_USER,       // Aiven MySQL username
    password: process.env.DB_PASSWORD, // Aiven MySQL password
    database: process.env.DB_NAME ,   // Aiven MySQL database name
    port: process.env.DB_PORT     // Aiven MySQL database name
  });

  connection.connect((err)=>{
    if(err)
      console.log(err)
    else
      console.log("succesfully connected to the database...")
  })
  app.use(express.json({limit: '50mb'}));

const authtoken = (req, res, next)=>{
    let token = req.cookies.authtoken;
    jwt.verify(token,secretKey,(err,decode)=>{
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decode;
        next()
    })
}

app.use(authtoken)

app.post('/icon',(req,res)=>{
     const user = req.user.email
    let ic = user.substring(0, 2).toUpperCase();
    console.log(ic)
    res.json({icon: ic})
})

app.get('/',(req,res)=>{
   
    res.sendFile('frontend/dashboard.html' , { root: backendPath})
})

app.post('/list',(req,res)=>{
    
    connection.query(`select * from store${req.user.uid}`,(err,result)=>{
        if(err)
            console.log(err)
        console.log(req.user)
        res.status(200).json(result)

    })
})


app.post('/search',(req,res)=>{
    
    
    connection.query(`select * from store${req.user.uid} where productname like '%${req.body.find}%' or category like '%${req.body.find}%' or brand like '%${req.body.find}%'`,(err,result)=>{
        if(err)
            console.log(err)
        console.log(result)
        res.status(200).json(result)

    })
})

app.post('/newproduct',(req, res)=>{
    console.log(req.user)
    console.log(req.body)
    const { productName , image, category, quantity, brand, price } =   req.body;
    console.log(image)
    
    const buffer = Buffer.from(image,'base64')
    const imgpath = path.join(__dirname,"..",`/userdata/store${req.user.uid}`)
    const fnm = `image${req.user.uid}_${Date.now().toString()}.jpg`
    const imgp = path.join(imgpath,fnm)

    fs.writeFile(imgp,buffer,(err)=>{
        if(err)
            console.log(err)
    })

    console.log("image saved!!")
    const imgurl = `/userdata/store${req.user.uid}/${fnm}`
    console.log(imgurl)
    connection.query(`insert into store${req.user.uid}(purl,productname,category,quantity,brand,price)values('${imgurl}','${productName}','${category}',${quantity},'${brand}',${price});`,(err,result)=>{
        try {
            if(err){
                console.log(err)
                res.status(500).json({"status":500, message: err.message})
                return;}
            
             res.status(200).json({status: 200, "message": "added"})
        } catch (error) {
            console.log(error)
        }
    })
   
  })

  app.delete('/remove/:id',(req,res)=>{
    const pid = req.params.id;
    
    connection.query(`delete from store${req.user.uid} where productID = ${pid}`,(err,result)=>{
        if(err){
            console.log(err)
            res.status(500).json({status:500, message:"deleted"})
            return;
        }
        res.status(200).json({status:200, message:"deleted"})
    })
  })

  app.put('/update/:id',(req,res)=>{
    const pid = req.params.id;
    console.log(req.body, pid) 
    const image = req.body.image;
    console.log(image)
    
    const buffer = Buffer.from(image,'base64')
    const imgpath = path.join(__dirname,"..",`/userdata/store${req.user.uid}`)
    const fnm = `image${req.user.uid}_${Date.now().toString()}.jpg`
    const imgp = path.join(imgpath,fnm)

    fs.writeFile(imgp,buffer,(err)=>{
        if(err)
            console.log(err)
    })

    console.log("image saved!!")
    const imgurl = `/userdata/store${req.user.uid}/${fnm}`
    console.log(imgurl)
    connection.query(`update store${req.user.uid} set purl ='${imgurl}', productname = '${req.body.productName}', category= '${req.body.category}', quantity= '${req.body.quantity}', brand= '${req.body.brand}', price = '${req.body.price}'where productID= '${pid}';`,(err,result)=>{
        if(err)
            console.log(err)

        res.status(200).json({status:200, message:"updated"})
    })
       
  })

module.exports = app;