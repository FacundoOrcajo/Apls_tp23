const db = require("../database/models");
const sequelize = db.sequelize;

const genresController = { 
    list: async (req, res) => {
      /*   db.Genre.findAll()  
              .then(genres => {
                  res.render('genresList.ejs', {genres})
              })
              .catch(error => console.log(error)) */
  
      try {
        let {order = "id"} = req.query;
        let orders = ["id", "name", "ranking"];
  
        if (!orders.includes(order)) {
       
          throw new Error(`El campo ${order} no existe!!: [name, ranking]`);
        }
  
        let genres = await db.Genre.findAll({
          order: [order],
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        });
        if (genres.length) {
          return res.status(200).json({
            ok: true,
            meta: {
              total: genres.length,
            },
            data: genres,
          });
        }
        throw new Error("Upss, hubo un error");
      } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
          ok: false,
          msg: error.message
            ? error.message
            : "Comuníquise con el administrador del sitio",
        });
      }
    },
    detail: async (req, res) => {
     try{
      const {id} = req.params;
     if (isNaN(id)) {
        throw new Error("El Id debe ser un número!!!")
     } 
        let genre = await db.Genre.findByPk(id,{
          attributes:{
              exclude : ["created_at", "updated_at"]
          }
        })
        if (genre) {
          return res.status(200).json({
            ok: true,
            meta: {
              total: 1,
            },
            data: genre
          })
        }
        throw new Error("Upss, no se encuentra el género");
     } catch(error){
      console.log(error);
        return res.status(500).json({
          ok: false,
          msg: error.message
            ? error.message
            : "Comuniquise con el administrador del sitio",
        });
     }
    },
  };
  
  module.exports = genresController;