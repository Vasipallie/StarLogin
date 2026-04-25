//inits
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; 
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';

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
    res.redirect('/test');
});
app.post('/creater', async (req, res) => {
    const { authID } = req.body;
    if (!authID) {
        return res.status(400).send('Missing authID.');
    }
    const { data, error } = await supabaseClient.from('AuthAPI').select('*').eq('AuthID', authID).single();
    if (error || !data){
        console.error('Error fetching auth details:', error);
        return res.status(500).send('Error fetching authentication details. Please try again later.');
    }
    const provider = data.AuthName;
    const provider_img = data.AuthImg;
    res.render('create_auth', {provider, provider_img, authID, bckimg: 'assets/bcks/' + randoimg()  });
});

app.post('/create-account', async (req, res) =>{
    const {email, password, name, lname, authID} =req.body;
    const nEmail = (email).trim().toLowerCase();
    const nName = (name).trim();
    const nLname = (lname).trim();

    if (!authID) {
        return res.status(400).send('authID is not provided. Please contact your website administrator.');
    }

    if (!nEmail || !password) {
        const {data: dataa, error: errorr} = await supabaseClient.from('AuthAPI').select('*').eq('AuthID', authID).single();
        if (errorr || !dataa) {
            return res.status(500).send('Error fetching auth details. Please try again later.');
        }
        return res.status(400).render('create_auth', {provider: dataa.AuthName, provider_img:dataa.AuthImg,authID,bckimg: 'assets/bcks/' + randoimg(),error: 'Email and password are required.'
    });
    }

    const {data, error} = await supabaseClient.auth.signUp({email: nEmail, password});
    console.log(data);
    if (error){
        console.error('Error signing up:', error);
        const {data: dataa, error: errorr} = await supabaseClient.from('AuthAPI').select('*').eq('AuthID', authID).single();
        if (errorr){
            return res.status(500).send('Error fetching auth details. Please try again later.');
        }
        const provider = dataa.AuthName;
        const provider_img = dataa.AuthImg;
        return res.status(400).render('create_auth', { provider, provider_img, authID, bckimg: 'assets/bcks/' + randoimg(), error: error.message || 'Error creating account. Please try again.' });
    }

    const uuid = data?.user?.id;
    if (uuid) {
        const { error: insertError } = await supabaseClient
            .from('users')
            .upsert({ uid: uuid, email: nEmail, name: nName || null, lname: nLname || null }, { onConflict: 'uid' });
        if (insertError){
            console.error('Error inserting user data:', insertError);
            return res.status(500).send('Error saving user data. Please try again later.');
        }
    }

    return res.redirect(`/login/${encodeURIComponent(authID)}?created=1&email=${encodeURIComponent(nEmail)}`);
} );

app.route('/dashboard').get((req, res) => {
    res.render('dashboardlogin', { bckimg: 'assets/bcks/' + randoimg() });
});
app.post('/dashboard' , async (req, res) =>{
    const { uid, email, fullname, name } = req.body;
    if (!uid) {
        return res.status(400).send('Missing login data. Please try again. Contact your website administrator.');
    }

    const {data, error} = await supabaseClient.from('AuthAPI').select('*').eq('uuid', uid).single();
    if (error){
        res.status(500).send('Error fetching authentication details. Please try again later.');
    }
    else if (!data) {
        res.status(404).send('Authentication details not found.');
    }
    else{
        res.render('dashboard', { 'bckimg': 'assets/bcks/' + randoimg(), 'AuthID': data.AuthID, 'authName': data.AuthName, 'AuthImg': data.AuthImg, 'AuthTos': data.AuthTos, 'AuthBack': data.AuthBack });
    }
});

app.post('/updateDetails', async (req, res)=> {
    const {AuthID, authName, AuthImg, AuthTos, AuthBack} = req.body;
    const {data, error} = await supabaseClient.from('AuthAPI').update({ AuthID, AuthImg, AuthTos, AuthBack}).eq('AuthID', AuthID);
    if (error){
        console.error('Error updating details:', error);
        return res.status(500).send('StarAPI failed to update your details. Please try again later.');
    }
    else{
        return res.render('dashboard', { 'bckimg': 'assets/bcks/' + randoimg(), 'AuthID': AuthID, 'authName': authName, 'AuthImg': AuthImg, 'AuthTos': AuthTos, 'AuthBack': AuthBack, 'success': 'Details updated successfully!' });
    }
})

app.route('/login/:authid').get(async (req, res) => {
    const { authid } = req.params;
    const { created, email } = req.query;
    const { data, error } = await supabaseClient.from('AuthAPI').select('*').eq('AuthID', authid).single();
    if (error || !data){
        res.status(500).send('Error fetching authentication details. Please try again later.');
    }
        else {
            const provider = data.provider || data.AuthName;
            const provider_img = data.AuthImg ;
            
            res.render('login', {provider,provider_img,bckimg: 'assets/bcks/' + randoimg(), authid: authid, email: email});
            }

});

app.post('/login', async (req, res) => {
    const {email, password, provider, providerimg, authid} = req.body;
    const nEmail = (email || '').trim().toLowerCase();
    if (!nEmail || !password) {
        return res.status(400).render('login', {provider,provider_img: providerimg, bckimg: 'assets/bcks/' + randoimg(),error: 'Email and password are required', email: nEmail,authid});
    }

    const {data,error} = await supabaseClient.auth.signInWithPassword({email: nEmail, password});
    if (error) {
        console.error('Error signing in:', error);
    }
        else {
            const uuid = data.user.id
            console.log(uuid);
            const {dataa, errorr} = await supabaseClient.from('users').select('*').eq('uid', uuid).single();
            if (errorr){
                res.status(500).send('Error fetching user data');
            }
                else {
                  const  payload ={
                    loginevent: 'login_success',
                    email: data.user.email,
                    fullname: data.user.name,
                    uid: data.user.id
                }
                    res.render('success', { bckimg: 'assets/bcks/' + randoimg(),provider, provider_img: providerimg, 'txdata':payload });
                }
            }

});

//server start 
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
