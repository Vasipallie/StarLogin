![](assets/20260425_183435_starlogin.png)

The StarLogin API is a Open-Source authentication system that allows developers to focus more on their application rather than spending time setting up and managing their own authentication systems. StarLogin handles the login, user management, and the authentication flow while you can focus more on your application.

## How does StarLogin work>?

When you click on "login with StarKloud", your app opens up a popup window on your user's browser with your API Key as a url parameter. StarKloud API systems pulls your app's display name, app icon, and relevant information that will be used during login. This information is then displayed on the login screen allowing users to login via StarKloud.

Once login is processed by StarKloud API Systems; the user's Name, and email is passed on to the parent window (the browser tab that launched the login) via a message.

Example of how event listening has been implemented on the dashboard login:

Parent Window recieves the following message:

> {
> email : "johndoe@doe.com"
> lname : "Doe"
> loginevent : "login_success"
> name : "John Jackson"
> uid : "USER UUID"
> }

You can add an event listener on your app (parent) to capture this information

```
window.addEventListener('message', function(event){
            if(event.origin !== window.location.origin) return; 
                if(event.data.loginevent === 'login_success'){
                // ADD YOUR LOGIC HERE (THIS CAN BE A POST REQ TO YOUR MAIN SERVER)
                }
  
        })

```

# How to Implement

Implementing StarLogin is quite easy. Firstly get an API Key by logging into [StarLogin Dashboard](https://starloginapi.vercel.app/dashboard) and filling out info about your api. Copy the key for later use

1. Add the button CSS
   To add the button css add this into your website header tag (this is the css for the login button)
   ` <link rel="stylesheet" href="https://starloginapi.vercel.app/sloginbtn.css>`
2. Add the button
   This is the default button that has the class sl_login_button which coresponds to the css in the stylesheet
   `<button id="sl_login_button" class="sl_login_btn"><img src="/assets/skb.png" alt="StarKloud Logo" width="30" height="20"> Login with StarKloud</button>`
3. Add an event listener to open a new window with the login
   Replace the YOUR_API_KEY_HERE with your **actual** API key from the dashboard
   ```
    document.getElementById('sl_login_button').addEventListener('click', function(){
           window.open('/login/YOUR_API_KEY_HERE', 'starlogin_auth_popup', 'width=500,height=700');
       })
   ```
4. You can add an event listener on your app (parent) to capture this information

```
window.addEventListener('message', function(event){
            if(event.origin !== window.location.origin) return; 
                if(event.data.loginevent === 'login_success'){
                // ADD YOUR LOGIC HERE (THIS CAN BE A POST REQ TO YOUR MAIN SERVER)
                }
  
        })

```
