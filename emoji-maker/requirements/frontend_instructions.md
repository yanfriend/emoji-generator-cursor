# Project overview
Use this guide to build a web app where users can give a text prompt to generate emojis using a model hosted on Replicate.

# Feature requirements
- We will use Next.js, Shadcn, Lucid, Supabase, Clerk.
- Create a form where users can input a text prompt, and click on a button that calls the Replicate model to generate an emoji.
- Have a nice UI and animation when the emoji is blank or generating.
- Display all the emojis generated in a grid.
- When hovering over an emoji image, an icon button for downloading the emoji, and an icon button for liking the emoji should appear.

# Relavant docs
## How to use Replicate emoji generator models
import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "A TOK emoji of a man",
    apply_watermark: false
};

const output = await replicate.run("fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e", { input });

import { writeFile } from "node:fs/promises";
for (const [index, item] of Object.entries(output)) {
  await writeFile(`output_${index}.png`, item);
}

# Current file structure
EMOJI-MAKER/
├── .next/
├── app/
├── components/
├── lib/
├── node_modules/
├── public/
├── requirements/
│   ├── backend_instructions.md
│   └── frontend_instructions.md
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

# Rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified.
- All new pages go in /app.
