import { app, initDb } from "./src/app.js"

const PORT = process.env.PORT || 4000

await initDb()

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
