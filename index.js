//inits
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; 
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// helps get a very ncie background for the login page, from a select set that i chose :)
function randoimg(){
    const path = 'views/images';
    const images =['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg','11.jpg','12.jpg']
    // get a random image from this array/folder
    const img = images[Math.floor(Math.random() * images.length)]
    return img;
}

app.route('/').get((req, res) => {
    const provider = req.query.provider || 'MasterCard';
    const bckimg = 'assets/bcks/' + randoimg();
    const provider_img = 'https://vectorseek.com/wp-content/uploads/2021/02/vectorseek.com-Mastercard-Logo-Vector.png';
    res.render('login', { provider, provider_img, bckimg });
});


//JUST SERVER STUFF
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
