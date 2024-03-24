import fs from 'fs'
import mysql from 'mysql'
import 'dotenv/config'

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
  });

  connection.connect();

  let featuredPaintingSlugs = JSON.stringify(paintingSlugs.sort(() => Math.random() - 0.5).slice(0, 9), null, 2)
  connection.query(`
    UPDATE
      featured_paintings_of_the_week
    SET
      json=IF(updated_at <= NOW() - INTERVAL 7 DAY, '${featuredPaintingSlugs}', json),
        updated_at=IF(updated_at <= NOW() - INTERVAL 7 DAY, NOW(), updated_at)
  `, function (error, results, fields) {
    if (error) console.log(`ERROR: ${error}`)
  })

  connection.query('SELECT `json` FROM featured_paintings_of_the_week LIMIT 1', function (error, results, fields) {
    if (error) console.log(`ERROR: ${error}`)
    featuredPaintingSlugs = results[0].json
  })

  connection.end()

  fs.writeFileSync('featured-painting-slugs.json', featuredPaintingSlugs)

  return 0
}

main()
