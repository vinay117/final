const mongoose = require('mongoose')
const shortId  = require('shortid')
const  Schema = mongoose.Schema
const shortUrlSchema = new Schema({
    full:{
        type : 'string',
        required : true
    },
    username:{
        type:'string',
        required:true,
        text:true
    },
    short:{
        type : 'string',
        required : true,
        default : shortId.generate
    },
    clicks:{
        type : 'number',
        required : true,
        default:0

  }
})
var shortUrl = mongoose.model('shorturl',shortUrlSchema)
module.exports = shortUrl