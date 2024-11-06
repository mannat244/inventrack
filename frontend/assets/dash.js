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

const userd = document.getElementsByClassName("user")[0];

let user = async () => {
   const ic = await fetch(`dashboard/icon`, {
    method:"POST",
    headers : {
        'Content-Type': 'application/json'
   },
})  
    const r = await ic.json();
    userd.innerHTML = r.icon;
}

user()


userd.addEventListener("click",()=>{
    
})



function listeners(){
    const optionbtn = document.getElementsByClassName("options")
    const optionmenu = document.getElementsByClassName("more");
    const editform = document.getElementsByClassName("editform");
    const editbtn = document.getElementsByClassName("editbtn")
    const delbtn = document.getElementsByClassName("delbtn")
    Array.from(optionmenu).forEach(m => m.style.display = "none" )
    Array.from(editform).forEach(m => m.style.display = "none" )
    
    Array.from(delbtn).forEach((delbtn, index)=>{
    delbtn.addEventListener("click",async (e) =>{
        const row = e.target.parentNode.parentNode.parentNode
        const productID = row.querySelector("td").textContent
        
        const resp = await fetch(`dashboard/remove/${productID}`, {
            method:"DELETE",
            headers : {
                'Content-Type': 'application/json'
           },
        })

        const data = await resp.json()
        if(data.status == 200){
            showPopup("Product Successfully Deleted!")
            dataload('dashboard/list')
        } else {
            showPopup(data.message)
        }
    })
    })
    

    Array.from(optionbtn).forEach((obtns, ind)=>{
        const menu = optionmenu[ind];
        
        obtns.addEventListener("click",(e)=>{
          
            e.stopPropagation(); 
            if(menu.style.display === "block"){
                menu.style.display = "none"
           } else {
                Array.from(optionmenu).forEach(m => m.style.display = "none");
                menu.style.display = "block" 
                document.body.addEventListener("click", (e)=> hide(e,menu))

            }    
        })
    })
    
    Array.from(editbtn).forEach((btn,index) => {
       
        const mform = editform[index]
    
        btn.addEventListener("click",(e)=>{ 
            e.stopPropagation(); 
            if(mform.style.display === "block"){
                mform.style.display = "none"
           } else {
                Array.from(editform).forEach(m => m.style.display = "none");
                mform.style.display = "block" 
                const row = e.target.parentNode.parentNode.parentNode
                console.log(row)
            const productID = row.querySelector("td:nth-child(1)").textContent;
            const productName = row.querySelector("td:nth-child(3)").textContent;
            const category = row.querySelector("td:nth-child(4)").textContent;
            const quantity = row.querySelector("td:nth-child(5)").textContent;
            const brand = row.querySelector("td:nth-child(6)").textContent;
            const price = row.querySelector("td:nth-child(7)").textContent.replace('₹',"");
            const eform = mform.childNodes[1].childNodes
            console.log(eform)
            eform[3].value = productName;
            eform[5].value = category;
            eform[7].value = quantity;
            eform[9].value = brand;
            eform[11].value = price;
            console.log(productName,category,quantity,brand,price)
            const submit = eform[13]
            submit.addEventListener("click", async()=>{
                const productName = eform[3].value;
                const category = eform[5].value;
                const quantity = eform[7].value;
                const brand = eform[9].value;
                const price = eform[11].value;
                const imageip = eform[1]
                
                data_arr = imageip.files[0];
                if(!data_arr){
                    showPopup("Image Not Attached!!")
                }
                console.log(data_arr)
                let reader = new FileReader()
                let eimg;
                reader.onloadend = async ()=>{
                console.log("converted = ",reader.result.split(",")[1])
                eimg = await reader.result.split(",")[1];
                let image = eimg;
                console.log(productName,category,quantity,brand,price)

                const resp = await fetch(`dashboard/update/${productID}`, {
                    method:"PUT",
                    headers : {
                        'Content-Type': 'application/json'
                   },
                   body: JSON.stringify({image: image,productName:productName, category:category, quantity:quantity, brand:brand, price:price})
                })
        
                const data = await resp.json()
                if(data.status == 200){
                    showPopup("Product Successfully Updated!")
                    dataload('dashboard/list')
                } else {
                    showPopup(data.message)
                }
            }

                reader.readAsDataURL(data_arr)
              
                })
                document.body.addEventListener("click", (e)=> hide(e,mform))
        
            } 
        })
    })
     
    }
    

