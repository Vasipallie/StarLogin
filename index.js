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

function randoimg(){
    const path = 'views/images';
    const images =['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg','11.jpg']
    const img = images[Math.floor(Math.random() * images.length)]
    return img;
}
app.route('/').get((req, res) => {
    res.render('test');
});

app.route('/dashboard').get((req, res) => {
    res.render('dashboardlogin', { bckimg: 'assets/bcks/' + randoimg() });
});
app.post('/dashboard' , async (req, res) =>{
    if (error) {
        console.error('Error signing in:', error);
        res.status(401).send('Invalid email or password');
    } else {
        const uuid = data.user.id
        console.log(uuid);
        const {dataa, errorr} = await supabaseClient.from('AuthAPI').select('*').eq('AuthID', uuid).single();
        if (errorr){
            res.status(500).send('Error fetching user data');
        } else {
            res.render('dashboard', { 'bckimg': 'assets/bcks/' + randoimg(), 'AuthID': dataa.AuthID, 'authName': dataa.authName, 'AuthImg': dataa.AuthImg, 'AuthTos': dataa.AuthTos, 'AuthBack': dataa.AuthBack });
        }
    }
});

app.post('/updateDetails', async (req, res)=> {
    const {AuthID, authName, AuthImg, AuthTos, AuthBack} = req.body;
    const {data, error} = await supabaseClient.from('AuthAPI').update({ authName, AuthImg, AuthTos, AuthBack}).eq('AuthID', AuthID);
    if (error){
        res.status(5000).send('StarAPI failed to update your details. Please try again later.');
    }
    else{
        res.status(200).send('StarAPI successfully updated your details!');
        res.render('dashboard', { 'bckimg': 'assets/bcks/' + randoimg(), 'AuthID': AuthID, 'authName': authName, 'AuthImg': AuthImg, 'AuthTos': AuthTos, 'AuthBack': AuthBack });
    }
})

app.route('/login/:authid').get(async (req, res) => {
    const { authid } = req.params;
    console.log(authid);
    const { data, error } = await supabaseClient.from('AuthAPI').select('*').eq('AuthID', authid).single();
    console.log(data);
    if (error || !data){
        res.status(500).send('Error fetching authentication details. Please try again later.');
    }
        else {
            console.log(data);
            const provider = data.provider || data.AuthName || 'Unknown Provider';
            const provider_img = data.AuthImg || 'https://via.placeholder.com/150';
            
            res.render('login', { provider, provider_img, bckimg: 'assets/bcks/' + randoimg() });
        }

});

app.post('/login', async (req, res) => {
    const {email, password, provider, providerimg} = req.body;
    const {data,error} = await supabaseClient.auth.signInWithPassword({email, password});
    if (error) {
        console.error('Error signing in:', error);
        return res.status(401).render('login', {
            provider: provider || 'Unknown Provider',
            provider_img: providerimg || 'https://via.placeholder.com/150',
            bckimg: 'assets/bcks/' + randoimg(),
            error: 'Invalid email or password',
            email
        });
    }
        else {
            const uuid = data.user.id
            console.log(uuid);
            const {dataa, errorr} = await supabaseClient.from('users').select('*').eq('uid', uuid).single();
            if (errorr){
                res.status(500).send('Error fetching user data');
            }
                else {
                    
                }
            }

});
//JUST SERVER STUFF
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
