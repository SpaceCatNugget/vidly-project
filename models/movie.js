const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const { genreSchema } = require('./genre');

const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: { 
        type: String,
        required: true,
        trim: true, 
        minlength: 2,
        maxlength: 50
     },
    genre: {
      type: genreSchema,
      required: true
    },
    numberInStock: {
        type: Number,
        min: 0,
        max: 255,
        required: true
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    }
}));

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(50).required(),
    genreId: Joi.objectId(),
    genreName: Joi.string().min(3).max(50),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).required()
  }).or('genreId', 'genreName');

  return schema.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;