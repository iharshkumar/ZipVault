const mongoose = require('mongoose');

const uri = "mongodb+srv://srivastavaharsh1108_db_user:Harsh123@cluster0.lvq7mph.mongodb.net/ZipVault?retryWrites=true&w=majority";

mongoose.connect(uri).then(() => {
    console.log("Connected DB name:", mongoose.connection.name);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
