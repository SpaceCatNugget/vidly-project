const moment = require('moment');
const {Rental} = require('../../models/rental');
const {Movie} = require('../../models/movie');
const {User} = require('../../models/user');
const mongoose = require('mongoose');
const request = require('supertest');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let movie;
    let token;
    
    beforeEach(async () => { 
        server = require('../../index');
        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            },
        });
        await rental.save();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock: 10
        });
        await movie.save();
    });
    afterEach(async () => { 
        await server.close();
        await Rental.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    const exec = async () => {
        return res = await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };

    it('should return 401 if client is not logged in', async () => {
        const res = await request(server).post('/api/returns').send({ customerId, movieId})

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = null;
        const res = await exec()

        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
        movieId = null;
        const res = await exec()

        expect(res.status).toBe(400);
    });

    it('should return a 404 if no rental found for the customer/movie', async() => {
        await Rental.deleteMany({});
        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return a 400 if rental already processed', async() => {
        rental.dateReturned = new Date();
        await rental.save();
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if valid request', async() => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the returnDate if input is valid', async() => {
        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set the rental fee if input is valid', async() => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should increase the movie stock if input is valid', async() => {
        await exec();

        const movieInDb = await Movie.findById(movie._id);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if input is valid', async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee',
                 'customer', 'movie']));
    });
});