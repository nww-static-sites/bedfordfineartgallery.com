import fs from 'fs'
import mysql from 'mysql'
import 'dotenv/config'

function connect(connection) {
  return new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

function query(connection, sql, values = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) {
        reject(error)
        return
      }

      resolve(results)
    })
  })
}

function end(connection) {
  return new Promise((resolve) => {
    connection.end(() => resolve())
  })
}

async function main() {
  const paintingsDir = fs.opendirSync('cms/paintings')
  const paintingSlugs = []

  let dirent
  while ((dirent = paintingsDir.readSync()) !== null) {
    console.log(`Processing: ${dirent.name}`)
    const painting = JSON.parse(fs.readFileSync(`cms/paintings/${dirent.name}`))
    if (painting.status !== 'Sold') {
      paintingSlugs.push(painting.slug)
    }
  }

  paintingsDir.closeSync()

  const connection = mysql.createConnection({
    host     : process.env.BEDFORD_HOST,
    user     : process.env.BEDFORD_USER,
    password : process.env.BEDFORD_PASSWORD,
    database : process.env.BEDFORD_DATABASE,
    connectTimeout: 10000,
  });

  let featuredPaintingSlugs = JSON.stringify(paintingSlugs.sort(() => Math.random() - 0.5).slice(0, 9), null, 2)

  try {
    await connect(connection)

    await query(connection, `
      UPDATE
        featured_paintings_of_the_week
      SET
        json=IF(updated_at <= NOW() - INTERVAL 7 DAY, ?, json),
          updated_at=IF(updated_at <= NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 20 MINUTE, updated_at)
    `, [featuredPaintingSlugs])

    const results = await query(connection, 'SELECT `json` FROM featured_paintings_of_the_week LIMIT 1')

    if (results[0]?.json) {
      featuredPaintingSlugs = results[0].json
    }
  } catch (error) {
    console.log(`WARN: Could not refresh featured painting slugs from database; using generated fallback. ${error}`)
  } finally {
    await end(connection)
  }

  fs.writeFileSync('featured-painting-slugs.json', featuredPaintingSlugs)

  return 0
}

main()
