import { defineVolume } from "@skyslit/ark-backend";
import stream from "stream";
import axios from "axios";
import request from "request";

type Option = {
  bucketId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

const BLOB_SERVICE_BASE_URL = "https://compass-services.skyslit.com";

export default (opts: Option) => {
  if (!opts.bucketId) {
    throw new Error(
      "Bucket ID is required to initialise webspace blob service"
    );
  }
  return defineVolume({
    // @ts-ignore
    get: (path) => {
      return new Promise((resolve, reject) => {
        request(
          `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
            opts.bucketId
          }?path=${encodeURIComponent(path)}`,
          {
            method: "GET",
            headers: {
              tenantid: opts.tenantId,
              clientid: opts.clientId,
              clientsecret: opts.clientSecret,
            },
          },
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.body);
            }
          }
        );
      });
    },
    delete: (path) =>
      new Promise((resolve, reject) => {
        request(
          `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
            opts.bucketId
          }?path=${encodeURIComponent(path)}`,
          {
            method: "DELETE",
            headers: {
              tenantid: opts.tenantId,
              clientid: opts.clientId,
              clientsecret: opts.clientSecret,
            },
          },
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
      }),
    put: (path, data) =>
      new Promise<any>((resolve, reject) => {
        let keyToSave: string = path;

        while (keyToSave.startsWith("/")) {
          keyToSave = path.substr(1, keyToSave.length - 1);
        }

        request(
          `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
            opts.bucketId
          }?path=${encodeURIComponent(path)}`,
          {
            method: "POST",
            headers: {
              tenantid: opts.tenantId,
              clientid: opts.clientId,
              clientsecret: opts.clientSecret,
            },
            body: data,
          },
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        );
      }),
    getDownloadHandler: () => [
      (req, res, next) => {
        try {
          let path: string = req.url;

          while (path.startsWith("/")) {
            path = path.substr(1, path.length - 1);
          }

          const r = request(
            `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
              opts.bucketId
            }?path=${encodeURIComponent(path)}`,
            {
              method: "GET",
              headers: {
                tenantid: opts.tenantId,
                clientid: opts.clientId,
                clientsecret: opts.clientSecret,
              },
            },
            (err) => {
              if (err) {
                console.error(err);
              }
            }
          );

          r.pipe(res);
        } catch (e) {
          next();
        }
      },
    ],
    rename: (oldPath, newPath) =>
      new Promise((resolve, reject) => {
        request(
          `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
            opts.bucketId
          }?oldPath=${encodeURIComponent(oldPath)}&newPath=${encodeURIComponent(
            newPath
          )}`,
          {
            method: "PUT",
            headers: {
              tenantid: opts.tenantId,
              clientid: opts.clientId,
              clientsecret: opts.clientSecret,
            },
          },
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );
      }),
    createReadStream(fileName) {
      const pass = new stream.PassThrough();

      const r = request(
        `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
          opts.bucketId
        }?path=${encodeURIComponent(fileName)}`,
        {
          method: "GET",
          headers: {
            tenantid: opts.tenantId,
            clientid: opts.clientId,
            clientsecret: opts.clientSecret,
          },
        },
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );

      r.pipe(pass);

      return pass;
    },
    createWriteStream(fileName) {
      const pass = new stream.PassThrough();

      request(
        `${BLOB_SERVICE_BASE_URL}/blob/api/v1/buckets/${
          opts.bucketId
        }?path=${encodeURIComponent(fileName)}`,
        {
          method: "POST",
          headers: {
            tenantid: opts.tenantId,
            clientid: opts.clientId,
            clientsecret: opts.clientSecret,
          },
          body: pass,
        },
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );

      return pass;
    },
  });
};
