


function showPopup(message , callback = null) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        if (typeof callback === 'function') {
            callback();
        }
        popup.remove();
    }, 3500);
}



const form = document.getElementsByTagName("FORM")[0];

form.addEventListener("submit", async (e)=>{
    e.preventDefault()
 
    const token = localStorage.getItem('token');
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const data = { email, password }
    // console.log(token)
    // console.log(data)

    if(token == ("" || null)) 
        showPopup("Invalid User Token")

    try {
        e.preventDefault()
        const response = await fetch('/login', {
            headers: {
                'token': token,
                'Content-Type': 'application/json'
            },
            method:"POST",
            body: JSON.stringify({ email:email, password:password})
        }) 

       const data = await response.json()
    //    console.log(data)

       if (data.status == 200) {
        showPopup('Login successful!', () => {
                  window.location ='/dashboard'
        });
            } else if(data.status == 500){
                showPopup(data.message)
            }
    
    }
     catch (error) {
        console.log("Error: ", error)
    }

})