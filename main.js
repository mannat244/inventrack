const express = require('express')
const mysql = require('mysql2')
const path = require('path')
const bcrypt = require('bcrypt')
const fs = require('fs')
const slugify = require('slugify')
const cookieParser = require('cookie-parser')
const dash = require('./routes/dashboard')
const app = express();
const jwt = require('jsonwebtoken')
const port = 3000;
const sk = "inven@173"
app.use(cookieParser());
let connection = mysql.createConnection({
  host: 'dpg-cslnu1rtq21c73em2o50-a',
  user: 'root',
  password: 'i45iY4acxGLnYFCxBf1xdAjm62JoJHNh',
  port:5432,
  database: 'inventrack_db'
})

app.use('/dashboard', dash)

connection.connect((err)=>{
  if(err)
    console.log(err)
  else
    console.log("succesfully connected to the database...")
})


app.use(express.json({limit: '50mb'}));
app.use('/assets',express.static(path.join(__dirname,'/frontend/assets')))
app.use('/userdata',express.static(path.join(__dirname,'/userdata')))


app.get('/', (req,res)=>{
    res.sendFile('frontend/index.html',{root: __dirname})
})

app.post('/login',(req,res)=>{
    let data = req.body;
    let token = req.headers.token;
    const {email, password} = data;
    // console.log(token, email, password)

    connection.query(`select password from users where email = '${email}'`,async (err, result)=>{
      if(err){
        console.log(err)
        res.status(500).json({status: 500, message: err.message})

      }
    if(!result[0]){
      res.status(500).json({status: 500, message: "Unregistered Email, Please Signup!"})
    } try{
       dbpass = result[0].password;  
       if(dbpass){if(await bcrypt.compare(password,dbpass)){
        
      res.cookie('authtoken',token,
        {
          httpOnly : true,
          secure : false,
          maxAge: 24 * 60 * 60 * 1000, 
        }
      )
      res.status(200).send({status: "200", token:token})
      console.log("user logined success!! "+email);
     } else 
      res.status(500).send({status: "500", token:token , message: "invalid password" })}
       
    } catch(err){
      console.log(err)
    }
     
   
    })

    
})

app.post('/signup',async (req,res)=>{
    let data = req.body;
    let { email, password, store } =  data
    let newpass;  let token;  let uid;
  try {
    newpass = await bcrypt.hash(password, 10)
  } catch (err) {
    console.log(err)
  }

  password = newpass;
 
  connection.query(`insert into users (email,password,storename) values ('${email}','${password}','${store}');`, (err) => {
    if (err) {
      console.log(err.message)
      res.status(500).json({message: err.message })
      return;
    }

    console.log("user added succesfully!")

    connection.query(`select userID from users where email = '${email}' and password = '${password}'`, (err, result) => {
        if (err){
          console.log(err)
          res.status(500).json({message: err.message })
          return;

        }
          
          console.log(result)
          uid = result[0]?.userID;
          if(!uid){
            res.status(500).json({message: "uid not defined"})
            return;

          }
          token = jwt.sign({ email, uid, store },sk,{expiresIn: '1d'})
          res.cookie('authtoken',token,
            {
              httpOnly : true,
              secure : false,
              maxAge: 24 * 60 * 60 * 1000, 
            }
          ) 
          console.log(uid, "token ::: ",token)  
          let s = slugify("store"+uid,'_')
          console.log(s)
          try{
          fs.mkdirSync(path.join(__dirname,'/userdata',s))
          } catch(err) { console.log(err) }
          connection.query(`create table ${s}(productID int primary key auto_increment, purl varchar(1600) DEFAULT 'assets/box.png', productname varchar(255) not null, category varchar(255) not null, quantity int not null,brand varchar(255) not null, price int not null);`,(err,result)=>{
            if(err)
              console.log(err)
            else 
              console.log("created a table with name :" ,s)
               res.status(200).json({status: 200, "token": token})
          })
         
      }) 
  })
})

app.get('/script.js', (req,res)=>{
    res.sendFile('frontend/script.js',{root: __dirname})
})
 
app.get('/signup', (req,res)=>{
    res.sendFile('frontend/signup.html',{root: __dirname})
})


app.get('/api/img/',async (req,res)=>{
   
    fetch('https://api.pexels.com/v1/search?query=warehouse&per_page=10', {
        headers: {
          Authorization: '563492ad6f917000010000013e70dd1c82de4b79b11b7ec81ae40772'
        }
      })
        .then(response => response.json())
        .then(data => {
          let index = Math.floor(Math.random()*9)
          const imageUrl = data.photos[index].src.large2x;
          res.send(imageUrl)
        })
        .catch(error => console.error('Error fetching image:', error));
      
    
})



app.listen(port,()=>{
    console.log("listening at http://localhost:3000/ ")
})