const { accountName, accountKey, containerName } = require('../../../config/azure-storage.config')
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential)
const streamToString = require('../stream-to-string')

module.exports = {
    /** Creates a new block blob, or updates the content of an existing block blob. Updating an existing block blob overwrites any existing metadata on the blob. */
    upload: async (httpFile, blobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blockBlobClient = containerClient.getBlockBlobClient(blobReference)

        const content = httpFile.data
        const uploadBlobResponse = await blockBlobClient.upload(content, content.length)

        return uploadBlobResponse.requestId
    },
    /** Upload a file from your local directory. */
    uploadFile: async (filePath, blobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blockBlobClient = containerClient.getBlockBlobClient(blobReference)

        const uploadBlobResponse = await blockBlobClient.uploadFile(filePath)

        return uploadBlobResponse.requestId
    },
    downloadToBuffer: async (blobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blobClient = containerClient.getBlobClient(blobReference)

        const buffer = await blobClient.downloadToBuffer()

        return buffer
    },
    /** Download a file from Azure Storage and save it to your local directory. */
    downloadToFile: async (blobReference, savePath) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blobClient = containerClient.getBlobClient(blobReference)

        const blobDownloadResponse = await blobClient.downloadToFile(savePath)

        return blobDownloadResponse.requestId
    },
    download: async (blobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blobClient = containerClient.getBlobClient(blobReference)

        // Get blob content from position 0 to the end
        // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
        const downloadBlockBlobResponse = await blobClient.download()
        const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody)

        return downloaded
    },
    /** Copy storage blob to another location within the container.  */
    move: async (fileUrl, newblobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blobClient = containerClient.getBlobClient(newblobReference)
        const response = await blobClient.startCopyFromURL(fileUrl)

        return response
    },
    /** Check if storage blob exists. */
    exists: async (blobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blobClient = containerClient.getBlobClient(blobReference)
        const response = await blobClient.exists()

        return response
    },
    /** Delete storage blob. */
    delete: async (blobReference) => {
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blobClient = containerClient.getBlobClient(blobReference)

        const BlobDeleteIfExistsResponse = await blobClient.deleteIfExists()

        return BlobDeleteIfExistsResponse.succeeded
    }
}