const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
const Campground=require('../models/campground')
const { places, descriptors } = require('./seedHelpers');
const cities=require('./cities')
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected")
})
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:"64e446f1c0819255e8b04b33",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry:{
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dvp0qucoq/image/upload/v1692782572/YelpCamp/bw7iku25cujtucrkhm2u.webp',
                     filename: 'YelpCamp/bw7iku25cujtucrkhm2u'
                },
                {
                    url: 'https://res.cloudinary.com/dvp0qucoq/image/upload/v1692782800/YelpCamp/e8lghga1prxcqqxjlgmi.jpg',
                    filename: 'YelpCamp/e8lghga1prxcqqxjlgmi'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})