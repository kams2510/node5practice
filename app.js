const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('local host port 3000 has started')
    })
  } catch (e) {
    console.log(`error ${e.message}`)

    process.exit(1)
  }
}

initializeDbAndServer()

const convertDetailToMovie = dbList => {
  return {
    movieId: dbList.movie_id,
    directorId: dbList.director_id,
    movieName: dbList.movie_name,
    leadActor: dbList.lead_actor,
  }
}

//api 1

app.get('/movies/', async (request, response) => {
  const api1 = `
    select * from movie ;
  `
  const movieList = await db.all(api1)
  const result = movieList.map(eachMovie => ({
    movieName: eachMovie.movie_name,
  }))
  response.send(result)
})

//api 2
app.post('/movies', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  console.log(directorId)

  const api2 = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES 
    (${directorId},${movieName},${leadActor});
     `
  await db.run(api2)
  response.send('Movie Successfully Added')
})

//api 3
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const api3 = `
    select * from movie 
    where movie_id = ${movieId}
  `
  const movieDetail = await db.get(api3)
  response.send(convertDetailToMovie(movieDetail))
})

//api 4
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body

  const api4 = `
    update movie set(director_id,movie_name,lead_actor) 
    values (${directorId},${movieName},${leadActor}) 
    where movie_id = ${movieId} ;
  ;
  `
})

const convertDirectToNormal = dbList => {
  return {
    directorId: dbList['director_id'],
    directorName: dbList['director_name'],
  }
}

app.get('/directors/', async (request, response) => {
  const api5 = `
    select * from director ;
  `
  const directorList = await db.all(api5)
  response.send(
    directorList.map(each => {
      convertDirectToNormal(each)
    }),
  )
})
module.exports = app
