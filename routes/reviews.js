
const express=require('express');
const router=express.Router({mergeParams:true});
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const Campground=require('../models/campground')
const {reviewSchema } = require('../schema.js');
const Review=require('../models/review')
const {isLoggedIn,isReviewAuthor,validateReview}=require('../middleware')


router.post('/',isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','successfully created a review')
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:reviewid',isLoggedIn,catchAsync(async(req,res)=>{
    const {id,reviewid}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
    await Review.findByIdAndDelete(reviewid)
    req.flash('success','successfully deleted a review')
    res.redirect(`/campgrounds/${id}`)

}))

module.exports=router;