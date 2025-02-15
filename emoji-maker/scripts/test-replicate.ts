import Replicate from "replicate";
import { writeFile } from "node:fs/promises";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  // Initialize Replicate with API token
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // Define the input exactly as in the example
  const input = {
    prompt: "A TOK emoji of a man",
    apply_watermark: false
  };

  console.log('Starting generation with input:', input);

  // Run the model exactly as in the example
  const output = await replicate.run(
    "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
    { input }
  );

  console.log('Got output:', output);

  // Save files exactly as in the example
  for (const [index, item] of Object.entries(output)) {
    const filename = `output_${index}.png`;
    console.log('itme content:', item);
    await writeFile(filename, item);
    console.log(`Written: ${filename}`);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 