async function dataload(elem) {
  const resp = await fetch(elem,{
    method:"POST",
    headers : {
         'Content-Type': 'application/json'
    },
}) 
const data = await resp.json();
const table = document.getElementsByTagName("TABLE")[0]
table.innerHTML = ` <tr>
        <th>Product ID</th>
        <th>Product Image</th>
        <th>Product Name</th>
        <th>Category</th>
        <th>Quantity</th>
        <th>Brand</th>
        <th>Price</th>
        <th></th>
    </tr>`;
data.forEach((item, index)=>{
    const row = document.createElement("TR");
    row.innerHTML = `<td>${item.productID}</td>
        <td><img src="${item.purl}" /></td>
        <td>${item.productname}</td>
        <td>${item.category}</td>
        <td>${item.quantity}</td>
        <td>${item.brand}</td>
        <td>₹${item.price}</td>
        <td><button id="options" class="options"><i class="fa-solid fa-ellipsis"></i></button> 
            <div class="more">
            <button class="editbtn"><i class="fa-solid fa-pen-to-square"></i> &nbsp; Edit</button>
            <button class="delbtn"><i class="fa-solid fa-trash"></i> &nbsp; Delete</button>
            </div>
            <div class="editform">
                <form>
                    <input id="image" type="file" />
                    <input id="pname" type="text" placeholder="Product Name" required/>
                    <input id="category" type="text" placeholder="Category Name" required/>
                    <input id="qty" type="number" placeholder="Quantity" required />
                    <input id="brand" type="text" placeholder="Brand Name" required/>
                    <input id="price" type="number" placeholder="Price" required/>
                    <button type="button">Save Product</button>
                </form>
            </div>
        </td>
    </tr>`
    table.append(row)
    })
    listeners();
}

 dataload('dashboard/list');


const addprd = document.getElementById("addbtn")
const addform = document.getElementsByClassName("addform")[0]
addform.style.display = "none"

addprd.addEventListener("click",(e)=>{
    if(addform.style.display === "block"){
        addform.style.display = "none"
   } else {
        addform.style.display = "block" 
        }    
})

const addf = document.getElementById("addf")
console.log(addf)
addf[6].addEventListener("click", async (event) => {
    event.preventDefault();
       addform.style.display = "none"

    const image = addf[0].files[0]; 
    data_arr = addf[0].files;
  
    console.log(image)
    let img;
    let reader = new FileReader()
    reader.onloadend = async ()=>{
    console.log("converted = ",reader.result.split(",")[1])
    img = await reader.result.split(",")[1];
    const productName = addf[1].value; 
    const category = addf[2].value; 
    const quantity = addf[3].value; 
    const brand = addf[4].value; 
    const price = addf[5].value; 

    console.log("Image:", img);
    console.log("Product Name:", productName);
    console.log("Category:", category);
    console.log("Quantity:", quantity);
    console.log("Brand:", brand);
    console.log("Price:", price);

    const resp = await fetch('dashboard/newproduct',{
        method:"POST",
        headers : {
             'Content-Type': 'application/json'
        },
        body: JSON.stringify({productName: productName, image: img, category:category, quantity:quantity,brand:brand,price:price })
    })

    data = await resp.json();
    console.log(data)
 
    if(data.status == 200){
        showPopup("Product Added Succesfully!")
        dataload('dashboard/list');
     } else
        showPopup(data.message)

    }

    try {
        reader.readAsDataURL(image)
    } catch (error) { 
        showPopup("Adding Failed! Missing Image!")
        throw(error)
       
    }

})

