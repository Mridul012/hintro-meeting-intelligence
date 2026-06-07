import { swaggerSpec } from "../src/docs/swagger"
import * as fs from "fs"
import * as path from "path"

const outputPath = path.join(process.cwd(), "src", "swagger.json")
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))
console.log("Swagger spec written to src/swagger.json")
