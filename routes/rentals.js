const {Rental, validate} = require('../models/rental'); 
const {Movie} = require('../models/movie'); 
const {Customer} = require('../models/customer'); 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rentals = await Rental.find().sort('-dateOut');
        res.send(rentals);
    } catch (err) {
        console.error('Error while getting the rentals.', err);
    }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer.');
  
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie.');
  
    if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');
  
    let rental = new Rental({ 
      customer: {
        _id: customer._id,
        name: customer.name, 
        phone: customer.phone
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate
      }
    });

    await rental.save();

    movie.numberInStock--;
    await movie.save();

    res.send(rental);
  } catch (err) {
    console.error("error while adding new rental.", err);
    res.status(500).send('Internal server error.');
  }
});

router.get('/:id', async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
      
        if (!rental) return res.status(404).send('The rental with the given ID was not found.');
      
        res.send(rental);
    } catch (err) {
        console.error(`Error while getting rental with id ${req.params.id}.`, err);
        return res.status(500).send('Error.');
    }
});

module.exports = router; 