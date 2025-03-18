const express=require('express');
const router=express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const Campground=require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { campgroundSchema,reviewSchema } = require('../schema.js');
// const isLoggedIn=require('../midlleware')
const { isLoggedIn,isAuthor,validateCampground } = require('../middleware');
// const campground=require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { cloudinary } = require("../cloudinary");
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))
 router.post('/',isLoggedIn,upload.array('image'),validateCampground,catchAsync(async(req,res)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author=req.user._id;
    await campground.save()
    req.flash('success', 'Successfully made a new campground!');
    return res.redirect(`/campgrounds/${campground._id}`)
}))
  
router.get('/new',isLoggedIn,catchAsync((req, res) => {
    res.render('campgrounds/new');
}))
router.get('/:id',catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})
}))
router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs=req.files.map(f => ({ url: f.path, filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save()
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}})
    }
    req.flash('success','successfully updated a campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','successfully deleted a campground')
    res.redirect('/campgrounds');
}))

module.exports=router;