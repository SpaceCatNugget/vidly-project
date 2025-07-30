const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
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

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const { genreId, genreName, title, numberInStock, dailyRentalRate } = req.body;

  let genre;

  try {
    if (genreId) {
      genre = await Genre.findById(genreId);
      if (!genre) return res.status(400).send('Invalid genreId.');
    } else if (genreName) {
      genre = await Genre.findOne({ name: genreName });
      if (!genre) {
        genre = new Genre({ name: genreName });
        await genre.save();
      }
    } else {
      return res.status(400).send('Either genreId or genreName is required.');
    }

    const movie = new Movie({
      title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numberInStock,
      dailyRentalRate,
    });

    await movie.save();
    res.status(201).send(movie);
  } catch (err) {
    console.error('Error while posting the movie.', err);
    res.status(500).send('Internal server error.');
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { genreId, genreName, title, numberInStock, dailyRentalRate } = req.body;

  let genre;

  try {
    if (genreId) {
      genre = await Genre.findById(genreId);
      if (!genre) return res.status(400).send('Invalid genreId.');
    } else if (genreName) {
      genre = await Genre.findOne({ name: genreName });
      if (!genre) {
        genre = new Genre({ name: genreName });
        await genre.save();
      }
    } else {
      return res.status(400).send('Either genreId or genreName is required.');
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock,
        dailyRentalRate,
      },
      { new: true }
    );

    if (!movie)
      return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
  } catch (err) {
    console.error('Error while updating the movie.', err);
    res.status(500).send('Internal server error.');
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie)
      return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
  } catch (err) {
    console.error('Error while deleting the movie.', err);
    res.status(500).send('Internal server error.');
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