function hide(e,m){
    if(!m.contains(e.target)){
        m.style.display = "none";
        document.body.removeEventListener("click",hide)
    }
}

const search = document.getElementById('search')
const serachbtn = document.getElementById('searchbtn')

search.addEventListener("change",()=>{
    if(search.value == "" || null){
        dataload("dashboard/list")
    }
})

serachbtn.addEventListener("click",async ()=>{
    if(search.value != "" || null){

        const resp = await fetch('dashboard/search',{
            method:"POST",
            headers : {
                 'Content-Type': 'application/json'
            },
            body: JSON.stringify({find: search.value})
        })
    
        data = await resp.json();
        console.log(data)

        const table = document.getElementsByTagName("TABLE")[0]
        table.innerHTML = ` <tr>
                <th>Product ID</th>
                <th>Product Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Brand</th>
                <th>Price</th>
                <th></th>
            </tr>`;
        data.forEach((item, index)=>{
            const row = document.createElement("TR");
            row.innerHTML = `<td>${item.productID}</td>
                <td><img src="${item.purl}" /></td>
                <td>${item.productname}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.brand}</td>
                <td>₹${item.price}</td>
                <td><button id="options" class="options"><i class="fa-solid fa-ellipsis"></i></button> 
                    <div class="more">
                    <button class="editbtn"><i class="fa-solid fa-pen-to-square"></i> &nbsp; Edit</button>
                    <button class="delbtn"><i class="fa-solid fa-trash"></i> &nbsp; Delete</button>
                    </div>
                    <div class="editform">
                        <form>
                            <input id="image" type="file" />
                            <input id="pname" type="text" placeholder="Product Name" required/>
                            <input id="category" type="text" placeholder="Category Name" required/>
                            <input id="qty" type="number" placeholder="Quantity" required />
                            <input id="brand" type="text" placeholder="Brand Name" required/>
                            <input id="price" type="number" placeholder="Price" required/>
                            <button type="submit">Save Product</button>
                        </form>
                    </div>
                </td>
            </tr>`
            table.append(row)
            })
            listeners();
        
        if(data.status == 200){
           
        }
    
    }
})

search.addEventListener("keydown",async (e)=>{
    if((search.value != "" || null) && e.key === "Enter"){

        const resp = await fetch('dashboard/search',{
            method:"POST",
            headers : {
                 'Content-Type': 'application/json'
            },
            body: JSON.stringify({find: search.value})
        })
    
        data = await resp.json();
        console.log(data)

        const table = document.getElementsByTagName("TABLE")[0]
        table.innerHTML = ` <tr>
                <th>Product ID</th>
                <th>Product Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Brand</th>
                <th>Price</th>
                <th></th>
            </tr>`;
        data.forEach((item, index)=>{
            const row = document.createElement("TR");
            row.innerHTML = `<td>${item.productID}</td>
                <td><img src="${item.purl}" /></td>
                <td>${item.productname}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.brand}</td>
                <td>₹${item.price}</td>
                <td><button id="options" class="options"><i class="fa-solid fa-ellipsis"></i></button> 
                    <div class="more">
                    <button class="editbtn"><i class="fa-solid fa-pen-to-square"></i> &nbsp; Edit</button>
                    <button class="delbtn"><i class="fa-solid fa-trash"></i> &nbsp; Delete</button>
                    </div>
                    <div class="editform">
                        <form>
                            <input id="image" type="file" />
                            <input id="pname" type="text" placeholder="Product Name" required/>
                            <input id="category" type="text" placeholder="Category Name" required/>
                            <input id="qty" type="number" placeholder="Quantity" required />
                            <input id="brand" type="text" placeholder="Brand Name" required/>
                            <input id="price" type="number" placeholder="Price" required/>
                            <button type="submit">Save Product</button>
                        </form>
                    </div>
                </td>
            </tr>`
            table.append(row)
            })
            listeners();
        
        if(data.status == 200){
           
        }
    
    }
})
