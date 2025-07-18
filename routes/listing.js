const express = require("express")
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const { listingSchema, reviewSchema } = require("../schema.js")
const Listing = require("../models/listing.js")

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error); //joi givin error here
    } else {
        next();
    }


}

//Index Route

router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })

}))

//create route
router.get('/new', (req, res) => {
    res.render('listings/new.ejs')

})

//new route = Read
router.get("/new", (req, res) => {
    res.render('listings/new.ejs')
})



//show route 
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews")
    if(!listing){
        req.flash("error", "Listing You Requested For Does Not Exists")
        res.redirect("/listings")
    }
    res.render("listings/show.ejs", { listing })
}))




//create route = Read 
router.post("/", validateListing, wrapAsync(async (req, res, next) => {

    const newListing = new Listing(req.body.listing)
    await newListing.save();
    req.flash("success", "New Listing Created")
    res.redirect('/listings')



}))

//edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    if(!listing){
        req.flash("error", "Listing You Requested For Does Not Exists")
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs", { listing })
}))

//update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Enter the valid data for listing")
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
     req.flash("success", "Listing Updated Created")
    res.redirect(`/listings/${id}`);
}))

//delete route
router.delete("/:id", wrapAsync(async (req, res) => {

    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id)
    console.log(deleteListing);
     req.flash("success", "Listing Deleted")
    res.redirect('/listings')

}))

module.exports = router;