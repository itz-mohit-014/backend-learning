import dotenv from 'dotenv'
import dbConnection from "./db/dbConnection.js";
import  app  from "./app.js";

dotenv.config({
    path:'./.env'
})

const port = process.env.PORT || 3000;

// return promise form the DataBaseConnection file...
dbConnection()
.then(()=>{
    app.on('error', (err)=>{
        console.log(`Couldn't connect to DataBase...`)
        throw err;
    })
        
    app.listen(port, ()=>{
        console.log(`Server is Starting at PORT: ${port}`);
    })
})
.catch((error)=>{
    console.log('DataBase Connection Failedd from index.js!!', error)
})

