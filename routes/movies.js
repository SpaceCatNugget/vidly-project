const auth = require('../middleware/auth');
const { Movie, validate } = require('../models/movie');
const {Genre} = require('../models/genre');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort('name');
    res.send(movies);
  } catch (err) {
    console.error('Got an error getting the movies.', err);
  }
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = new Movie({ title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });
  try {
    await movie.save();
    res.send(movie);
  } catch (err) {
    console.error('Error while posting the movie.', err);
  }
});

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id,
    { 
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    }, { new: true });

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  
    res.send(movie);
  } catch (err) {
    console.error('Error while updating the movie name.', err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  
    res.send(movie);
  } catch (err) {
    console.error('Error while deleting a movie.', err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    res.send(movie);
  } catch (err) {
    console.error(`Error while getting movie by id: ${req.params.id}`, err);
  }
});

module.exports = router;