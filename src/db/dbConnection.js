import mongoose from "mongoose";
const dbConnection = async function (){
    try { 
        const dataConnect = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`) ;
        
        // console.log(dataConnect);
        console.log("Database is connected at the host:",dataConnect.connection.host)
    } catch (error) {
        console.log('DataBase Conneciton Failed form connection file!!', error)
    }
}

export default dbConnection;