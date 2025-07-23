const { Customer, validate} = require('../models/customer');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort('name');
    res.send(customers);
  } catch (err) {
    console.error('Got an error getting the customers.', err);
  }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let customer = new Customer({ 
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold 
    });
    customer = await customer.save();
    res.send(customer);
  } catch (err) {
    console.error('Error while posting the customer.', err);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { 
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold },
        { new: true });
    
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
   
    res.send(customer);
  } catch (err) {
    console.error('Error while updating the customer name.', err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
  
    res.send(customer);
  } catch (err) {
    console.error('Error while deleting a customer.', err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
  } catch (err) {
    console.error(`Error while getting customer by id: ${req.params.id}`, err);
  }
});

module.exports = router;