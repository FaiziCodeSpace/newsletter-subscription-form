import express from 'express';
import url from 'url';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';



// CONFIG 
dotenv.config();
const app = express();
const PORT = process.env.PORT;

// CONFIGURE EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

// Location
const __fileName = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
 
// Body MiddleWare
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

// JSON DATA 
const dataPath = path.join(__dirname, 'data', 'subscriber.json');

// LOAD DATA 
function loadData(){
    if(fs.existsSync(dataPath)){
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
    }
    return [];
}

// SAVE DATA
function saveData(data){
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// MAIN PAGE  
app.get('/index', (req, res)=>{
    res.render('subscribe');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS 
    }
});

// SUBSCRIBE
app.post('/subscribe', (req, res)=>{
    const { email } = req.body;
    const subscribers = loadData();
    if(subscribers.includes(email)){
        return res.render(`error.ejs`)
    }
    subscribers.push(email);
    saveData(subscribers);
    
    // Send Confirmation Email
    const mailOptions = {
        from: `"News letter" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Subscription Successful!',
        text: 'Thank you for subscribing to our news letter.'
    };
    // Receving afterMaths
    transporter.sendMail(mailOptions, (err, info)=>{
        if(err) return console.log('An Error has occured:', err);
        console.log('email send:', info.response);
        res.render('success');
    })

});


app.listen(PORT, ()=>{
    console.log(`http://localhost:${PORT}/index`);
})