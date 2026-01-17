import { geometryContract } from "@/shared/contract";
import { generateOpenApi } from "@ts-rest/open-api";
import * as fs from "fs";
import * as path from "path";

const openApiDocument = generateOpenApi(geometryContract, {
  info: {
    title: "My API Service",
    version: "1.0.0",
    description: "API description generated from ts-rest contract",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
});

const outputPath = path.join(__dirname, "../openapi.json");

fs.writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));

console.log(`✅ OpenAPI spec generated successfully at ${outputPath}`);
