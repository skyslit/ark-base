import { defineService, Data, IArkVolume } from "@skyslit/ark-backend";
import Joi from "joi";
import fs from "fs";
import path from "path";
import extract from "extract-zip";
import { useEnv } from "@skyslit/ark-core";
import { exec } from "child_process";
import { glob } from "glob";

async function downloadArchive(archiveId: string) {}

async function importCollection(
  dbConnStr: string,
  collectionName: string,
  filePath: string
) {
  return new Promise<boolean>((resolve, reject) => {
    const BINPATH = useEnv("MONGO_IMPORT_BIN_PATH");
    const importCommand = `${BINPATH} --uri ${dbConnStr} --collection=${collectionName} --file=${filePath}`;
    exec(importCommand, (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

async function uploadBlob(blobRootDir: string, volume: IArkVolume) {
  const files = await glob("**", {
    cwd: blobRootDir,
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory() === true) {
      continue;
    }

    const fullPath = file.fullpath();
    const relativePath = path.relative(blobRootDir, fullPath);

    await new Promise<void>((resolve, reject) => {
      const reader = fs.createReadStream(fullPath);
      const writer = volume.createWriteStream(relativePath);
      reader.on("close", resolve);
      reader.on("error", reject);
      reader.pipe(writer);
    });

    console.log(`Uploaded ${relativePath}`);
  }
}

function extractZip(archiveFilePath: string, outputDir: string) {
  return extract(archiveFilePath, { dir: outputDir });
}

async function cleanup() {}

async function deployDemoArchive(archiveId: string, volume: IArkVolume) {
  try {
    const ARCHIVE_DIR = path.join(__dirname, "../../archive-download");
    const TEMP_DIR = path.join(ARCHIVE_DIR, archiveId);
    const ARCHIVE_FILE_PATH = path.join(TEMP_DIR, "archive");

    await downloadArchive(archiveId);
    console.log("Archive downloaded");

    fs.mkdirSync(TEMP_DIR, { recursive: true });

    await extractZip(ARCHIVE_FILE_PATH, TEMP_DIR);
    console.log("Archive extracted");

    let metaData: any = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "metadata.json"), "utf-8")
    );

    if (!metaData) {
      metaData = {};
    }

    if (!metaData?.dbs) {
      metaData.dbs = [];
    }

    if (!metaData?.mongoCollections) {
      metaData.mongoCollections = [];
    }

    for (const db of metaData.dbs) {
      const { databaseId, databaseEnvVarName } = db;
      if (["MONGO_CONNECTION_STRING"].indexOf(databaseEnvVarName) > -1) {
        const dbConnStr = useEnv(databaseEnvVarName);
        for (const collection of metaData.mongoCollections.filter(
          (c) => c.databaseId === databaseId
        )) {
          const { collectionName, exportFileName, databaseDirName } =
            collection;
          await importCollection(
            dbConnStr,
            collectionName,
            path.join(TEMP_DIR, databaseDirName, exportFileName)
          );
          console.log(`Collection ${collectionName} imported`);
        }
      }
    }

    for (const blob of metaData.blobs) {
      const { blobEnvVarName, blobDirName, wsBucketId } = blob;
      if (["WS_BLOB_BUCKET_ID"].indexOf(blobEnvVarName) > -1) {
        const blobRootDir = path.join(TEMP_DIR, blobDirName, wsBucketId);
        await uploadBlob(blobRootDir, volume);
      }
    }
  } catch (e) {
    await cleanup();
    throw e;
  }
}

export default defineService("deploy-demo-archive", (props) => {
  const { useVolume } = props.use(Data);
  props.defineRule((props) => {
    props.allowPolicy("SUPER_ADMIN");
  });

  props.defineValidator(
    Joi.object({
      archiveId: Joi.string().required(),
    })
  );

  props.defineLogic(async (props) => {
    const { archiveId } = props.args.input;
    const volume = useVolume();
    await deployDemoArchive(archiveId, volume);
    return props.success({ message: "Completed" });
  });
});
