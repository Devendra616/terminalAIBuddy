export function generateFeature(feature, session) {
  return [
    {
      path: `${session.projectName}/app/views/${feature}.py`,
      content: `# ${feature} views\nfrom django.http import HttpResponse\n\ndef ${feature}_view(request):\n    return HttpResponse("${feature} page")`,
    },
    {
      path: `${session.projectName}/app/models/${feature}.py`,
      content: `# ${feature} model\nfrom django.db import models\n\nclass ${capitalize(
        feature
      )}(models.Model):\n    name = models.CharField(max_length=100)`,
    },
  ];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
