const azure = require('azure-storage');
module.exports = function(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  if (req.query.name) {
    const blobService = azure.createBlobService(
      process.env['BLOB_CONN_STRING']
    );
    const containerName = 'images';
    const blobName = req.query.name;
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 100);
    startDate.setMinutes(startDate.getMinutes() - 100);

    const sharedAccessPolicy = {
      AccessPolicy: {
        Permissions:
          azure.BlobUtilities.SharedAccessPermissions.READ |
          azure.BlobUtilities.SharedAccessPermissions.WRITE |
          azure.BlobUtilities.SharedAccessPermissions.CREATE,
        Start: startDate,
        Expiry: expiryDate
      }
    };

    const token = blobService.generateSharedAccessSignature(
      containerName,
      blobName,
      sharedAccessPolicy
    );
    const sasUrl = blobService.getUrl(containerName, blobName, token);

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: sasUrl
    };
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
  }

  context.done();
};
