export function generateFeature(feature, session) {
  // Example placeholder logic
  return [
    {
      path: `${session.projectName}/backend/routes/${feature}.routes.js`,
      content: `// ${feature} routes\n\nconst express = require("express");\nconst router = express.Router();\n\n// TODO: Add ${feature} endpoints\n\nmodule.exports = router;\n`,
    },
    {
      path: `${session.projectName}/backend/schema/${feature}.model.js`,
      content: `// ${feature} model\n\nconst mongoose = require("mongoose");\n\nconst ${capitalize(
        feature
      )}Schema = new mongoose.Schema({\n  // Define schema here\n});\n\nmodule.exports = mongoose.model("${capitalize(
        feature
      )}", ${capitalize(feature)}Schema);`,
    },
    {
      path: `${session.projectName}/frontend/pages/${capitalize(feature)}.jsx`,
      content: `// ${feature} page\n\nexport default function ${capitalize(
        feature
      )}Page() {\n  return <div>${feature} page coming soon!</div>;\n}`,
    },
  ];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
