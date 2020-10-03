const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//////////////Favorite Router//////////////////////////////
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
Favorite.find()
    .populate('campsites')
    .populate('user')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })

    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            req.body.forEach((favs) => {
                if (!favorite.campsites.includes(favs._id)) {
                    favorite.campsites.push(favs._id);
                }
            });
            favorite.save()
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch((err) => next(err));
        } else {
            Favorite.create({ user: req.user._id, campsites: req.body })
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
res.statusCode = 403;
res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
Favorite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});


////////////// Individual Favorite Router///////////////////
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (favorite) {
                req.body.forEach((favs) => {
                    if (!favorite.campsites.includes(favs._id)) {
                        favorite.campsites.push(favs._id);
                    }
                });
                favorite.save()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch((err) => next(err));
            } else {
                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId]})
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                    .catch((err) => next(err));
            }
        })                
        .catch((err) => next(err));
    })
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        console.log(`User ID Checking ${req.user._id}`)
        Favorite.findOne({user:req.user._id})
            .then((favorite) => {
                if (favorite) {
                    const index = favorite.campsites.indexOf(req.params.campsiteId);
                    console.log(`Campsite Id Checking: ${req.params.campsiteId}`)
                    if (index >= 0) {
                        favorite.campsites.splice(index, 1);
                        favorite.save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(favorite);
                            })
                            .catch((err) => next(err))
                    } else {
                        res.statusCode = 200
                        res.end(`The campsite ${req.params.campsiteId} doesn't exist in the favorites list.`)
                    }
                } else {
                    res.statusCode = 200
                    res.end(`The campsite ${req.params.campsiteId} has no favorites to delete`)
                }
            })
            .catch((err) => next(err));
});

module.exports = favoriteRouter;