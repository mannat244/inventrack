
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

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const store = document.getElementById('store').value
    const data = { email, password, store }
    // console.log(data)

    try {
        e.preventDefault()
        const response = await fetch('/signup', {
            headers: {
                'Content-Type': 'application/json'
            },
            method:"POST",
            body: JSON.stringify({ email:email, password:password, store:store })
        }) 

       const data = await response.json()
    //    console.log(data)

       if (data.status === 200) {
        let mtoken = data.token;
        localStorage.setItem('token',mtoken)
        console.log(data.token)
        showPopup('Signup successful!', () => {
            window.location = '/dashboard';  
        });
            } else {
                let m = data.message
                if(m.includes("Duplicate"))
                    m="You are already registered!"
            showPopup(m)
        }
    
    }
     catch (error) {
        console.log("Error: ", error)
    }

})