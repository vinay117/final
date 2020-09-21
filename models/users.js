const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userInfo = new Schema({
   username:{
       type:'string',
       required:true
   },
   password:{
       type:'string',
       required:true
   }
})
var Users = mongoose.model('Users',userInfo)
module.exports = Users