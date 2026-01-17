import { connection, db } from "./db";
import { materials } from "./schema";

async function main() {
  console.log("Seeding started...");

  await db.delete(materials);

  await db
    .insert(materials)
    .values([
      {
        code: "pla",
        name: "PLA",
        price: "0.08",
        leadTimeDays: 3,
        properties: ["Standard prototyping", "Biodegradable"],
      },
      {
        name: "ABS",
        code: "abs",
        price: "0.12",
        leadTimeDays: 3,
        properties: ["Heat resistant", "Good mechanical strength"],
      },
      {
        name: "Nylon PA12",
        code: "pa12",
        price: "0.28",
        leadTimeDays: 3,
        properties: ["Industrial grade", "High wear resistance"],
      },
      {
        name: "Polypropylene",
        code: "pp",
        price: "0.18",
        leadTimeDays: 7,
        properties: ["Chemical resistant", "Living hinges"],
      },
      {
        name: "TPU 95A",
        code: "tpu",
        price: "0.22",
        leadTimeDays: 5,
        properties: ["Flexible", "Impact resistant"],
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seeding failed");
    console.error(e);
  })
  .finally(async () => {
    await connection.end();
  });
