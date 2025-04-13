export function generateFeature(feature, session) {
  return [
    {
      path: `${session.projectName}/app/routes/${feature}.py`,
      content: `# ${feature} routes\nfrom flask import Blueprint\n\n${feature}_bp = Blueprint("${feature}", __name__)\n\n@${feature}_bp.route("/")\ndef ${feature}_index():\n    return "${feature} page"`,
    },
    {
      path: `${session.projectName}/app/models/${feature}.py`,
      content: `# ${feature} model\nfrom app import db\n\nclass ${capitalize(
        feature
      )}(db.Model):\n    id = db.Column(db.Integer, primary_key=True)`,
    },
  ];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
