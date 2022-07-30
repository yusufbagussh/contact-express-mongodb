const mongoose = require("mongoose");

//Set up connect mongodb dengan mongoose
mongoose.connect("mongodb://127.0.0.1:27017/contact", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//tes tambah data
// const contact1 = new Contact({
//   nama: "Dhimas Risang",
//   nohp: "089670198915",
//   email: "risang@gmail.",
// });

//simpan ke dalam collection
// contact1.save().then((contact) => console.log(contact));
