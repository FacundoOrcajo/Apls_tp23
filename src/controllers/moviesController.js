const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    list: async (req, res) => {
   
      try{
         let {order = "id"} = req.query;
        let orders = ["id","title","rating","awards","release_date"];
  
        if (!orders.includes(order)) {
          throw new Error(`El campo ${order} no existe!!: [title, rating,"awards","release_date"]`);
        } 
       
          let movies = await db.Movie.findAll({
            include:[
              {
                association : "genre",
                attributes : ["name"]
              }
            ],
              orde: [order],
              attributes:{
                  exclude : ["created_at", "updated_at"]
              }
            })
            if (movies.length) {
              return res.status(200).json({
                ok: true,
                meta: {
                  total: movies.length,
                },
                data: movies,
              });
            }
            throw new Error("Upss, hubo un error");
  
      } catch (error){
          console.log(error);
          return res.status(500).json({
            ok: false,
            msg: error.message
              ? error.message
              : "Comuniquise con el administrador del sitio",
          });
      }
    },
    detail: async (req, res) => {
  let error
      try{
        const {id} = req.params;
        if (isNaN(id)) {
          error = new Error("El Id debe ser un número!!!")
          error.status = 403;
          throw error;
        }
        let movie = await db.Movie.findByPk(id,{
              attributes:{
                exclude: ["created_at", "updated_at"]
              }
        })
        if (movie) {
          return res.status(200).json({
            ok:true,
            meta: {
              total: 1,
            },
            data: movie
          })
        }
        error = new Error("Upss, no se encuentra la peliculas");
        error.status = 403;
        throw error;
  
      } catch (error){
          console.log(error);
          return res.status(error.status || 500).json({
              ok: false,
              msg: error.message
              ? error.message
              : "Comuniquise con el administrador del sitio",
          })
      }
    },
    newest: async (req, res) => {
      let error
      try{
         let movies = await  db.Movie.findAll({
          order: [["release_date", "DESC"]],
          limit: +req.query.limit || 5,
        });
        if (movies.length) {
          return res.status(200).json({
            ok : true,
            meta : {
              total : movies.length
            },
            data : movies
          })
        };
        error = new Error("Upss, mo hay pelicula");
        error.status = 403;
        throw error;
      }
      catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
            ok: false,
            msg: error.message
            ? error.message
            : "Comuniquise con el administrador del sitio",
        });        
      }    
    },
    recomended: async (req, res) => {
      let error;
      try{
       let movies = await db.Movie.findAll({
          include: ["genre"],
          limit : +req.query.limit || 5,
          order: [["rating", "DESC"]],
        });
        if (movies.length) {
          return res.status(200).json({
            ok : true,
            meta : {
              total : movies.length
            },
            data : movies
          })
        };
        error = new Error("Upss, mo hay pelicula");
        error.status = 403;
        throw error;
      } catch(error){
        console.log(error);
        return res.status(error.status || 500).json({
            ok: false,
            msg: error.message
            ? error.message
            : "Comuniquise con el administrador del sitio",
        });
      }
     
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
  
    create: async (req, res) => {
      const {title,rating,awards,release_date,length,genre_id} = req.body;
      try {
       let newMovie = await db.Movie.create({
          title: title && title.trim(),
          rating: rating,
          awards: awards,
          release_date: release_date,
          length: length,
          genre_id: genre_id
        })
        if (newMovie) {
          return res.status(200).json({
            ok : true,
            meta : {
              total : 1,
              url :`${req.protocol}://${req.get("host")}/movies/${newMovie.id}`
            },
            data : newMovie
          })
        };
      } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
            ok: false,
            msg: error.message
            ? error.message
            : "Comuniquise con el administrador del sitio",
        });
      }    
    },
    edit: function (req, res) {
      let movieId = req.params.id;
      let promMovies = Movies.findByPk(movieId, { include: ["genre", "actors"] });
      let promGenres = Genres.findAll();
      let promActors = Actors.findAll();
      Promise.all([promMovies, promGenres, promActors])
        .then(([Movie, allGenres, allActors]) => {
          Movie.release_date = moment(Movie.release_date).format("L");
          return res.render(
            path.resolve(__dirname, "..", "views", "moviesEdit"),
            { Movie, allGenres, allActors }
          );
        })
        .catch((error) => res.send(error));
    },
    update: function (req, res) {
      let movieId = req.params.id;
      Movies.update(
        {
          title: req.body.title,
          rating: req.body.rating,
          awards: req.body.awards,
          release_date: req.body.release_date,
          length: req.body.length,
          genre_id: req.body.genre_id,
        },
        {
          where: { id: movieId },
        }
      )
        .then(() => {
          return res.redirect("/movies");
        })
        .catch((error) => res.send(error));
    },
    delete: function (req, res) {
      let movieId = req.params.id;
      Movies.findByPk(movieId)
        .then((Movie) => {
          return res.render(
            path.resolve(__dirname, "..", "views", "moviesDelete"),
            { Movie }
          );
        })
        .catch((error) => res.send(error));
    },
    destroy: function (req, res) {
      let movieId = req.params.id;
      Movies.destroy({ where: { id: movieId }, force: true })
        .then(() => {
          return res.redirect("/movies");
        })
        .catch((error) => res.send(error));
    },
  };
  
  module.exports = moviesController;