import { defineVolume } from "@skyslit/ark-backend";
import AWS from "aws-sdk";
import stream from "stream";

// const s3 = new AWS.S3();

type S3VolOption = {
  ACL: "private" | "public-read";
  Bucket: string;
};

export default (opts: S3VolOption) =>
  defineVolume({
    // @ts-ignore
    get: (path) => {
      return new Promise<any>((resolve, reject) => {
        const s3 = new AWS.S3();
        s3.getObject({
          Bucket: opts.Bucket,
          Key: path,
        })
          .promise()
          .then((v) => {
            // @ts-ignore
            return Buffer.from(v.Body.toString("base64"));
          })
          .catch(reject);
      });
    },
    delete: (path) =>
      new Promise((resolve, reject) => {
        const s3 = new AWS.S3();
        s3.deleteObject({
          Bucket: opts.Bucket,
          Key: path,
        })
          .promise()
          .then(() => resolve(true))
          .catch(reject);
      }),
    put: (path, data) =>
      new Promise<AWS.S3.ManagedUpload.SendData>((resolve, reject) => {
        let keyToSave: string = path;
        const s3 = new AWS.S3();

        while (keyToSave.startsWith("/")) {
          keyToSave = path.substr(1, keyToSave.length - 1);
        }
        const fileToUpload: AWS.S3.PutObjectRequest = {
          ACL: opts.ACL,
          Bucket: opts.Bucket,
          Key: keyToSave,
          Body: data,
        };

        s3.upload(fileToUpload, {})
          .promise()
          .then((v) => {
            resolve(v);
          })
          .catch(reject);
      }),
    getDownloadHandler: () => [
      (req, res, next) => {
        try {
          let path: string = req.url;

          while (path.startsWith("/")) {
            path = path.substr(1, path.length - 1);
          }
          const s3 = new AWS.S3();
          s3.getObject({
            Bucket: opts.Bucket,
            Key: path,
          })
            .createReadStream()
            .on("error", () => {
              next();
            })
            .pipe(res);
        } catch (e) {
          next();
        }
      },
    ],
    rename: (oldPath, newPath) =>
      new Promise((resolve, reject) => {
        const s3 = new AWS.S3();
        s3.copyObject({
          Bucket: opts.Bucket,
          ACL: opts.ACL,
          CopySource: oldPath,
          Key: newPath,
        })
          .promise()
          .then((v) =>
            s3
              .deleteObject({
                Bucket: opts.Bucket,
                Key: oldPath,
              })
              .promise()
              .then(() => resolve(true))
          )
          .catch(reject);
      }),
    createReadStream(fileName) {
      const s3 = new AWS.S3();
      return s3
        .getObject({
          Bucket: opts.Bucket,
          Key: fileName,
        })
        .createReadStream();
    },
    createWriteStream(fileName) {
      const pass = new stream.PassThrough();
      let keyToSave: string = fileName;
      const s3 = new AWS.S3();

      while (keyToSave.startsWith("/")) {
        keyToSave = fileName.substr(1, keyToSave.length - 1);
      }
      const fileToUpload: AWS.S3.PutObjectRequest = {
        ACL: opts.ACL,
        Bucket: opts.Bucket,
        Key: keyToSave,
        Body: pass,
      };

      s3.upload(fileToUpload, {}, (err, data) => {
        if (err) {
          console.error(err);
        }
      });
      return pass;
    },
  });
